# GlowAI — config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ANTHROPIC_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_VISION_MODEL: str = "moondream"
    GROQ_CHAT_MODEL: str = "llama-3.3-70b-versatile"
    DATABASE_URL: str
    API_TOKEN: str
    CORS_ORIGINS: str = "capacitor://localhost,http://localhost,http://localhost:3000"
    PORT: int = 8000
    STRIPE_SECRET_KEY: str | None = None
    STRIPE_PUBLISHABLE_KEY: str | None = None
    STRIPE_PRICE_FREEMIUM_UNLOCK: str | None = None
    STRIPE_PRICE_SALON_MONTHLY: str | None = None
    STRIPE_SUCCESS_URL: str = "https://808cadger.github.io/GlowAI/download.html?checkout=success"
    STRIPE_CANCEL_URL: str = "https://808cadger.github.io/GlowAI/download.html?checkout=cancelled"
    STRIPE_WEBHOOK_SECRET: str | None = None
    FREE_SCAN_LIMIT: int = 3
    REMINDER_POLL_INTERVAL_SECONDS: int = 30

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()
