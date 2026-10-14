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

    # Verify / initialize database schema (resilient against transient network lags)
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("[OK] Database tables verified/connected")
    except Exception as e:
        print(f"[WARN] Database schema verification deferred: {e}")

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
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Middlewares (Logging, Rate Limiting & Maintenance)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(MaintenanceMiddleware)

# Include API Router at standard /api/v1 as well as fallback prefixes
app.include_router(api_router, prefix="/api/v1")
app.include_router(api_router, prefix="/api")
app.include_router(api_router)


@app.api_route("/", methods=["GET", "HEAD"], tags=["Health"])
async def root():
    """Root endpoint — API info."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/api/docs",
        "health": "/health",
    }


@app.api_route("/health", methods=["GET", "HEAD"], tags=["Health"])
@app.api_route("/api/v1/health", methods=["GET", "HEAD"], tags=["Health"])
@app.api_route("/api/health", methods=["GET", "HEAD"], tags=["Health"])
async def health():
    """Lightweight liveness health check endpoint.
    Guaranteed zero DB queries and zero external Redis calls.
    Used by Render keep-alive monitors, external pingers, and frontend pre-warming.
    Supports both GET and HEAD requests.
    """
    from datetime import datetime

    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.APP_VERSION,
    }


@app.get("/health/ready", tags=["Health"])
@app.get("/api/v1/health/ready", tags=["Health"])
async def health_ready():
    """Database readiness probe.
    Separated from the lightweight keep-alive liveness check to prevent
    connection pool exhaustion during automated keep-alive polling.
    """
    from datetime import datetime
    from sqlalchemy import text
    from app.core.database import async_session

    db_status = "ok"
    try:
        async with async_session() as session:
            await session.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    is_ready = db_status == "ok"
    return {
        "status": "ready" if is_ready else "degraded",
        "database": db_status,
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
