from pathlib import Path
import argparse
import base64
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.exceptions import InvalidSignature


def generate_key_pair():
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048
    )
    public_key = private_key.public_key()

    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )

    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

    return private_pem, public_pem


def sign_file(private_key_path, file_path):
    # Load the private key
    with open(private_key_path, 'rb') as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=None
        )

    # Read and hash the file
    with open(file_path, 'rb') as f:
        file_data = f.read()

    # Sign the file
    signature = private_key.sign(
        file_data,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )

    hasher = hashes.Hash(hashes.SHA256())
    hasher.update(file_data)
    file_digest = hasher.finalize()

    return {
        'file_path': str(file_path),
        'signature': base64.b64encode(signature).decode('utf-8'),
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
    parser.add_argument("privateKey", nargs='?', type=str, help="path to private key file")

    parser.add_argument("-g", "--generate_new_keys", action="store_true", help="generate new signature keys")
    parser.add_argument("-n", "--name", type=str, default="key", help="filename of key files if they are generated")
    parser.add_argument("-v", "--verbose", action="store_true", help="increase output verbosity")

    args = parser.parse_args()
    name = args.name

    if args.generate_new_keys:
        private_key, public_key = generate_key_pair()

        try:
            with open(f'{name}.pub', "wb") as f:
                f.write(public_key)
            if args.verbose:
                print(f"Saved Public Key to {name}.pub")
        except FileExistsError:
            print(f"File with same name already exists: {name}.pub")

        try:
            with open(f'{name}', "wb") as f:
                f.write(private_key)
            if args.verbose:
                print(f"Saved Private Key to {name}")
        except FileExistsError:
            print(f"File with same name already exists: {name}")
        print("Saved Key files")
        private_key_path = private_key
    elif args.privateKey:
        private_key_path = args.privateKey
    else:
        print("Error: No positional argument provided.")
        exit(1)

    apiFiles = get_api_paths()
    for apiFile in apiFiles:
        apiFile = Path(apiFile)
        file_size = apiFile.stat().st_size
        print(f"File: {apiFile}")
        print(f"Size in bytes: {file_size}")

        signed_file = sign_file(private_key_path, apiFile)
        with open(Path(str(apiFile) + ".sig"), "w") as f:
            f.write(signed_file['signature'])
        print(f"SignedFile: {signed_file}")
        print(f"Signature: {signed_file['signature']}")
        print(f"File digest: {signed_file['file_digest']}")
        print()
