from typing import ClassVar
from pydantic_settings import BaseSettings, SettingsConfigDict
from cryptography.hazmat.primitives.asymmetric.types import PublicKeyTypes
from cryptography.hazmat.primitives import serialization
from pydantic import Field
from hashlib import sha256
from sys import exit
import os

library_path = os.path.dirname(os.path.abspath(__file__))

# CHANGE FOR DEVELOPMENT
env = "DEVELOPMENT"


class settingsModel(BaseSettings):
    appName: str = "Subtext"    # "Gas: Generative AI Subtitling"
    appAuthor: str = "Joshua Chung"

    backendUrl: str = "http://localhost:6789/"
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
if (not Settings.allowUnsignedCode):
    hash = sha256()
    hash.update(open("key.pub", 'rb').read())
    if (hash.hexdigest() != "0e5fa3d7e8b53a32a87911fce765486a1001cefe6549c8e243572c138465c491"):
        print("Public Key Hash check failed")
        exit(100)
