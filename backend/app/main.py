# ============================================
# HORIZON EQUITY - MAIN APPLICATION
# ============================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router
from app.middleware import LoggingMiddleware, RateLimitMiddleware, MaintenanceMiddleware

# Import all models so they are registered with SQLAlchemy
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    # Startup
    print(f"[START] Starting {settings.APP_NAME} v{settings.APP_VERSION}")

    # Create tables (dev only — use Alembic in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("[OK] Database tables created/verified")
    print(f"[INFO] API Docs: http://localhost:8000/api/docs")

    yield

    # Shutdown
    await engine.dispose()
    print("[STOP] Application shutdown")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Educational Investment Platform API",
    lifespan=lifespan,
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
    openapi_tags=[
        {"name": "Health", "description": "Health check endpoints"},
        {"name": "Authentication", "description": "Auth endpoints"},
        {"name": "Users", "description": "User management"},
        {"name": "Wallets", "description": "Wallet operations"},
        {"name": "Investments", "description": "Investment operations"},
        {"name": "Transactions", "description": "Transaction management"},
        {"name": "Referrals", "description": "Referral system"},
        {"name": "Admin", "description": "Admin operations"},
        {"name": "Notifications", "description": "Notification system"},
    ],
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Middlewares (Logging, Rate Limiting & Maintenance)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(MaintenanceMiddleware)

# Include API Router
app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint — API info."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/api/docs",
        "health": "/health",
    }


@app.get("/health", tags=["Health"])
async def health():
    """Health check endpoint."""
    from datetime import datetime

    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.APP_VERSION,
    }


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info",
    )
