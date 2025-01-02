from fastapi import APIRouter, Request
import logging
import os
# import ffmpeg
import tempfile

import importlib.util
import importlib.machinery
import sys

from config import Settings
from time import sleep


interrupt = False
def load_source(modname, filename):
    loader = importlib.machinery.SourceFileLoader(modname, filename)
    spec = importlib.util.spec_from_file_location(modname, filename, loader=loader)
    module = importlib.util.module_from_spec(spec)

    sys.modules[module.__name__] = module  # Cache the module in sys.modules
    loader.exec_module(module)
    return module


transcription_router = APIRouter(tags=["Transcription"])


def extractAudio(path):
    temp_dir = tempfile.gettempdir()

    audio_paths = {}

    print(f"Extracting audio from {filename(path)}...")
    output_path = os.path.join(temp_dir, f"{filename(path)}.wav")

    ffmpeg.input(path).output(
        output_path,
        acodec="pcm_s16le", ac=1, ar="16k"
    ).run(quiet=True, overwrite_output=True)

    return audio_paths


@transcription_router.get("/models", responses={200: {"description": "Success"}, 404: {"description": "Not Found"}})
def inference(data, current_model="general_insects"):
    # Get the prediction from the model
    model = load_source('predict', f'/{current_model}/model.py')
    prediction = model.inference(data)

    return prediction

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