from fastapi import APIRouter, Request
from pydantic import BaseModel
import logging
import os
import subprocess
from pathlib import Path
from ffmpy import FFmpeg, FFprobe
import tempfile
from platformdirs import user_downloads_dir, user_data_dir

import importlib.util
import importlib.machinery
import sys

from config import Settings
from time import sleep
import pysubs2


def load_source(modname, filename):
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
    getFormats = load_source('supportedFormats', f'./inference/{model}/api.py')
    return getFormats.supportedFormats()


@transcription_router.get("/supported_languages")
def getsupportedLanguages(model):
    getLanguages = load_source('supportedLanguages', f'./inference/{model}/api.py')
    return getLanguages.supportedLanguages()


@transcription_router.get("/supported_model_sizes")
def getModelSizes(model):
    getSizes = load_source('getModels', f'./inference/{model}/api.py')
    return getSizes.getModels()


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
    generator = load_source('generateSubtitle', os.path.join(".", "inference", req.model, "api.py"))
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
                assLocation = os.path.join(user_data_dir(
                    Settings.appName, Settings.appAuthor), f"{Path(path).stem}.ass")
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
