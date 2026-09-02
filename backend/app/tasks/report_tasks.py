# ============================================
# HORIZON EQUITY - SCHEDULED STATS REPORT
# ============================================

import asyncio
from functools import wraps
from datetime import datetime
from celery import shared_task

from app.core.database import async_session
from app.services.admin_service import admin_service

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

@shared_task(name="app.tasks.report_tasks.generate_daily_stats_report")
@async_task
async def generate_daily_stats_report():
    """Trigger daily administrative reports aggregation and print/log stats summary."""
    async with async_session() as db:
        stats = await admin_service.get_dashboard_stats(db)
        print(f"--- DAILY STATUS REPORT AT {datetime.utcnow()} ---")
        print(f"Total Users: {stats.get('total_users')}")
        print(f"KYC Pending: {stats.get('kyc_pending')}")
        print(f"Active Investments: {stats.get('active_investments_count')}")
        print(f"Wallet Balances: {stats.get('wallet_balances')}")
        print("-------------------------------------------------")
        return f"Daily stats generated successfully: {stats.get('total_users')} total users."
