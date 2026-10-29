# ============================================
# HORIZON EQUITY - API V1 MAIN ROUTER
# ============================================

from fastapi import APIRouter
from app.api.v1 import (
    auth,
    users,
    wallets,
    investments,
    transactions,
    referrals,
    notifications,
    tickets,
    admin,
    admin_wallets,
    loans,
    webhooks,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(wallets.router, prefix="/wallets", tags=["Wallets"])
api_router.include_router(investments.router, prefix="/investments", tags=["Investments"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
api_router.include_router(referrals.router, prefix="/referrals", tags=["Referrals"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(tickets.router, prefix="/tickets", tags=["Support Tickets"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Operations"])
api_router.include_router(admin_wallets.router, prefix="/admin/wallets", tags=["Admin Wallets Management"])
api_router.include_router(loans.router, prefix="/loans", tags=["Loans"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])

