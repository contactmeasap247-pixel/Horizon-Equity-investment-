# ============================================
# HORIZON EQUITY - RATE LIMIT MIDDLEWARE
# ============================================

import logging
from typing import Optional
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response
import redis.asyncio as aioredis

from app.core.config import settings

logger = logging.getLogger("horizon.rate_limit")

# Atomic Lua script for safe fixed-window rate limiting.
# Guarantee: A key can NEVER exist without an expiration (TTL < 0 is immediately healed).
RATE_LIMIT_LUA = """
local key = KEYS[1]
local window = tonumber(ARGV[1])
local current = redis.call('INCR', key)
if current == 1 then
    redis.call('EXPIRE', key, window)
else
    local ttl = redis.call('TTL', key)
    if ttl < 0 then
        redis.call('EXPIRE', key, window)
    end
end
return current
"""


def get_real_client_ip(request: Request) -> str:
    """Extract real client IP behind Cloudflare, Vercel, and Render reverse proxies."""
    cf_ip = request.headers.get("cf-connecting-ip")
    if cf_ip and cf_ip.strip():
        return cf_ip.strip()
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded and forwarded.strip():
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Redis-backed rate limiting middleware for FastAPI."""

    def __init__(self, app):
        super().__init__(app)
        self.redis = None
        try:
            self.redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        except Exception as e:
            logger.error(f"Failed to connect to Redis for rate limiting: {e}")

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if self.redis is None:
            return await call_next(request)

        path = request.url.path

        # 1. Skip rate limiting for health checks, docs, root, and OPTIONS/HEAD requests
        if (
            path in ["/health", "/api/v1/health", "/api/health", "/health/ready", "/api/v1/health/ready"]
            or path.startswith("/api/docs")
            or path.startswith("/api/redoc")
            or path == "/openapi.json"
            or path == "/"
            or request.method == "HEAD"
            or request.method == "OPTIONS"
        ):
            return await call_next(request)

        # 2. Skip rate limiting for user authentication routes.
        # Authentication brute-force security is strictly managed at the account level
        # by AuthService (failed_login_attempts, MAX_LOGIN_ATTEMPTS=5, lockout duration).
        auth_exemptions = [
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/refresh",
            "/api/v1/auth/logout",
            "/api/v1/auth/verify-email",
            "/api/v1/auth/forgot-password",
            "/api/v1/auth/reset-password",
            "/auth/login",
            "/auth/register",
        ]
        if any(path.startswith(prefix) for prefix in auth_exemptions):
            return await call_next(request)

        client_ip = get_real_client_ip(request)
        if client_ip in ["127.0.0.1", "localhost", "::1", "testclient"]:
            return await call_next(request)

        key = f"rate_limit:{client_ip}"
        limit = max(settings.RATE_LIMIT_PER_MINUTE, 180)  # Generous headroom for SPAs
        window_seconds = 60

        try:
            current_count = await self.redis.eval(RATE_LIMIT_LUA, 1, key, window_seconds)
            if current_count and int(current_count) > limit:
                ttl = await self.redis.ttl(key)
                retry_after = str(max(1, ttl if ttl and ttl > 0 else window_seconds))

                # Build response with defense-in-depth CORS headers so browser never flags it as CORS error
                origin = request.headers.get("origin", "")
                resp_headers = {"Retry-After": retry_after}
                if origin:
                    resp_headers["Access-Control-Allow-Origin"] = origin
                    resp_headers["Access-Control-Allow-Credentials"] = "true"

                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Too many requests. Please try again in a moment."},
                    headers=resp_headers,
                )
        except Exception as e:
            logger.warning(f"Fail-safe: Redis rate limit evaluation bypassed: {e}")

        return await call_next(request)
