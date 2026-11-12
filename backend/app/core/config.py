import os
from pydantic_settings import BaseSettings
from typing import Optional

if os.path.exists("/app") and os.path.isdir("/app"):
    BASE_DIR = "/app"
else:
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))

DEFAULT_DB_FILE = os.path.join(BASE_DIR, "atcorp_crm.db").replace("\\", "/")

class Settings(BaseSettings):
    PROJECT_NAME: str = "ATCORP – India B2B CRM & CPQ Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Defaults to local SQLite in workspace root, overridden by Azure PostgreSQL in production
    DATABASE_URL: str = f"sqlite:///{DEFAULT_DB_FILE}"
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000", "*"]
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

