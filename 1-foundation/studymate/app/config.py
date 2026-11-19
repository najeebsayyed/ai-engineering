import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-5.5")
APP_NAME: str = os.getenv("APP_NAME", "StudyMate")
API_HOST: str = os.getenv("API_HOST", "127.0.0.1")
API_PORT: int = int(os.getenv("API_PORT", "8000"))

# Parse CORS origins from comma-separated string or use defaults
_raw_cors = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")
CORS_ORIGINS: List[str] = [origin.strip() for origin in _raw_cors.split(",") if origin.strip()]


def has_openai_key() -> bool:
    """Return True if OPENAI_API_KEY is present and not empty."""
    return bool(OPENAI_API_KEY and OPENAI_API_KEY.strip())
