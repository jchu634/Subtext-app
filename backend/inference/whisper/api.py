import whisper


def getModels():
    return whisper.available_models()


def supportedFormats():
    return ["mp3", "mp4", "mpeg", "mpga", "m4a", "wav", "webm"]


def generateSubtitle(path, model, language):
    if language == "en" and model in ["tiny", "base", "small", "medium",]:
        model = model + ".en"
    model = whisper.load_model(model)
    return model.transcribe(path, language=language)
