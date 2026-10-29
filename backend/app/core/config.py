# ============================================
# HORIZON EQUITY - CONFIGURATION
# ============================================

from pydantic_settings import BaseSettings
from typing import List, Optional
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    APP_NAME: str = "Horizon Equity"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://horizon:horizon123@localhost:5432/horizon_equity"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    # Supabase (values come from .env only)
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    UPSTASH_REDIS_REST_URL: str = ""
    UPSTASH_REDIS_REST_TOKEN: str = ""

    # JWT
    JWT_SECRET_KEY: str = "horizon-equity-dev-secret-key-change-in-production-2024"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS & Deployment
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:8000,http://localhost:80"
    VERCEL_FRONTEND_URL: Optional[str] = None
    RENDER_API_KEY: Optional[str] = None

    @property
    def cors_origins(self) -> List[str]:
        origins = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
        if self.VERCEL_FRONTEND_URL and self.VERCEL_FRONTEND_URL.strip():
            vercel_clean = self.VERCEL_FRONTEND_URL.strip().rstrip("/")
            if vercel_clean not in origins:
                origins.append(vercel_clean)
        return origins

    # Admin
    ADMIN_EMAIL: str = "only-me@gmail.com"
    ADMIN_PASSWORD: str = "connect@me-alone"

    # Email (Brevo SMTP & API)
    SMTP_HOST: str = "smtp-relay.brevo.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = "stub-password"
    SMTP_FROM: str = "noreply@horizonequity.com"
    SMTP_FROM_NAME: str = "Horizon Equity"
    BREVO_API_KEY: Optional[str] = None

    # Security
    RATE_LIMIT_PER_MINUTE: int = 240
    RATE_LIMIT_PER_HOUR: int = 1000
    MAX_LOGIN_ATTEMPTS: int = 5
    LOCKOUT_DURATION_MINUTES: int = 30

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 5242880  # 5MB

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
