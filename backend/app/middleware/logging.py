# ============================================
# HORIZON EQUITY - LOGGING MIDDLEWARE
# ============================================

import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

logger = logging.getLogger("horizon.api")


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging HTTP requests and response latency metrics."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start_time = time.time()
        
        # Proceed with request
        response = await call_next(request)
        
        # Calculate response time in ms
        process_time = (time.time() - start_time) * 1000
        client_ip = request.client.host if request.client else "unknown"
        
        logger.info(
            f"IP: {client_ip} - Method: {request.method} - Path: {request.url.path} - "
            f"Status: {response.status_code} - Completed in {process_time:.2f}ms"
        )
        
        return response
