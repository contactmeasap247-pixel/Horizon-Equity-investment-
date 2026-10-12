# ============================================
# HORIZON EQUITY - RATE LIMIT MIDDLEWARE
# ============================================

import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response
import redis.asyncio as aioredis

from app.core.config import settings

logger = logging.getLogger("horizon.rate_limit")


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
            # Fallback: if Redis is not available, proceed without rate limiting
            return await call_next(request)

        # Skip rate limit checking for Swagger/OpenAPI docs
        path = request.url.path
        if (
            path.startswith("/api/docs")
            or path.startswith("/api/redoc")
            or path == "/openapi.json"
            or path == "/"
        ):
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        if client_ip in ["127.0.0.1", "localhost", "::1", "testclient"]:
            return await call_next(request)

        # Track limit per client IP
        key = f"rate_limit:{client_ip}"

        try:
            # Check current rate
            current_count = await self.redis.get(key)
            if current_count and int(current_count) >= settings.RATE_LIMIT_PER_MINUTE:
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Too many requests. Please try again in a minute."},
                )

            # Increment count
            async with self.redis.pipeline(transaction=True) as pipe:
                await pipe.incr(key)
                if not current_count:
                    # Set TTL for new keys (60 seconds window)
                    await pipe.expire(key, 60)
                await pipe.execute()

        except Exception as e:
            logger.error(f"Error in rate limiting middleware: {e}")
            # Fail-safe: let the request proceed even if Redis operations fail

        return await call_next(request)
