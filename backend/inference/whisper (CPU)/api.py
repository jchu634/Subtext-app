import whisper
import sys
import tqdm
import asyncio
import json
from broadcaster import Broadcast
import threading
from config import Settings

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
                    "task_id": _task_id_for_tqdm,
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


def generateSubtitle(path, model, language, task_id_param, broadcaster_param, loop_param, patch_lock_param: threading.Lock):
    global _task_id_for_tqdm, _broadcaster_for_tqdm, _loop_for_tqdm

    _task_id_for_tqdm = task_id_param
    _broadcaster_for_tqdm = broadcaster_param
    _loop_for_tqdm = loop_param

    print(_task_id_for_tqdm)

    original_tqdm = None
    transcribe_module = sys.modules.get('whisper.transcribe')

    if not Settings.enable_multi_job:
        # Acquire lock before modifying global whisper.transcribe.tqdm
        patch_lock_param.acquire()
    try:
        if transcribe_module and hasattr(transcribe_module, 'tqdm'):
            original_tqdm = transcribe_module.tqdm.tqdm
            transcribe_module.tqdm.tqdm = _tqdmProgressShim
            # print(f"TQDM Patched for task {_task_id_for_tqdm}")  # Debug
        else:
            print("Warning: Could not find whisper.transcribe.tqdm to patch.")

        try:
            if language == "en" and model in ["tiny", "base", "small", "medium",]:
                model = model + ".en"
            model = whisper.load_model(model, device="cpu")
            if language == "auto":
                return True, model.transcribe(path, verbose=False)
            else:
                return True, model.transcribe(path, language=language, verbose=False)
        except Exception as e:
            print(f"Error during transcription for task {_task_id_for_tqdm}: {e}")
            return False, str(e)                # Return failure and error message
    finally:

        if transcribe_module and hasattr(transcribe_module, 'tqdm') and hasattr(transcribe_module.tqdm, 'tqdm') and original_tqdm:
            # Only restore if we actually patched it.
            # Check if current patch is still ours, though lock should mostly handle this.
            if transcribe_module.tqdm.tqdm is _tqdmProgressShim:
                transcribe_module.tqdm.tqdm = original_tqdm
                print(f"TQDM Restored for task {_task_id_for_tqdm}")

        # Release lock after restoration attempt
        if not Settings.enable_multi_job:
            patch_lock_param.release()

        # Clear module globals after use to avoid accidental reuse if module somehow persists
        _task_id_for_tqdm = None
        _broadcaster_for_tqdm = None
        _loop_for_tqdm = None


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
