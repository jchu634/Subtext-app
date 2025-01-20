from typing import Any
from pydantic_settings import BaseSettings, SettingsConfigDict
from cryptography.hazmat.primitives.asymmetric.types import PublicKeyTypes
from cryptography.hazmat.primitives import serialization
from pydantic import Field
import os

library_path = os.path.dirname(os.path.abspath(__file__))

# CHANGE FOR DEVELOPMENT
env = "PRODUCTION"


class settingsModel(BaseSettings):
    appName: str = "Subtext"    # "Gas: Generative AI Subtitling"
    appAuthor: str = "Joshua Chung"

    backendUrl: str = "http://localhost:6789"
    outputPath: str = ""
    testEnable: bool = True
    allowUnsignedCode: bool = False
    debuggingEnabled: bool = False
    publicKey: PublicKeyTypes

    if os.path.exists("key.pub"):
        publicKey = Field(default_factory=lambda: serialization.load_pem_public_key(
            open("key.pub", 'rb').read()
        ))
    else:
        publicKey = None

    LOGGING: bool = True

    if env == "DEVELOPMENT":
        model_config = SettingsConfigDict(
            env_file=(
                ".env",
                ".env.development"
            )
        )


Settings = settingsModel()
