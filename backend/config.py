# GlowAI — config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import list as List

class Settings(BaseSettings):
    ANTHROPIC_API_KEY: str
    DATABASE_URL: str
    API_TOKEN: str = "dev-token"
    CORS_ORIGINS: str = "capacitor://localhost,http://localhost,http://localhost:3000"
    PORT: int = 8000

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

settings = Settings()
