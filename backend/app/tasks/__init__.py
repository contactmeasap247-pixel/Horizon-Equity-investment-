# Horizon Equity Celery Tasks Package
# Importing the configured Celery app here makes it the default app, so that
# @shared_task .delay() calls made from the API use the Redis broker from .env
# (otherwise Celery falls back to amqp://localhost).
from app.tasks.celery_app import celery_app  # noqa: F401

__all__ = ["celery_app"]
