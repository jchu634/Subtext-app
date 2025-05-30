from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from fastapi.responses import ORJSONResponse
from sse_starlette import EventSourceResponse
from pydantic import BaseModel

from pathlib import Path
from ffmpy import FFmpeg, FFprobe
from platformdirs import user_downloads_dir, user_data_dir

import os
import subprocess
import asyncio
import threading
import importlib.util
import importlib.machinery

import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.exceptions import InvalidSignature

from config import Settings
import pysubs2
import uuid
import json

# --- Globals ---
tqdm_patch_lock = threading.Lock()
# ---


class PublicKeyError(Exception):
    """Raised when there are problems with the public key  """


class FileSignatureError(Exception):
    """Raised when there are problems related to the file signature """


def verify_file(public_key, file_path):
    # Read file data
    with open(file_path, 'rb') as f:
        file_data = f.read()

    # Read signature
    sig_path = str(file_path) + '.sig'
    with open(sig_path, 'rb') as f:
        signature = base64.b64decode(f.read())

    # Calculate file digest
    hasher = hashes.Hash(hashes.SHA256())
    hasher.update(file_data)

    # Verify signature
    try:
        public_key.verify(
            signature,
            file_data,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        verified = True
    except InvalidSignature:
        verified = False
    return verified


def load_source(modname, filename):
    if not Settings.allowUnsignedCode:
        if not Settings.publicKey:
            raise PublicKeyError("The application is missing its public key")
        else:
            if os.path.exists(filename + ".sig"):
                if not verify_file(Settings.publicKey, filename):
                    raise FileSignatureError("Signature check failed")
            else:
                raise FileSignatureError("Signature file is missing")

    loader = importlib.machinery.SourceFileLoader(modname, filename)
    spec = importlib.util.spec_from_file_location(modname, filename, loader=loader)
    module = importlib.util.module_from_spec(spec)

    # sys.modules[module.__name__] = module  # Cache the module in sys.modules
    loader.exec_module(module)
    return module


transcription_router = APIRouter(tags=["Transcription"])


@transcription_router.get("/available_models")
def getModels():
    return [a for a in os.listdir("./inference/") if os.path.isdir("./inference/" + a) and a != "__pycache__"]


@transcription_router.get("/supported_formats")
def getSupportedFormats(model):
    try:
        getFormats = load_source('supportedFormats', f'./inference/{model}/api.py')
        return getFormats.supportedFormats()
    except (FileSignatureError, PublicKeyError) as e:
        raise HTTPException(status_code=500, detail=e.args[0])


@transcription_router.get("/supported_languages")
def getSupportedLanguages(model):
    try:
        getLanguages = load_source('supportedLanguages', f'./inference/{model}/api.py')
        return getLanguages.supportedLanguages()
    except (FileSignatureError, PublicKeyError) as e:
        raise HTTPException(status_code=500, detail=e.args[0])


@transcription_router.get("/supported_model_sizes")
def getModelSizes(model):
    try:
        getSizes = load_source('getModels', f'./inference/{model}/api.py')
        return getSizes.getModels()
    except (FileSignatureError, PublicKeyError) as e:
        raise HTTPException(status_code=500, detail=e.args[0])


class TranscriptionRequest(BaseModel):
    filePaths: list[str]
    model: str
    modelSize: str
    language: str
    embedSubtitles: bool
    overWriteFiles: bool
    outputFormats: list[str]
    saveLocation: str


async def transcribeWorker(path, task_id: str, req: TranscriptionRequest):
    loop = asyncio.get_running_loop()

    unique_modname = f"inference_api_{req.model.replace('(', '_').replace(')', '')}_{task_id}"
    api_module_path = os.path.join(".", "inference", req.model, "api.py")

    generator_module = load_source(unique_modname, api_module_path)

    unprocessables = []
    try:
        success, message = await asyncio.to_thread(
            generator_module.generateSubtitle,
            path,
            req.modelSize,
            req.language,
            task_id,
            Settings.broadcast,
            loop,
            tqdm_patch_lock
        )
        if success:
            subs = pysubs2.load_from_whisper(message)
            assLocation = ""
            for format in req.outputFormats:
                baseLocation = os.path.join(user_downloads_dir(), Path(
                    path).stem) if req.saveLocation == "default" else os.path.join(req.saveLocation, Path(path).stem)

                match format.lower():
                    case "mpl2":
                        subs.save(f"{baseLocation}(mpl2).txt", format_="mpl2")
                    case "tmp":
                        subs.save(f"{baseLocation}(tmp).txt", format_="tmp")
                    case "microdvd":
                        ffprobe_cmd = FFprobe(
                            inputs={path: None},
                            global_options=[
                                "-v", "0",                               # Suppress all output except for errors
                                "-of", "csv=p=0",                        # Output format as plain CSV without headers
                                "-select_streams", "v:0",                # Select the first video stream
                                "-show_entries", "stream=r_frame_rate",  # Show only the frame rate
                            ]
                        )
                        fps_ratio = subprocess.check_output(ffprobe_cmd.cmd, shell=True).decode().strip()
                        num, denom = map(int, fps_ratio.split('/'))
                        fps = num / denom
                        subs.save(f"{baseLocation}(microdvd).sub", format_="microdvd", fps=fps)
                    case "ass":
                        subs.save(f"{baseLocation}.ass")
                        assLocation = f"{baseLocation}.ass"
                    case "webvtt":
                        subs.save(f"{baseLocation}.vtt")
                    case _:
                        subs.save(f"{baseLocation}.{format.lower()}")

            if req.embedSubtitles:
                if assLocation == "":
                    save_dir = user_data_dir(Settings.appName, Settings.appAuthor)
                    os.makedirs(save_dir, exist_ok=True)
                    assLocation = os.path.join(save_dir, f"{Path(path).stem}.ass")
                    subs.save(assLocation)

                ff = None
                outPath = os.path.join(user_downloads_dir(), f'{Path(path).stem}(Subtitled){os.path.splitext(path)[1]}')
                counter = 1
                while os.path.exists(outPath):
                    outPath = f'{user_downloads_dir()}\\{Path(path).stem}(Subtitled)[{counter}]{os.path.splitext(path)[1]}'
                    counter += 1

                if os.path.splitext(path)[1] == ".mp4":
                    ff = FFmpeg(
                        inputs={path: None},
                        outputs={
                            f"{outPath}": f"-y -f ass -i '{assLocation}' -map 0:0 -map 0:1 -map 1:0 -c:v copy -c:a copy -c:s mov_text"
                        }

                    )
                elif os.path.splitext(path)[1] == ".mkv":

                    ff = FFmpeg(
                        inputs={path: None},
                        outputs={
                            f"{outPath}": f"-y -f ass -i '{assLocation}' -map 0:0 -map 0:1 -map 1:0 -c:v copy -c:a copy -c:s ass"
                        }
                    )
                else:
                    unprocessables.append((path, "Unable to embed subtitles into this file format"))
                    return False, "Unable to embed subtitles into this file format"
                if req.overWriteFiles:
                    try:
                        os.replace(outPath, path)
                    except FileNotFoundError:
                        print(f"Error: Source file {outPath} not found")
                    except PermissionError:
                        print(f"Error: Permission denied when trying to replace {path}")
                    except OSError as e:
                        print(f"Error replacing file: {e}")

                print(ff.cmd)
                ff.run()
            return True, "Success"
        else:
            print(f"Task {task_id}: Transcription failed for {path} with message: {message}")
            error_event = json.dumps({
                "type": "status",
                "status": "ERROR",
                "message": f"Transcription error for {Path(path).name}: {message}"
            })
            await Settings.broadcast.publish(channel=task_id, message=error_event)
    except Exception as e:
        print(f"Task {task_id}: Error during transcription: {e}")
        error_message = json.dumps({
            "type": "status",
            "status": "ERROR",
            "message": f"Error processing file {Path(path).name}: {str(e)}"
        })
        await Settings.broadcast.publish(channel=task_id, message=error_message)


@transcription_router.post("/transcribe")
def transcribe(background_tasks: BackgroundTasks, req: TranscriptionRequest):
    print(req)

    task_id = str(uuid.uuid4())
    for path in req.filePaths:
        background_tasks.add_task(transcribeWorker, path, task_id, req)

    final_message = json.dumps({
        "type": "status",
        "status": "DONE",
    })

    background_tasks.add_task(Settings.broadcast.publish, channel=task_id, message=final_message)
    print(f"Scheduled transcription task with ID: {task_id}")

    return ORJSONResponse([{"task_id": task_id}], status_code=202)


@transcription_router.put("/toggle_multi_job")
def enable_multi_job(toggle: bool):
    Settings.enable_multi_job = toggle
    return ORJSONResponse({"message": "ok"}, status_code=200)


@transcription_router.get("/progress/{task_id}")
async def progress_stream(request: Request, task_id: str):
    """
    SSE endpoint to stream progress updates for a given task_id.
    """
    print(f"SSE connection requested for task: {task_id}")

    async def event_generator():
        async with Settings.broadcast.subscribe(channel=task_id) as subscriber:
            print(f"SSE subscribed to channel: {task_id}")
            try:
                if await request.is_disconnected():
                    print(f"SSE client for {task_id} disconnected immediately.")
                    return

                async for event in subscriber:
                    message_data = event.message
                    # print(f"SSE sending for {task_id}: {message_data}") # Debug
                    yield {"data": message_data}

                    if await request.is_disconnected():
                        print(f"SSE client for {task_id} disconnected.")
                        break

                    try:
                        # Check for final status message to close stream gracefully
                        payload = json.loads(message_data)
                        if payload.get("type") == "status" and payload.get("status") in ["DONE", "ERROR"]:
                            print(f"SSE received terminal status for {task_id}, closing stream.")
                            break
                    except json.JSONDecodeError:
                        pass  # Ignore non-JSON messages if any

            except asyncio.CancelledError:
                print(f"SSE connection for {task_id} cancelled/closed.")
                raise
            finally:
                print(f"SSE finished for task: {task_id}")

    return EventSourceResponse(event_generator())
