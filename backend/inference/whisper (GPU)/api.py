import whisper


def getModels():
    return whisper.available_models()
# var modelSizes = [
#   { modelName: "tiny", suggestedVRAM: 1 },
#   { modelName: "base", suggestedVRAM: 1 },
#   { modelName: "small", suggestedVRAM: 2 },
#   { modelName: "medium", suggestedVRAM: 5 },
#   { modelName: "large", suggestedVRAM: 10 },
#   { modelName: "turbo", suggestedVRAM: 6 },
# ];


def supportedFormats():
    return ["mp3", "mp4", "mpeg", "mpga", "m4a", "wav", "webm"]


def generateSubtitle(path, model, language):
    
    if language == "en" and model in ["tiny", "base", "small", "medium",]:
        model = model + ".en"
    model = whisper.load_model(model, device="cuda")
    if language == "auto":
        return model.transcribe(path)
    else:
        return model.transcribe(path, language=language)
    
    
def supportedLanguages():
    return [
        {"code": "auto", "lang": "Auto Detect"},
        {"code": "af", "lang": "Afrikaans"},
        {"code": "ar", "lang": "Arabic"},
        {"code": "hy", "lang": "Armenian"},
        {"code": "az", "lang": "Azerbaijani"},
        {"code": "be", "lang": "Belarusian"},
        {"code": "bs", "lang": "Bosnian"},
        {"code": "bg", "lang": "Bulgarian"},
        {"code": "ca", "lang": "Catalan"},
        {"code": "zh", "lang": "Chinese"},
        {"code": "hr", "lang": "Croatian"},
        {"code": "cs", "lang": "Czech"},
        {"code": "da", "lang": "Danish"},
        {"code": "nl", "lang": "Dutch"},
        {"code": "en", "lang": "English"},
        {"code": "et", "lang": "Estonian"},
        {"code": "fi", "lang": "Finnish"},
        {"code": "fr", "lang": "French"},
        {"code": "gl", "lang": "Galician"},
        {"code": "de", "lang": "German"},
        {"code": "el", "lang": "Greek"},
        {"code": "he", "lang": "Hebrew"},
        {"code": "hi", "lang": "Hindi"},
        {"code": "hu", "lang": "Hungarian"},
        {"code": "is", "lang": "Icelandic"},
        {"code": "id", "lang": "Indonesian"},
        {"code": "it", "lang": "Italian"},
        {"code": "ja", "lang": "Japanese"},
        {"code": "kn", "lang": "Kannada"},
        {"code": "kk", "lang": "Kazakh"},
        {"code": "ko", "lang": "Korean"},
        {"code": "lv", "lang": "Latvian"},
        {"code": "lt", "lang": "Lithuanian"},
        {"code": "mk", "lang": "Macedonian"},
        {"code": "ms", "lang": "Malay"},
        {"code": "mr", "lang": "Marathi"},
        {"code": "mi", "lang": "Maori"},
        {"code": "ne", "lang": "Nepali"},
        {"code": "no", "lang": "Norwegian"},
        {"code": "fa", "lang": "Persian"},
        {"code": "pl", "lang": "Polish"},
        {"code": "pt", "lang": "Portuguese"},
        {"code": "ro", "lang": "Romanian"},
        {"code": "ru", "lang": "Russian"},
        {"code": "sr", "lang": "Serbian"},
        {"code": "sk", "lang": "Slovak"},
        {"code": "sl", "lang": "Slovenian"},
        {"code": "es", "lang": "Spanish"},
        {"code": "sw", "lang": "Swahili"},
        {"code": "sv", "lang": "Swedish"},
        {"code": "tl", "lang": "Tagalog"},
        {"code": "ta", "lang": "Tamil"},
        {"code": "th", "lang": "Thai"},
        {"code": "tr", "lang": "Turkish"},
        {"code": "uk", "lang": "Ukrainian"},
        {"code": "ur", "lang": "Urdu"},
        {"code": "vi", "lang": "Vietnamese"},
        {"code": "cy", "lang": "Welsh"},
    ]
