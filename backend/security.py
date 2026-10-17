"""
Password hashing utilities — stdlib only (pbkdf2_sha256).
Format: pbkdf2_sha256$<iterations>$<salt>$<hash>
"""
import hashlib
import hmac
import secrets


_ALGO = "pbkdf2_sha256"
_ITERATIONS = 100_000


def hash_password(password: str) -> str:
    """Hash a plaintext password."""
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        _ITERATIONS,
    )
    return f"{_ALGO}${_ITERATIONS}${salt}${dk.hex()}"


def verify_password(password: str, stored: str) -> bool:
    """Verify a plaintext password against a stored hash."""
    try:
        if not stored:
            return False
        parts = stored.split("$")
        if len(parts) != 4:
            return False
        algo, iterations, salt, expected = parts
        if algo != _ALGO:
            return False
        dk = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            int(iterations),
        )
        return hmac.compare_digest(dk.hex(), expected)
    except Exception:
        return False