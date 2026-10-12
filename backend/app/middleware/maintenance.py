# ============================================
# HORIZON EQUITY - MAINTENANCE MODE MIDDLEWARE
# ============================================

import time
from typing import Optional
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from sqlalchemy.future import select

from app.core.database import async_session
from app.models.site_setting import SiteSetting

# In-memory cache for maintenance mode to prevent database saturation
_maintenance_cache = {
    "enabled": False,
    "message": "The platform is currently undergoing scheduled maintenance. Please check back shortly.",
    "last_checked": 0.0,
}
CACHE_TTL = 3.0  # check database every 3 seconds max


async def check_maintenance_status() -> tuple[bool, str]:
    now = time.time()
    if now - _maintenance_cache["last_checked"] < CACHE_TTL:
        return _maintenance_cache["enabled"], _maintenance_cache["message"]

    try:
        async with async_session() as db:
            result = await db.execute(select(SiteSetting).filter(SiteSetting.key == "security_settings"))
            setting = result.scalars().first()
            if setting and isinstance(setting.value, dict):
                _maintenance_cache["enabled"] = bool(setting.value.get("maintenance_mode", False))
                _maintenance_cache["message"] = str(
                    setting.value.get(
                        "maintenance_message",
                        "The platform is currently undergoing scheduled maintenance. Please check back shortly."
                    )
                )
            else:
                _maintenance_cache["enabled"] = False
    except Exception:
        # If DB is warming up or unreachable, default to false so app doesn't crash
        pass

    _maintenance_cache["last_checked"] = now
    return _maintenance_cache["enabled"], _maintenance_cache["message"]


def invalidate_maintenance_cache():
    """Call this when an administrator toggles maintenance mode."""
    _maintenance_cache["last_checked"] = 0.0


class MaintenanceMiddleware(BaseHTTPMiddleware):
    """
    Enforces real platform-level maintenance mode.
    Permits administrator endpoints and auth rescue routes while shielding financial operations.
    """

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Whitelist critical admin, authentication, documentation, and health routes
        exempt_prefixes = [
            "/api/v1/admin",
            "/api/v1/auth",
            "/api/docs",
            "/docs",
            "/openapi.json",
            "/health",
            "/api/v1/health",
        ]
        is_exempt = any(path.startswith(prefix) for prefix in exempt_prefixes)

        if not is_exempt:
            is_maintenance, message = await check_maintenance_status()
            if is_maintenance:
                return JSONResponse(
                    status_code=503,
                    content={
                        "error": "Service Unavailable",
                        "maintenance": True,
                        "message": message,
                    },
                    headers={"Retry-After": "300"},
                )

        return await call_next(request)
