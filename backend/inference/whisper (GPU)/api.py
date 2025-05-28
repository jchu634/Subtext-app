import whisper.transcribe
import whisper
import os
import sys
import tqdm
import asyncio
import json
from broadcaster import Broadcast

# --- Globals to be set by the main app ---
# These will be specific to the background task instance
_task_id_for_tqdm: str | None = None
_broadcaster_for_tqdm: Broadcast | None = None
_loop_for_tqdm: asyncio.AbstractEventLoop | None = None
# ---


class _tqdmProgressShim(tqdm.tqdm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Ensure 'total' is available if possible, whisper usually provides it
        self._known_total = self.total or 0

    def update(self, n: int = 1):
        # Important: Check if update is called with n=0 initially by whisper
        if n == 0:
            super().update(0)  # Call original update but don't report progress yet
            return

        super().update(n)
        # self.n is the *absolute* current value after update
        current_val = self.n
        total_val = self._known_total or self.total  # Update total if it becomes known

        # --- Communication back to FastAPI ---
        if _broadcaster_for_tqdm and _loop_for_tqdm and _task_id_for_tqdm:
            try:
                progress_percent = (
                    round((current_val / total_val) * 100, 2) if total_val else 0
                )
                message = json.dumps({
                    "type": "progress",
                    "current": current_val,
                    "total": total_val,
                    "percentage": progress_percent,
                })

                # Schedule the async publish call from this sync context
                asyncio.run_coroutine_threadsafe(
                    _broadcaster_for_tqdm.publish(
                        channel=_task_id_for_tqdm, message=message
                    ),
                    _loop_for_tqdm,
                )
                # Debug:
                # print(f"TQDM Shim ({_task_id_for_tqdm}): Published {message}")

            except Exception as e:
                # Avoid crashing the transcription if publishing fails
                print(f"TQDM Shim Error ({_task_id_for_tqdm}): Failed to publish progress: {e}")
        else:
            print(f"TQDM Shim ({_task_id_for_tqdm}): Broadcaster/Loop not set, skipping publish.")


def supportedFormats():
    return ["mp3", "mp4", "mpeg", "mpga", "m4a", "wav", "webm"]


def getModels():
    return whisper.available_models()


def generateSubtitle(path, model, language):
    original_tqdm = None
    transcribe_module = sys.modules.get('whisper.transcribe')
    if transcribe_module and hasattr(transcribe_module, 'tqdm'):
        original_tqdm = transcribe_module.tqdm.tqdm
        transcribe_module.tqdm.tqdm = _tqdmProgressShim
        print(f"TQDM Patched for task {_task_id_for_tqdm}")  # Debug
    else:
        print("Warning: Could not find whisper.transcribe.tqdm to patch.")

    if language == "en" and model in ["tiny", "base", "small", "medium",]:
        model = model + ".en"
    model = whisper.load_model(model, device="cuda")
    if language == "auto":
        return model.transcribe(path, verbose=False)
    else:
        return model.transcribe(path, language=language, verbose=False)


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
