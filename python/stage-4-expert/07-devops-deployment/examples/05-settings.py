"""
pydantic-settings config management
"""
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Data Analytics Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4
    DATABASE_URL: str = Field(default="sqlite:///./app.db")
    REDIS_URL: str = "redis://localhost:6379"
    SECRET_KEY: str = Field(default="change-me-in-production", min_length=16)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]
    LOG_LEVEL: str = "INFO"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "case_sensitive": True}


settings = Settings()

if __name__ == "__main__":
    print(f"App: {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"Debug: {settings.DEBUG}")
    print(f"Database: {settings.DATABASE_URL}")
    for key, value in settings.model_dump().items():
        if "SECRET" in key or "PASSWORD" in key:
            print(f"  {key}: ***")
        else:
            print(f"  {key}: {value}")