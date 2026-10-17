"""
Centralized configuration — reads from .env once.
"""
import os
from dotenv import load_dotenv

# Explicit .env path (backend/.env)
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BACKEND_DIR, ".env")
load_dotenv(dotenv_path=ENV_PATH)


def _get(key: str, default: str = "") -> str:
    return os.getenv(key, default)


class Settings:
    # ---------- Environment ----------
    # "development" → add_admin.py runs
    # "production"  → add_admin.py blocked
    ENVIRONMENT: str = _get("ENVIRONMENT", "development")

    # ---------- Database ----------
    DB_TYPE: str = _get("DB_TYPE", "sqlite")
    DB_USER: str = _get("DB_USER", "shf_user")
    DB_PASSWORD: str = _get("DB_PASSWORD", "ShfPass@2026")
    DB_HOST: str = _get("DB_HOST", "localhost")
    DB_PORT: str = _get("DB_PORT", "3306")
    DB_NAME: str = _get("DB_NAME", "shf_db")

    # ---------- Auth (JWT only) ----------
    JWT_SECRET: str = _get("JWT_SECRET", "shf-super-secret-key-2026-change-me")
    TOKEN_EXPIRES_HOURS: int = 24

    @property
    def database_url(self) -> str:
        if self.DB_TYPE == "mysql":
            return (
                f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
                f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
            )
        db_dir = os.path.dirname(os.path.abspath(__file__))
        return f"sqlite:///{os.path.join(db_dir, 'aidus.db')}"


settings = Settings()