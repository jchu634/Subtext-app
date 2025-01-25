from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
import logging
import os
import subprocess
from pathlib import Path
from ffmpy import FFmpeg, FFprobe
from platformdirs import user_downloads_dir, user_data_dir

import importlib.util
import importlib.machinery
import sys

import base64
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.exceptions import InvalidSignature

from config import Settings
from time import sleep
import pysubs2


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

    sys.modules[module.__name__] = module  # Cache the module in sys.modules
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
def getsupportedLanguages(model):
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


@transcription_router.post("/transcribe")
def transcribe(req: TranscriptionRequest):
    print(req)
    try:
        generator = load_source('generateSubtitle', os.path.join(".", "inference", req.model, "api.py"))
    except (FileSignatureError, PublicKeyError) as e:
        raise HTTPException(status_code=500, detail=e.args[0])

    unprocessables = []
    for path in req.filePaths:
        subs = pysubs2.load_from_whisper(generator.generateSubtitle(path, req.modelSize, req.language))
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
                continue
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

    return {200, "OK"}


## Test ##


@transcription_router.get("/testWhile")
def test():
    count = 0
    while Settings.testEnable:
        print(f"This is running, count={count}")
        count += 1
        sleep(10)
    print("This Stopped Running")
    Settings.testEnable = True
    return 1


@transcription_router.get("/test")
def test_interrupt():
    Settings.testEnable = False
    return 1


@transcription_router.post("/dummypath")
async def get_body(request: Request):
    temp = await request.json()
    print(temp)
    return temp
