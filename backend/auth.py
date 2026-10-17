"""
Admin auth — JWT token + DB-backed credential verification + role checks.
Roles:
  - super_admin : full access (including admin management)
  - editor      : can reply chats + change donation status
  - viewer      : read-only
"""
import base64
import hashlib
import hmac
import json
import time
from datetime import datetime
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from .models import Admin
from .security import verify_password


SECRET_KEY = settings.JWT_SECRET
TOKEN_EXPIRES_HOURS = settings.TOKEN_EXPIRES_HOURS

security = HTTPBearer(auto_error=False)

VALID_ROLES = {"super_admin", "editor", "viewer"}


# ---------- TOKEN ----------
def create_token(username: str, expires_hours: int = TOKEN_EXPIRES_HOURS) -> str:
    payload = {
        "sub": username,
        "iat": int(time.time()),
        "exp": int(time.time()) + expires_hours * 3600,
    }
    data = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    sig = hmac.new(SECRET_KEY.encode(), data.encode(), hashlib.sha256).hexdigest()
    return f"{data}.{sig}"


def verify_token(token: str) -> Optional[dict]:
    try:
        if not token:
            return None
        data, sig = token.split(".", 1)
        expected = hmac.new(SECRET_KEY.encode(), data.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        padded = data + "=" * (-len(data) % 4)
        payload = json.loads(base64.urlsafe_b64decode(padded.encode()).decode())
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None


# ---------- CREDENTIALS ----------
def verify_credentials(username: str, password: str, db: Session) -> Optional[Admin]:
    if not username or not password:
        return None
    admin = db.query(Admin).filter(Admin.username == username).first()
    if not admin or not admin.is_active:
        return None
    if not verify_password(password, admin.password_hash):
        return None
    admin.last_login = datetime.utcnow()
    db.commit()
    return admin

def verify_admin_password(username: str, password: str, db: Session) -> bool:
    """Verify a password for the given admin (used for dangerous actions)."""
    if not username or not password:
        return False
    admin = db.query(Admin).filter(Admin.username == username).first()
    if not admin or not admin.is_active:
        return False
    return verify_password(password, admin.password_hash)

def change_admin_password(username: str, old_password: str, new_password: str, db: Session) -> bool:
    from .security import hash_password
    admin = db.query(Admin).filter(Admin.username == username).first()
    if not admin:
        return False
    if not verify_password(old_password, admin.password_hash):
        return False
    admin.password_hash = hash_password(new_password)
    db.commit()
    return True


# ---------- DEPENDENCIES ----------
def get_current_admin(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> dict:
    """Any logged-in active admin."""
    if not creds or not creds.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = verify_token(creds.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    admin = db.query(Admin).filter(Admin.username == payload.get("sub")).first()
    if not admin or not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin account not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"sub": admin.username, "role": admin.role or "viewer"}


def get_current_editor(admin: dict = Depends(get_current_admin)) -> dict:
    """Editor or Super Admin only."""
    if admin.get("role") not in ("super_admin", "editor"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Editor access required.",
        )
    return admin


def get_current_super_admin(admin: dict = Depends(get_current_admin)) -> dict:
    """Super Admin only."""
    if admin.get("role") != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Super Admin access required.",
        )
    return admin