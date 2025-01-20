from pathlib import Path
import argparse
import base64
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.exceptions import InvalidSignature
import pytest


def verify_file(public_key_path, file_path):
    # Load the public key
    with open(public_key_path, 'rb') as key_file:
        public_key = serialization.load_pem_public_key(
            key_file.read()
        )

    # Read file data
    with open(file_path, 'rb') as f:
        file_data = f.read()

    # Read signature
    sig_path = str(file_path) + '.sig'
    with open(sig_path, 'rb') as f:
        signature = base64.b64decode(f.read())

    # Calculate file digest
    hasher = hashes.Hash(hashes.SHA256())
    hasher.update(file_data)
    file_digest = hasher.finalize()

    # Verify signature
    try:
        public_key.verify(
            signature,
            file_data,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        verified = True
    except InvalidSignature:
        verified = False

    return {
        'file_path': str(file_path),
        'verified': verified,
        'file_digest': base64.b64encode(file_digest).decode('utf-8')
    }


def get_api_paths():
    current_dir = Path(__file__).parent
    inference_dir = current_dir.parent / 'inference'

    # Find all api.py files in subdirectories
    api_paths = list(inference_dir.glob('*/api.py'))
    return api_paths


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("publicKey", type=str, help="path to public key file")

    args = parser.parse_args()
    public_key_path = args.publicKey

    apiFiles = get_api_paths()
    for apiFile in apiFiles:
        apiFile = Path(apiFile)

        signed_file = verify_file(public_key_path, apiFile)

        print(f"{signed_file['file_path']}: {signed_file['verified']}")

        # print(f"Signature: {signed_file['signature']}")
        # print(f"File digest: {signed_file['file_digest']}")
