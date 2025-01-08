from typing import Any
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

library_path = os.path.dirname(os.path.abspath(__file__))


class settingsModel(BaseSettings):
    backendUrl: str = "http://localhost:6789"
    outputPath: str = ""
    testEnable: bool = True
    allowUnsignedCode: bool = False

    ENV: str = "production"
    LOGGING: bool = True

    model_config = SettingsConfigDict(
        env_file=(
            ".env",
            ".env.development"
        )
    )


Settings = settingsModel()
