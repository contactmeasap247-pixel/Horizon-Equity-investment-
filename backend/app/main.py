# ============================================
# HORIZON EQUITY - MAIN APPLICATION
# ============================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import os
import uvicorn

from app.core.config import settings
from app.core.database import engine, Base, async_session
from app.api.v1.router import api_router
from app.middleware import LoggingMiddleware, RateLimitMiddleware, MaintenanceMiddleware

# Import all models so they are registered with SQLAlchemy
import app.models  # noqa: F401


async def _self_keepalive_loop():
    """Background self-keepalive task to prevent Render container idle sleep
    and serverless PostgreSQL (Neon/Supabase) cold-starts.
    Runs every 4 minutes (240s), well below the 5-minute DB idle threshold
    and Render's 15-minute container sleep window.
    """
    import httpx
    from sqlalchemy import text

    external_url = (
        os.getenv("RENDER_EXTERNAL_URL")
        or os.getenv("BACKEND_PUBLIC_URL")
        or "https://horizon-equity-backend.onrender.com"
    ).rstrip("/")

    # Initial delay after startup before beginning periodic keep-alive
    await asyncio.sleep(60)

    while True:
        try:
            # 1. Keep PostgreSQL connection pool warm (prevents serverless DB scale-to-zero)
            async with async_session() as session:
                await session.execute(text("SELECT 1"))
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"[KEEPALIVE] Database warm-up ping warning: {e}")

        try:
            # 2. Ping external Render URL through edge router to reset inactivity timer
            async with httpx.AsyncClient(timeout=15.0) as client:
                await client.get(
                    f"{external_url}/health",
                    headers={"User-Agent": "HorizonEquity-KeepAlive/1.0"},
                )
        except asyncio.CancelledError:
            break
        except Exception:
            pass

        try:
            await asyncio.sleep(240)
        except asyncio.CancelledError:
            break


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

    # Ensure investment plans are synced with latest yield rates
    try:
        from app.core.seed import sync_investment_plans
        await sync_investment_plans()
        print("[OK] Investment plans verified and synced with active rates")
    except Exception as e:
        print(f"[WARN] Investment plans auto-sync deferred: {e}")

    # Launch background keep-alive loop to prevent idle sleep
    keepalive_task = asyncio.create_task(_self_keepalive_loop())
    print("[OK] Background keep-alive daemon started (240s interval)")
    print(f"[INFO] API Docs: http://localhost:8000/api/docs")

    yield

    # Shutdown
    keepalive_task.cancel()
    try:
        await keepalive_task
    except asyncio.CancelledError:
        pass
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

# Custom Middlewares (Logging, Rate Limiting & Maintenance)
# Note: In Starlette/FastAPI, middlewares execute in reverse order of addition.
# Custom middlewares are added first so that CORSMiddleware (added last) becomes the outermost
# layer, guaranteeing that all error responses, 429 rate-limits, and preflight requests always receive proper CORS headers.
app.add_middleware(MaintenanceMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(LoggingMiddleware)

# CORS Middleware (Outermost layer)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.api_route("/health/ready", methods=["GET", "HEAD"], tags=["Health"])
@app.api_route("/api/v1/health/ready", methods=["GET", "HEAD"], tags=["Health"])
async def health_ready():
    """Database readiness probe.
    Separated from the lightweight keep-alive liveness check to prevent
    connection pool exhaustion during automated keep-alive polling.
    """
    from datetime import datetime
    from sqlalchemy import text

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
