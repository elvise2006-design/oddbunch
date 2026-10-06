"""Application configuration, loaded from environment variables / .env file."""

from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/app/config.py -> backend/app -> backend
BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Runtime settings for the Seedling & Vine API."""

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Seedling & Vine API"
    api_prefix: str = "/api"

    # Change if port 8000 is already taken on your machine.
    port: int = 8000
    host: str = "127.0.0.1"

    # SQLite file lives next to the backend package so the demo is fully portable.
    database_url: str = f"sqlite:///{BASE_DIR / 'seedling_and_vine.db'}"

    # Comma separated list, or "*" to allow any origin (demo-friendly default).
    cors_origins: str = "*"

    # Auto-create + seed tables on startup so `uvicorn app.main:app` just works.
    auto_seed: bool = True

    @property
    def cors_origin_list(self) -> list[str]:
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
