# GlowAI — config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ANTHROPIC_API_KEY: str
    DATABASE_URL: str
    API_TOKEN: str = "dev-token"
    CORS_ORIGINS: str = "capacitor://localhost,http://localhost,http://localhost:3000"
    PORT: int = 8000
    STRIPE_SECRET_KEY: str | None = None
    STRIPE_PUBLISHABLE_KEY: str | None = None
    STRIPE_PRICE_FREEMIUM_UNLOCK: str | None = None
    STRIPE_PRICE_SALON_MONTHLY: str | None = None
    STRIPE_SUCCESS_URL: str = "https://808cadger.github.io/GlowAI/download.html?checkout=success"
    STRIPE_CANCEL_URL: str = "https://808cadger.github.io/GlowAI/download.html?checkout=cancelled"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()
