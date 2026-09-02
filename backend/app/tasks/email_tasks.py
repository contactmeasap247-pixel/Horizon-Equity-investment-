# ============================================
# HORIZON EQUITY - EMAIL BACKGROUND WORKERS
# ============================================

import asyncio
from functools import wraps
from celery import shared_task
from app.services.email_service import email_service

def async_task(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        return loop.run_until_complete(f(*args, **kwargs))
    return wrapper

@shared_task(name="app.tasks.email_tasks.send_verification_email_task")
@async_task
async def send_verification_email_task(email: str, token: str):
    """Asynchronous background task to send verification emails."""
    email_service.send_verification_email(email, token)
    return f"Verification email sent to {email}"

@shared_task(name="app.tasks.email_tasks.send_password_reset_email_task")
@async_task
async def send_password_reset_email_task(email: str, token: str):
    """Asynchronous background task to send password reset emails."""
    email_service.send_password_reset_email(email, token)
    return f"Password reset email sent to {email}"
