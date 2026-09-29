import hashlib


def sha256_text(data: str) -> str:
    """
    Return SHA-256 hex digest for the provided text.
    """
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def sha256_bytes(data: bytes) -> str:
    """
    Return SHA-256 hex digest for raw bytes.
    """
    return hashlib.sha256(data).hexdigest()