# ============================================
# HORIZON EQUITY - CELERY APPLICATION INSTANCE
# ============================================

from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "horizon_equity",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# Load task modules
celery_app.conf.imports = [
    "app.tasks.investment_tasks",
    "app.tasks.email_tasks",
    "app.tasks.report_tasks"
]

# Celery Beat Schedule Configuration
celery_app.conf.beat_schedule = {
    "check-matured-investments-every-minute": {
        "task": "app.tasks.investment_tasks.check_matured_investments",
        "schedule": 60.0,  # Run every 60 seconds for quick testing & verification
    },
    "generate-admin-stats-daily": {
        "task": "app.tasks.report_tasks.generate_daily_stats_report",
        "schedule": 86400.0,  # Run daily
    }
}

# Alias app for default Celery runner search resolution
app = celery_app
