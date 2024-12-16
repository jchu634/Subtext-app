from init import create_app
import webview
import sys
import threading
import uvicorn
import os

import crossfiledialog
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
    def __init__(self, settings_window=None):
        self.settings_window = settings_window

    def log(self, value):
        print(value)

    def killWindow(self):
        if self.settings_window:
            self.settings_window.destroy()
            self.settings_window = None
        window.destroy()
        sys.exit()
        os._exit(0)

    def spawnSettingsWindow(self):
        if self.settings_window:
            self.settings_window.destroy()
            self.settings_window = None
        settingsApi = SettingsWindowApi()
        self.settings_window = webview.create_window(
            "Settings", f"{Settings.backendUrl}/settings", js_api=settingsApi)
        settingsApi.setWindow(self.settings_window)

    def killSettingsWindow(self):
        if self.settings_window:
            self.settings_window.destroy()
            self.settings_window = None

    def createToastOnMainWindow(self, title, message, duration):
        window.evaluate_js(f"createToast('{title}','{message}',{duration})")

    def setWindowAlwaysOnTop(self, value):
        print("Setting window on top")
        try:
            window.on_top = value
            print("Window is now on top")
        except Exception as e:
            print(e)

    def spawnFileDialog(self):
        # show an "Open" dialog box and return the path to the selected file
        multipleFilenames = crossfiledialog.open_multiple()
        return multipleFilenames

    def test(self):
        return ["test", "test1"]


if __name__ == "__main__":
    t = threading.Thread(target=start_server)
    t.daemon = True
    t.start()

    webview.settings['ALLOW_DOWNLOADS'] = True
    api_instance = Api()

    def on_closed():
        print("Main Window is Closed")
        try:
            print("Terminating Settings Window")
            # api_instance.killSettingsWindow()
        except Exception as e:
            print(e)

    window = webview.create_window(
        "Whisper Subtitler", f"{Settings.backendUrl}", js_api=api_instance)
    window.events.closed += on_closed

    webview.start(private_mode=False, debug=True)  # Persist settings

    os._exit(0)
