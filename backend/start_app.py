from init import create_app
import webview
import sys
import threading
import uvicorn
import os

from config import Settings

app = create_app()


def start_server():
    uvicorn.run(app, port=6789)


class SettingsWindowApi():
    def __init__(self):
        self._window = None

    def log(self, value):
        print(value)

    def killSettingsWindow(self):
        self._window.destroy()

    def setWindow(self, window):
        self._window = window

    def createToastOnMainWindow(self, title, message, duration):
        window.evaluate_js(f"createToast('{title}','{message}',{duration})")

    def setWindowAlwaysOnTop(self, value):
        print("Setting window on top")
        try:
            window.on_top = value
            print("Window is now on top")
        except Exception as e:
            print(e)


class Api():
    def __init__(self):
        self.maximised = False
        self.prevSize = None

    def log(self, value):
        print(value)

    def closeWindow(self):
        window.destroy()
        sys.exit()
        os._exit(0)

    def minimiseWindow(self):
        window.minimize()

    def maximiseWindow(self):
        if self.maximised:
            self.maximised = False
            window.resize(self.prevSize[0], self.prevSize[1])
        else:
            self.maximised = True
            self.prevSize = (window.width, window.height)
            window.maximize()

    def setWindowAlwaysOnTop(self, value):
        print("Setting window on top")
        try:
            window.on_top = value
            print("Window is now on top")
        except Exception as e:
            print(e)

    def spawnMultipleFileDialog(self):
        file_types = ('Video Files (*.mkv;*.mp4;*.mpeg;*.m4a;*.webm)',
                      'Audio Files (*.mp3;*.mpga;*.wav)', 'All files (*.*)')
        multipleFilenames = window.create_file_dialog(
            webview.OPEN_DIALOG, allow_multiple=True, file_types=file_types

        )
        return multipleFilenames

    def spawnFolderDialog(self):
        folder = window.create_file_dialog(
            webview.FOLDER_DIALOG
        )
        return folder


if __name__ == "__main__":
    t = threading.Thread(target=start_server)
    t.daemon = True
    t.start()

    webview.settings['ALLOW_DOWNLOADS'] = True
    api_instance = Api()

    def on_closed():
        print("Main Window is Closed")

    window = webview.create_window(
        "Whisper Subtitler", f"{Settings.backendUrl}", js_api=api_instance, background_color="#5B8E7D", min_size=(660, 400), width=880)
    window.events.closed += on_closed
    if Settings.ENV == "development":
        webview.start(private_mode=False, debug=True)  # Persist settings
    else:
        webview.start(private_mode=False)  # Persist settings

    os._exit(0)
