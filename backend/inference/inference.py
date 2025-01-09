from fastapi import APIRouter, Request
from pydantic import BaseModel
import logging
import os
from ffmpy import FFmpeg
import tempfile

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


# TODO Unfinished
@transcription_router.get("/subtitle")
def subtitle(paths, model, modelSize, embed, outputFormats, overwrite, language="auto"):
    generator = load_source('generateSubtitle', f'./inference/{model}/api.py')
    for path in paths:
        subs = pysubs2.load_from_whisper(generator.generateSubtitle(path, modelSize, language))
        for format in outputFormats:
            # TODO Properly name subtitle
            subs.save(f"test.{format}")
        if embed:
            ff = None
            if overwrite:

                # TODO properly add subtitle name
                if path.split(".")[-1] == "mp4":
                    ff = FFmpeg(
                        inputs={path: None},
                        outputs={path: f'-y -f ass -i {"test.ass"} -map 0:0 -map 0:1 -map 1:0 -c:v copy -c:a copy -c:s mov_text'}
                    )

                elif path.split(".")[-1] == "mkv":
                    # TODO ADD MKV specific code
                    ff = FFmpeg(
                        inputs={path: None},
                        outputs={path: '-y'}
                    )
            else:
                # TODO properly add subtitle name
                if path.split(".")[-1] == "mp4":
                    ff = FFmpeg(
                        inputs={path: None},
                        outputs={path: f'-n -f ass -i {"test.ass"} -map 0:0 -map 0:1 -map 1:0 -c:v copy -c:a copy -c:s mov_text'}
                    )

                elif path.split(".")[-1] == "mkv":
                    # TODO ADD MKV specific code
                    ff = FFmpeg(
                        inputs={path: None},
                        outputs={path: '-n'}
                    )

            # TODO Test if command matches
            print(ff.cmd())

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


class TranscriptionRequest(BaseModel):
    filePaths: list
    model: str
    modelSize: str
    language: str
    embedSubtitles: bool
    outputFormats: list


@transcription_router.post("/testRequest")
def test_request(req: TranscriptionRequest):
    print(req)
    return req


@transcription_router.post("/dummypath")
async def get_body(request: Request):
    temp = await request.json()
    print(temp)
    return temp
