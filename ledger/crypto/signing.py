import base64

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey,
    Ed25519PublicKey,
)


def generate_session_keypair() -> tuple[str, str]:
    """
    Generate a fresh Ed25519 keypair for one exam session.

    Returns:
        (private_key_b64, public_key_b64)
    """
    private_key = Ed25519PrivateKey.generate()
    public_key = private_key.public_key()

    private_bytes = private_key.private_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PrivateFormat.Raw,
        encryption_algorithm=serialization.NoEncryption(),
    )

    public_bytes = public_key.public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw,
    )

    return (
        base64.b64encode(private_bytes).decode("utf-8"),
        base64.b64encode(public_bytes).decode("utf-8"),
    )


def sign_hash(content_hash: str, private_key_b64: str) -> str:
    """
    Sign a SHA-256 hash using the exam-session private key.

    Returns:
        Base64 encoded signature.
    """
    private_bytes = base64.b64decode(private_key_b64)
    private_key = Ed25519PrivateKey.from_private_bytes(private_bytes)

    signature = private_key.sign(content_hash.encode("utf-8"))

    return base64.b64encode(signature).decode("utf-8")


def verify_signature(
    content_hash: str,
    signature_b64: str,
    public_key_b64: str,
) -> bool:
    """
    Verify a signature against the hash and public key.
    """
    try:
        public_bytes = base64.b64decode(public_key_b64)
        signature = base64.b64decode(signature_b64)

        public_key = Ed25519PublicKey.from_public_bytes(public_bytes)

        public_key.verify(
            signature,
            content_hash.encode("utf-8"),
        )

        return True

    except Exception:
        return False