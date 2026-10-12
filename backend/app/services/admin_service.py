# ============================================
# HORIZON EQUITY - ADMIN SERVICE
# Production-ready Platform Management Logic
# ============================================

import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_, and_, desc

from app.models.user import User
from app.models.wallet import Wallet
from app.models.admin_wallet import AdminWallet
from app.models.deposit_request import DepositRequest
from app.models.withdrawal_request import WithdrawalRequest
from app.models.investment import Investment
from app.models.investment_plan import InvestmentPlan
from app.models.transaction import Transaction
from app.models.referral_commission import ReferralCommission
from app.models.session_token import SessionToken
from app.models.audit_log import AuditLog
from app.models.site_setting import SiteSetting
from app.models.notification import Notification
from app.services.notification_service import notification_service
from app.services.transaction_service import transaction_service
from app.services.email_service import email_service
from app.middleware.maintenance import invalidate_maintenance_cache


# Default Email Templates with company-grade luxury aesthetic
DEFAULT_EMAIL_TEMPLATES = {
    "account_welcome": {
        "key": "account_welcome",
        "name": "Welcome to Horizon Equity",
        "category": "ACCOUNT",
        "subject": "Welcome to Horizon Equity — Your Premier Investment Platform",
        "variables": ["user_name", "login_url", "support_email"],
        "html_content": """<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0B0F14; color: #F5F7FA; padding: 40px 20px; max-width: 600px; margin: auto; border-radius: 8px; border: 1px solid #1A2332;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #4388F5; margin: 0; font-size: 24px; letter-spacing: 1px;">HORIZON EQUITY</h1>
    <p style="color: #7D8998; font-size: 13px; margin: 5px 0 0;">Institutional Multi-Asset Wealth Management</p>
  </div>
  <div style="background: #111821; border: 1px solid #1E293B; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
    <h2 style="font-size: 18px; margin-top: 0; color: #FFFFFF;">Welcome, {{user_name}}</h2>
    <p style="color: #94A3B8; font-size: 14px; line-height: 1.6;">Thank you for registering your investor account with Horizon Equity. Your secure gateway to global digital asset portfolios, algorithmic copy trading, and yield strategies is now active.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{login_url}}" style="background: #4388F5; color: #FFFFFF; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Access Client Portal</a>
    </div>
  </div>
  <div style="color: #64748B; font-size: 12px; text-align: center; line-height: 1.5;">
    <p>If you have any questions, our 24/7 private concierge desk is available at {{support_email}}.</p>
    <p>&copy; Horizon Equity Investment Group. All rights reserved.</p>
  </div>
</div>""",
        "text_content": "Welcome {{user_name}} to Horizon Equity. Access your client portal at {{login_url}} or contact {{support_email}}.",
        "is_active": True,
    },
    "deposit_confirmed": {
        "key": "deposit_confirmed",
        "name": "Deposit Confirmed",
        "category": "TRANSACTIONS",
        "subject": "Deposit Confirmed — {{amount}} {{currency}} Credited",
        "variables": ["user_name", "amount", "currency", "reference", "date"],
        "html_content": """<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0B0F14; color: #F5F7FA; padding: 40px 20px; max-width: 600px; margin: auto; border-radius: 8px; border: 1px solid #1A2332;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #4388F5; margin: 0; font-size: 24px;">HORIZON EQUITY</h1>
  </div>
  <div style="background: #111821; border: 1px solid #1E293B; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
    <div style="display: flex; align-items: center; margin-bottom: 15px;">
      <span style="background: rgba(39, 197, 139, 0.15); color: #27C58B; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(39, 197, 139, 0.3);">CONFIRMED</span>
    </div>
    <h2 style="font-size: 18px; margin-top: 0;">Deposit Credited to Wallet</h2>
    <p style="color: #94A3B8; font-size: 14px;">Hello {{user_name}}, your deposit request has been successfully verified by our administrative custody team.</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
      <tr style="border-bottom: 1px solid #1E293B;"><td style="padding: 10px 0; color: #7D8998;">Amount Credited</td><td style="padding: 10px 0; font-weight: 700; text-align: right; color: #27C58B;">+{{amount}} {{currency}}</td></tr>
      <tr style="border-bottom: 1px solid #1E293B;"><td style="padding: 10px 0; color: #7D8998;">Transaction Ref</td><td style="padding: 10px 0; text-align: right; color: #E2E8F0; font-family: monospace;">{{reference}}</td></tr>
      <tr><td style="padding: 10px 0; color: #7D8998;">Timestamp</td><td style="padding: 10px 0; text-align: right; color: #94A3B8;">{{date}}</td></tr>
    </table>
  </div>
  <div style="color: #64748B; font-size: 12px; text-align: center;">&copy; Horizon Equity Group</div>
</div>""",
        "text_content": "Your deposit of {{amount}} {{currency}} has been verified and credited. Reference: {{reference}}.",
        "is_active": True,
    },
    "withdrawal_completed": {
        "key": "withdrawal_completed",
        "name": "Withdrawal Completed",
        "category": "TRANSACTIONS",
        "subject": "Withdrawal Processed — {{amount}} {{currency}} Dispatched",
        "variables": ["user_name", "amount", "currency", "tx_hash", "wallet_address"],
        "html_content": """<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0B0F14; color: #F5F7FA; padding: 40px 20px; max-width: 600px; margin: auto; border-radius: 8px; border: 1px solid #1A2332;">
  <div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #4388F5; margin: 0; font-size: 24px;">HORIZON EQUITY</h1></div>
  <div style="background: #111821; border: 1px solid #1E293B; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
    <h2 style="font-size: 18px; margin-top: 0; color: #FFFFFF;">Withdrawal Successfully Dispatched</h2>
    <p style="color: #94A3B8; font-size: 14px;">Hello {{user_name}}, your withdrawal of {{amount}} {{currency}} has been broadcast to the blockchain network.</p>
    <div style="background: #0B0F14; border: 1px solid #1E293B; padding: 15px; border-radius: 6px; font-size: 13px; margin: 15px 0;">
      <p style="margin: 0 0 8px; color: #7D8998;">Destination Address:</p>
      <p style="margin: 0 0 12px; font-family: monospace; color: #E2E8F0; word-break: break-all;">{{wallet_address}}</p>
      <p style="margin: 0 0 8px; color: #7D8998;">Blockchain TXID:</p>
      <p style="margin: 0; font-family: monospace; color: #4388F5; word-break: break-all;">{{tx_hash}}</p>
    </div>
  </div>
  <div style="color: #64748B; font-size: 12px; text-align: center;">&copy; Horizon Equity Group</div>
</div>""",
        "text_content": "Your withdrawal of {{amount}} {{currency}} has been processed. Destination: {{wallet_address}}. TXID: {{tx_hash}}",
        "is_active": True,
    },
    "investment_activated": {
        "key": "investment_activated",
        "name": "Investment Plan Activated",
        "category": "INVESTMENTS",
        "subject": "Investment Portfolio Activated — {{plan_name}}",
        "variables": ["user_name", "plan_name", "amount", "currency", "expected_return", "maturity_date"],
        "html_content": """<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0B0F14; color: #F5F7FA; padding: 40px 20px; max-width: 600px; margin: auto; border-radius: 8px; border: 1px solid #1A2332;">
  <div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #4388F5; margin: 0; font-size: 24px;">HORIZON EQUITY</h1></div>
  <div style="background: #111821; border: 1px solid #1E293B; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
    <h2 style="font-size: 18px; margin-top: 0; color: #FFFFFF;">Portfolio Contract Initiated</h2>
    <p style="color: #94A3B8; font-size: 14px;">Hello {{user_name}}, your capital commitment for the <strong>{{plan_name}}</strong> portfolio tier is officially active.</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
      <tr style="border-bottom: 1px solid #1E293B;"><td style="padding: 10px 0; color: #7D8998;">Principal Capital</td><td style="padding: 10px 0; font-weight: 700; text-align: right; color: #E2E8F0;">{{amount}} {{currency}}</td></tr>
      <tr style="border-bottom: 1px solid #1E293B;"><td style="padding: 10px 0; color: #7D8998;">Target Return</td><td style="padding: 10px 0; font-weight: 700; text-align: right; color: #27C58B;">{{expected_return}} {{currency}}</td></tr>
      <tr><td style="padding: 10px 0; color: #7D8998;">Scheduled Maturity</td><td style="padding: 10px 0; text-align: right; color: #94A3B8;">{{maturity_date}}</td></tr>
    </table>
  </div>
  <div style="color: #64748B; font-size: 12px; text-align: center;">&copy; Horizon Equity Group</div>
</div>""",
        "text_content": "Your investment of {{amount}} {{currency}} in {{plan_name}} has been activated. Scheduled maturity: {{maturity_date}}.",
        "is_active": True,
    },
    "reinvestment_confirmed": {
        "key": "reinvestment_confirmed",
        "name": "Withdrawal Reinvestment Confirmed",
        "category": "INVESTMENTS",
        "subject": "Reinvestment Confirmation — {{amount}} {{currency}} Allocated to {{plan_name}}",
        "variables": ["user_name", "amount", "currency", "plan_name", "maturity_date"],
        "html_content": """<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0B0F14; color: #F5F7FA; padding: 40px 20px; max-width: 600px; margin: auto; border-radius: 8px; border: 1px solid #1A2332;">
  <div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #4388F5; margin: 0; font-size: 24px;">HORIZON EQUITY</h1></div>
  <div style="background: #111821; border: 1px solid #1E293B; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
    <h2 style="font-size: 18px; margin-top: 0; color: #FFFFFF;">Withdrawal Funds Reinvested</h2>
    <p style="color: #94A3B8; font-size: 14px;">Hello {{user_name}}, as requested, your withdrawal amount of {{amount}} {{currency}} has been successfully reinvested into the <strong>{{plan_name}}</strong> portfolio.</p>
    <p style="color: #94A3B8; font-size: 14px;">Capital will mature on: <strong>{{maturity_date}}</strong>.</p>
  </div>
  <div style="color: #64748B; font-size: 12px; text-align: center;">&copy; Horizon Equity Group</div>
</div>""",
        "text_content": "Your withdrawal of {{amount}} {{currency}} has been reinvested into {{plan_name}} maturing on {{maturity_date}}.",
        "is_active": True,
    },
    "security_alert": {
        "key": "security_alert",
        "name": "Account Security Alert",
        "category": "SECURITY AND SYSTEM",
        "subject": "Security Notice — Account Activity on Horizon Equity",
        "variables": ["user_name", "event_type", "ip_address", "timestamp"],
        "html_content": """<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0B0F14; color: #F5F7FA; padding: 40px 20px; max-width: 600px; margin: auto; border-radius: 8px; border: 1px solid #1A2332;">
  <div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #4388F5; margin: 0; font-size: 24px;">HORIZON EQUITY</h1></div>
  <div style="background: #111821; border: 1px solid #E05252; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
    <h2 style="font-size: 18px; margin-top: 0; color: #E05252;">Security Notice: {{event_type}}</h2>
    <p style="color: #94A3B8; font-size: 14px;">Hello {{user_name}}, an important security event was recorded on your account.</p>
    <p style="color: #E2E8F0; font-size: 13px;">IP Address: <span style="font-family: monospace;">{{ip_address}}</span><br/>Timestamp: {{timestamp}}</p>
    <p style="color: #94A3B8; font-size: 13px;">If this was not you, please immediately contact support or reset your password.</p>
  </div>
  <div style="color: #64748B; font-size: 12px; text-align: center;">&copy; Horizon Equity Group</div>
</div>""",
        "text_content": "Security Alert: {{event_type}} detected from IP {{ip_address}} at {{timestamp}}.",
        "is_active": True,
    },
}


class AdminService:
    """Production-ready management capabilities for Horizon Equity platform."""

    # ========================================================
    # 1. OVERVIEW & METRICS AGGREGATION
    # ========================================================

    @staticmethod
    async def get_dashboard_stats(db: AsyncSession, period: Optional[str] = "all") -> Dict[str, Any]:
        """
        Aggregate platform activity metrics strictly from real database records.
        Supports time filtering (today, 7d, 30d, 90d, all).
        """
        now = datetime.utcnow()
        period_filter = None
        if period == "today":
            period_filter = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "7d":
            period_filter = now - timedelta(days=7)
        elif period == "30d":
            period_filter = now - timedelta(days=30)
        elif period == "90d":
            period_filter = now - timedelta(days=90)

        # 1. User counts
        total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
        active_users = (
            await db.execute(
                select(func.count(User.id)).filter(User.is_active == True, User.is_suspended == False)
            )
        ).scalar() or 0
        suspended_users = (
            await db.execute(select(func.count(User.id)).filter(User.is_suspended == True))
        ).scalar() or 0
        kyc_pending = (
            await db.execute(select(func.count(User.id)).filter(User.kyc_status == "pending"))
        ).scalar() or 0

        # 2. Total platform wallet balances across users
        balances_query = await db.execute(
            select(Wallet.currency, func.sum(Wallet.balance)).group_by(Wallet.currency)
        )
        wallet_balances = {currency.upper(): float(total or 0.0) for currency, total in balances_query.all()}
        for cur in ["BTC", "ETH", "USDT", "SOL"]:
            if cur not in wallet_balances:
                wallet_balances[cur] = 0.0

        # 3. Deposits
        dep_base = select(DepositRequest)
        if period_filter:
            dep_base = dep_base.filter(DepositRequest.created_at >= period_filter)
        
        total_deposits_count = (
            await db.execute(select(func.count(DepositRequest.id)).where(DepositRequest.created_at >= period_filter if period_filter else True))
        ).scalar() or 0

        pending_deposits_count = (
            await db.execute(
                select(func.count(DepositRequest.id)).filter(DepositRequest.status == "pending")
            )
        ).scalar() or 0

        # Deposits volume by currency
        dep_vol_query = select(DepositRequest.currency, func.sum(DepositRequest.amount)).filter(
            DepositRequest.status == "verified"
        )
        if period_filter:
            dep_vol_query = dep_vol_query.filter(DepositRequest.created_at >= period_filter)
        dep_vol_res = await db.execute(dep_vol_query.group_by(DepositRequest.currency))
        total_deposits_amount = {cur.upper(): float(amt or 0.0) for cur, amt in dep_vol_res.all()}
        for cur in ["BTC", "ETH", "USDT", "SOL"]:
            if cur not in total_deposits_amount:
                total_deposits_amount[cur] = 0.0

        # 4. Withdrawals
        wdr_base = select(WithdrawalRequest)
        if period_filter:
            wdr_base = wdr_base.filter(WithdrawalRequest.created_at >= period_filter)

        total_withdrawals_count = (
            await db.execute(
                select(func.count(WithdrawalRequest.id)).where(WithdrawalRequest.created_at >= period_filter if period_filter else True)
            )
        ).scalar() or 0

        pending_withdrawals_count = (
            await db.execute(
                select(func.count(WithdrawalRequest.id)).filter(WithdrawalRequest.status == "pending")
            )
        ).scalar() or 0

        completed_withdrawals_count = (
            await db.execute(
                select(func.count(WithdrawalRequest.id)).filter(WithdrawalRequest.status == "completed")
            )
        ).scalar() or 0

        wdr_vol_query = select(WithdrawalRequest.currency, func.sum(WithdrawalRequest.amount)).filter(
            WithdrawalRequest.status == "completed"
        )
        if period_filter:
            wdr_vol_query = wdr_vol_query.filter(WithdrawalRequest.created_at >= period_filter)
        wdr_vol_res = await db.execute(wdr_vol_query.group_by(WithdrawalRequest.currency))
        total_withdrawals_amount = {cur.upper(): float(amt or 0.0) for cur, amt in wdr_vol_res.all()}
        for cur in ["BTC", "ETH", "USDT", "SOL"]:
            if cur not in total_withdrawals_amount:
                total_withdrawals_amount[cur] = 0.0

        # 5. Active investments
        active_investments_count = (
            await db.execute(select(func.count(Investment.id)).filter(Investment.status == "active"))
        ).scalar() or 0

        inv_vol_res = await db.execute(
            select(Investment.currency, func.sum(Investment.amount))
            .filter(Investment.status == "active")
            .group_by(Investment.currency)
        )
        active_investments_amount = {cur.upper(): float(amt or 0.0) for cur, amt in inv_vol_res.all()}
        for cur in ["BTC", "ETH", "USDT", "SOL"]:
            if cur not in active_investments_amount:
                active_investments_amount[cur] = 0.0

        # 6. Referral commissions
        ref_comm_res = await db.execute(
            select(ReferralCommission.currency, func.sum(ReferralCommission.commission_amount))
            .filter(ReferralCommission.status == "paid")
            .group_by(ReferralCommission.currency)
        )
        total_referral_commissions = {cur.upper(): float(amt or 0.0) for cur, amt in ref_comm_res.all()}
        for cur in ["BTC", "ETH", "USDT", "SOL"]:
            if cur not in total_referral_commissions:
                total_referral_commissions[cur] = 0.0

        # 7. Total platform transactions
        tx_query = select(func.count(Transaction.id))
        if period_filter:
            tx_query = tx_query.filter(Transaction.created_at >= period_filter)
        total_transactions_count = (await db.execute(tx_query)).scalar() or 0

        # 8. Historical activity chart (grouping transactions by date over 7/14 buckets)
        chart_days = 7 if period in ["today", "7d"] else (30 if period == "30d" else 14)
        activity_chart = []
        for d in range(chart_days - 1, -1, -1):
            day_start = (now - timedelta(days=d)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            date_label = day_start.strftime("%b %d")

            tx_count = (
                await db.execute(
                    select(func.count(Transaction.id)).filter(
                        Transaction.created_at >= day_start,
                        Transaction.created_at < day_end,
                    )
                )
            ).scalar() or 0

            dep_count = (
                await db.execute(
                    select(func.count(DepositRequest.id)).filter(
                        DepositRequest.created_at >= day_start,
                        DepositRequest.created_at < day_end,
                        DepositRequest.status == "verified",
                    )
                )
            ).scalar() or 0

            wdr_count = (
                await db.execute(
                    select(func.count(WithdrawalRequest.id)).filter(
                        WithdrawalRequest.created_at >= day_start,
                        WithdrawalRequest.created_at < day_end,
                        WithdrawalRequest.status == "completed",
                    )
                )
            ).scalar() or 0

            activity_chart.append({
                "date": date_label,
                "transactions": tx_count,
                "deposits": dep_count,
                "withdrawals": wdr_count,
            })

        return {
            "total_users": total_users,
            "active_users": active_users,
            "suspended_users": suspended_users,
            "kyc_pending": kyc_pending,
            "total_deposits_count": total_deposits_count,
            "total_deposits_amount": total_deposits_amount,
            "total_withdrawals_count": total_withdrawals_count,
            "total_withdrawals_amount": total_withdrawals_amount,
            "completed_withdrawals_count": completed_withdrawals_count,
            "pending_deposits_count": pending_deposits_count,
            "pending_withdrawals_count": pending_withdrawals_count,
            "active_investments_count": active_investments_count,
            "active_investments_amount": active_investments_amount,
            "total_transactions_count": total_transactions_count,
            "total_referral_commissions": total_referral_commissions,
            "wallet_balances": wallet_balances,
            "activity_chart": activity_chart,
            "refreshed_at": now,
        }

    # ========================================================
    # 2. USER MANAGEMENT & DRILLDOWN
    # ========================================================

    @staticmethod
    async def get_user_detail(db: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        """Fetch exhaustive user drilldown details, balances, investments, deposits, withdrawals and audit history."""
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        # Wallets
        wallets_res = await db.execute(select(Wallet).filter(Wallet.user_id == user_id))
        wallets_data = [
            {
                "id": str(w.id),
                "currency": w.currency,
                "balance": float(w.balance),
                "frozen_balance": float(w.frozen_balance),
                "total_deposited": float(w.total_deposited),
                "total_withdrawn": float(w.total_withdrawn),
            }
            for w in wallets_res.scalars().all()
        ]

        # Active Investments
        inv_res = await db.execute(
            select(Investment, InvestmentPlan)
            .join(InvestmentPlan, Investment.plan_id == InvestmentPlan.id)
            .filter(Investment.user_id == user_id)
            .order_by(Investment.created_at.desc())
        )
        investments_data = []
        for inv, plan in inv_res.all():
            rem_sec = max(0, int((inv.maturity_date - datetime.utcnow()).total_seconds())) if inv.maturity_date else 0
            investments_data.append({
                "id": str(inv.id),
                "plan_name": plan.name,
                "amount": float(inv.amount),
                "currency": inv.currency,
                "expected_return": float(inv.expected_return),
                "status": inv.status,
                "start_date": inv.start_date.isoformat() if inv.start_date else None,
                "maturity_date": inv.maturity_date.isoformat() if inv.maturity_date else None,
                "remaining_seconds": rem_sec,
            })

        # Deposits summary
        dep_res = await db.execute(
            select(DepositRequest).filter(DepositRequest.user_id == user_id).order_by(DepositRequest.created_at.desc()).limit(20)
        )
        deposits_data = [
            {
                "id": str(d.id),
                "amount": float(d.amount),
                "currency": d.currency,
                "wallet_address": d.wallet_address,
                "transaction_hash": d.transaction_hash,
                "status": d.status,
                "created_at": d.created_at.isoformat() if d.created_at else None,
            }
            for d in dep_res.scalars().all()
        ]

        # Withdrawals summary
        wdr_res = await db.execute(
            select(WithdrawalRequest).filter(WithdrawalRequest.user_id == user_id).order_by(WithdrawalRequest.created_at.desc()).limit(20)
        )
        withdrawals_data = [
            {
                "id": str(w.id),
                "amount": float(w.amount),
                "currency": w.currency,
                "wallet_address": w.wallet_address,
                "transaction_hash": w.transaction_hash,
                "status": w.status,
                "rejection_reason": w.rejection_reason,
                "created_at": w.created_at.isoformat() if w.created_at else None,
            }
            for w in wdr_res.scalars().all()
        ]

        # Transactions
        tx_res = await db.execute(
            select(Transaction).filter(Transaction.user_id == user_id).order_by(Transaction.created_at.desc()).limit(25)
        )
        transactions_data = [
            {
                "id": str(t.id),
                "type": t.type,
                "amount": float(t.amount),
                "currency": t.currency,
                "status": t.status,
                "reference": t.reference,
                "description": t.description,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
            for t in tx_res.scalars().all()
        ]

        # Audit events for this user
        audit_res = await db.execute(
            select(AuditLog).filter(or_(AuditLog.user_id == user_id, AuditLog.entity_id == user_id)).order_by(AuditLog.created_at.desc()).limit(20)
        )
        audit_data = [
            {
                "id": str(a.id),
                "action": a.action,
                "entity_type": a.entity_type,
                "new_values": a.new_values,
                "ip_address": a.ip_address,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in audit_res.scalars().all()
        ]

        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "country": user.country,
            "city": user.city,
            "address": user.address,
            "btc_wallet": user.btc_wallet,
            "usdt_wallet": user.usdt_wallet,
            "eth_wallet": user.eth_wallet,
            "sol_wallet": user.sol_wallet,
            "email_verified": user.email_verified,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
            "is_suspended": user.is_suspended,
            "suspension_reason": user.suspension_reason,
            "kyc_status": user.kyc_status,
            "kyc_documents": user.kyc_documents,
            "created_at": user.created_at,
            "last_login": user.last_login,
            "login_ip": user.login_ip,
            "referral_code": user.referral_code,
            "referral_count": user.referral_count,
            "referral_earnings": float(user.referral_earnings or 0.0),
            "wallets": wallets_data,
            "active_investments": investments_data,
            "deposit_history": deposits_data,
            "withdrawal_history": withdrawals_data,
            "transactions": transactions_data,
            "audit_events": audit_data,
        }

    @staticmethod
    async def update_user_profile(
        db: AsyncSession,
        user_id: uuid.UUID,
        payload: Dict[str, Any],
        admin_id: uuid.UUID,
    ) -> User:
        """Edit user personal profile fields, logging an administrative audit trail."""
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        old_values = {}
        new_values = {}

        for field in ["full_name", "phone", "country", "city", "address", "btc_wallet", "usdt_wallet", "eth_wallet", "sol_wallet"]:
            if field in payload and payload[field] is not None:
                old_values[field] = getattr(user, field)
                setattr(user, field, payload[field])
                new_values[field] = payload[field]

        if new_values:
            audit = AuditLog(
                user_id=user.id,
                admin_id=admin_id,
                action="admin_updated_user_profile",
                entity_type="user",
                entity_id=user.id,
                old_values=old_values,
                new_values=new_values,
            )
            db.add(audit)
            db.add(user)
            await db.commit()
            await db.refresh(user)

        return user

    # ========================================================
    # 3. WITHDRAWAL PROCESSING & REINVESTMENT
    # ========================================================

    @staticmethod
    async def reinvest_withdrawal(
        db: AsyncSession,
        withdrawal_id: uuid.UUID,
        plan_id: uuid.UUID,
        admin_id: uuid.UUID,
    ) -> Dict[str, Any]:
        """
        Atomically reinvest a user's pending withdrawal amount into an active investment plan.
        Prevents balance corruption, updates frozen balance, creates Investment record,
        logs immutable Transaction ledger, dispatches notification and audit record.
        """
        # Fetch withdrawal
        wdr_res = await db.execute(select(WithdrawalRequest).filter(WithdrawalRequest.id == withdrawal_id))
        wdr = wdr_res.scalars().first()
        if not wdr:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Withdrawal request not found.")

        if wdr.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Withdrawal request cannot be reinvested; current status is '{wdr.status}'.",
            )

        # Fetch investment plan
        plan_res = await db.execute(select(InvestmentPlan).filter(InvestmentPlan.id == plan_id))
        plan = plan_res.scalars().first()
        if not plan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Selected investment plan not found.")

        if not plan.is_active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selected investment plan is currently inactive.")

        # Validate amount
        if wdr.amount < plan.min_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Withdrawal amount ({wdr.amount} {wdr.currency}) is below plan minimum of {plan.min_amount}.",
            )
        if plan.max_amount and wdr.amount > plan.max_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Withdrawal amount ({wdr.amount} {wdr.currency}) exceeds plan maximum of {plan.max_amount}.",
            )

        # Retrieve user wallet
        wallet_res = await db.execute(
            select(Wallet).filter(Wallet.user_id == wdr.user_id, Wallet.currency == wdr.currency)
        )
        wallet = wallet_res.scalars().first()
        if not wallet or wallet.frozen_balance < wdr.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inadequate frozen funds available on user wallet to execute reinvestment.",
            )

        # 1. Deduct frozen balance
        wallet.frozen_balance -= wdr.amount
        db.add(wallet)

        # 2. Update withdrawal request status to 'reinvested'
        wdr.status = "reinvested"
        wdr.processed_by = admin_id
        wdr.processed_at = datetime.utcnow()
        wdr.rejection_reason = f"Reinvested into {plan.name} Plan"
        db.add(wdr)

        # 3. Create new Investment
        expected_return = wdr.amount * (Decimal("1.0") + (plan.return_percentage / Decimal("100.0")))
        start_date = datetime.utcnow()
        maturity_date = start_date + timedelta(days=plan.duration_days)

        new_inv = Investment(
            user_id=wdr.user_id,
            plan_id=plan.id,
            amount=wdr.amount,
            currency=wdr.currency,
            expected_return=expected_return,
            status="active",
            start_date=start_date,
            maturity_date=maturity_date,
        )
        db.add(new_inv)

        # 4. Create Transaction Ledger Record
        reinvest_ref = f"REINV-{wdr.id.hex[:10].upper()}"
        await transaction_service.create_transaction(
            db,
            user_id=wdr.user_id,
            type="reinvestment",
            amount=wdr.amount,
            currency=wdr.currency,
            status="completed",
            reference=reinvest_ref,
            description=f"Withdrawal reinvested directly into {plan.name} portfolio.",
        )

        # 5. Send Notification
        await notification_service.create_notification(
            db,
            user_id=wdr.user_id,
            type="investment",
            title="Capital Reinvested",
            message=f"Your withdrawal of {wdr.amount} {wdr.currency} has been successfully reinvested into the {plan.name} plan.",
        )

        # 6. Audit Log
        audit = AuditLog(
            user_id=wdr.user_id,
            admin_id=admin_id,
            action="withdrawal_reinvested",
            entity_type="withdrawal_request",
            entity_id=wdr.id,
            new_values={
                "withdrawal_id": str(wdr.id),
                "plan_id": str(plan.id),
                "plan_name": plan.name,
                "amount": float(wdr.amount),
                "currency": wdr.currency,
                "reference": reinvest_ref,
            },
        )
        db.add(audit)

        await db.commit()
        await db.refresh(new_inv)

        return {
            "status": "success",
            "message": f"Successfully reinvested {wdr.amount} {wdr.currency} into {plan.name}.",
            "investment_id": str(new_inv.id),
            "reference": reinvest_ref,
            "maturity_date": maturity_date.isoformat(),
        }

    # ========================================================
    # 4. ACTIVE INVESTMENTS & MATURITY
    # ========================================================

    @staticmethod
    async def get_active_investments(db: AsyncSession) -> List[Dict[str, Any]]:
        """Retrieve all currently active unexpired investments across the platform with maturity countdowns."""
        query = (
            select(Investment, User, InvestmentPlan)
            .join(User, Investment.user_id == User.id)
            .join(InvestmentPlan, Investment.plan_id == InvestmentPlan.id)
            .filter(Investment.status == "active")
            .order_by(Investment.maturity_date.asc())
        )
        result = await db.execute(query)
        items = []
        now = datetime.utcnow()

        for inv, user, plan in result.all():
            rem_sec = max(0, int((inv.maturity_date - now).total_seconds())) if inv.maturity_date else 0
            is_approaching = (rem_sec <= 86400 and rem_sec > 0)

            items.append({
                "id": inv.id,
                "user_id": user.id,
                "user_name": user.full_name,
                "user_email": user.email,
                "plan_id": plan.id,
                "plan_name": plan.name,
                "amount": float(inv.amount),
                "currency": inv.currency,
                "expected_return": float(inv.expected_return),
                "return_percentage": float(plan.return_percentage),
                "duration_days": plan.duration_days,
                "start_date": inv.start_date,
                "maturity_date": inv.maturity_date,
                "remaining_seconds": rem_sec,
                "status": inv.status,
                "is_approaching_maturity": is_approaching,
            })

        return items

    @staticmethod
    async def process_matured_investments(db: AsyncSession, admin_id: uuid.UUID) -> Dict[str, Any]:
        """
        Check for any investments whose maturity date has passed, settle returns to user wallets,
        and mark them as matured in an atomic transaction.
        """
        now = datetime.utcnow()
        query = (
            select(Investment, InvestmentPlan)
            .join(InvestmentPlan, Investment.plan_id == InvestmentPlan.id)
            .filter(Investment.status == "active", Investment.maturity_date <= now)
        )
        result = await db.execute(query)
        matured_list = result.all()

        processed_count = 0
        total_credited = {"BTC": 0.0, "ETH": 0.0, "USDT": 0.0, "SOL": 0.0}

        for inv, plan in matured_list:
            inv.status = "matured"
            inv.actual_return = inv.expected_return
            inv.end_date = now
            db.add(inv)

            # Credit user wallet
            wallet_res = await db.execute(
                select(Wallet).filter(Wallet.user_id == inv.user_id, Wallet.currency == inv.currency)
            )
            wallet = wallet_res.scalars().first()
            if not wallet:
                wallet = Wallet(user_id=inv.user_id, currency=inv.currency, balance=Decimal("0.0"))
                db.add(wallet)

            wallet.balance += inv.expected_return
            db.add(wallet)

            # Ledger entry
            tx_ref = f"MAT-{inv.id.hex[:10].upper()}"
            await transaction_service.create_transaction(
                db,
                user_id=inv.user_id,
                type="return",
                amount=inv.expected_return,
                currency=inv.currency,
                status="completed",
                reference=tx_ref,
                description=f"Investment return for completed {plan.name} contract.",
            )

            # Notify user
            await notification_service.create_notification(
                db,
                user_id=inv.user_id,
                type="investment",
                title="Investment Matured",
                message=f"Your {plan.name} investment has matured! {inv.expected_return} {inv.currency} has been credited to your wallet.",
            )

            cur = inv.currency.upper()
            total_credited[cur] = total_credited.get(cur, 0.0) + float(inv.expected_return)
            processed_count += 1

        if processed_count > 0:
            audit = AuditLog(
                admin_id=admin_id,
                action="matured_investments_processed",
                entity_type="investment",
                new_values={"count": processed_count, "totals": total_credited},
            )
            db.add(audit)
            await db.commit()

        return {
            "processed_count": processed_count,
            "total_credited": total_credited,
        }

    # ========================================================
    # 5. PLATFORM TRANSACTIONS LEDGER
    # ========================================================

    @staticmethod
    async def get_platform_transactions(
        db: AsyncSession,
        search: Optional[str] = None,
        type_filter: Optional[str] = None,
        status_filter: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Dict[str, Any]:
        """Comprehensive search and audit over entire platform financial transaction history."""
        query = select(Transaction, User).join(User, Transaction.user_id == User.id)

        if search:
            s = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Transaction.reference.ilike(s),
                    Transaction.description.ilike(s),
                    User.email.ilike(s),
                    User.full_name.ilike(s),
                )
            )

        if type_filter:
            query = query.filter(Transaction.type == type_filter.lower().strip())

        if status_filter:
            query = query.filter(Transaction.status == status_filter.lower().strip())

        if start_date:
            query = query.filter(Transaction.created_at >= start_date)

        if end_date:
            query = query.filter(Transaction.created_at <= end_date)

        # Count total matching
        count_query = select(func.count(Transaction.id)).select_from(query.subquery())
        total_count = (await db.execute(count_query)).scalar() or 0

        # Execute paginated
        result = await db.execute(query.order_by(Transaction.created_at.desc()).offset(offset).limit(limit))
        
        items = []
        for tx, user in result.all():
            items.append({
                "id": str(tx.id),
                "user_id": str(user.id),
                "user_name": user.full_name,
                "user_email": user.email,
                "type": tx.type,
                "subtype": tx.subtype,
                "amount": float(tx.amount),
                "fee": float(tx.fee or 0.0),
                "currency": tx.currency,
                "status": tx.status,
                "reference": tx.reference or f"TX-{tx.id.hex[:10].upper()}",
                "description": tx.description,
                "created_at": tx.created_at.isoformat() if tx.created_at else None,
            })

        return {
            "total": total_count,
            "items": items,
            "limit": limit,
            "offset": offset,
        }

    # ========================================================
    # 6. REFERRAL ANALYTICS
    # ========================================================

    @staticmethod
    async def get_referral_analytics(db: AsyncSession) -> Dict[str, Any]:
        """Aggregate referral network leaders and commission records."""
        # Top Referrers
        top_query = (
            select(User)
            .filter(User.referral_count > 0)
            .order_by(User.referral_earnings.desc(), User.referral_count.desc())
            .limit(20)
        )
        top_res = await db.execute(top_query)
        top_referrers = [
            {
                "id": str(u.id),
                "name": u.full_name,
                "email": u.email,
                "referral_code": u.referral_code,
                "referral_count": u.referral_count,
                "referral_earnings": float(u.referral_earnings or 0.0),
            }
            for u in top_res.scalars().all()
        ]

        # Total paid commissions by currency
        paid_comm = await db.execute(
            select(ReferralCommission.currency, func.sum(ReferralCommission.commission_amount))
            .filter(ReferralCommission.status == "paid")
            .group_by(ReferralCommission.currency)
        )
        paid_totals = {cur.upper(): float(amt or 0.0) for cur, amt in paid_comm.all()}

        # Total pending commissions by currency
        pending_comm = await db.execute(
            select(ReferralCommission.currency, func.sum(ReferralCommission.commission_amount))
            .filter(ReferralCommission.status == "pending")
            .group_by(ReferralCommission.currency)
        )
        pending_totals = {cur.upper(): float(amt or 0.0) for cur, amt in pending_comm.all()}

        # Recent commissions list
        recent_res = await db.execute(
            select(ReferralCommission, User)
            .join(User, ReferralCommission.referrer_id == User.id)
            .order_by(ReferralCommission.created_at.desc())
            .limit(30)
        )
        recent_commissions = [
            {
                "id": str(rc.id),
                "referrer_name": user.full_name,
                "referrer_email": user.email,
                "amount": float(rc.commission_amount),
                "currency": rc.currency,
                "status": rc.status,
                "created_at": rc.created_at.isoformat() if rc.created_at else None,
            }
            for rc, user in recent_res.all()
        ]

        return {
            "top_referrers": top_referrers,
            "paid_totals": paid_totals,
            "pending_totals": pending_totals,
            "recent_commissions": recent_commissions,
        }

    # ========================================================
    # 7. PLATFORM SETTINGS & AUTO WITHDRAWAL
    # ========================================================

    @staticmethod
    async def get_settings(db: AsyncSession, group_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve persisted platform configurations, initializing defaults if absent."""
        query = select(SiteSetting)
        if group_name:
            query = query.filter(SiteSetting.group_name == group_name)
        result = await db.execute(query)
        settings_list = result.scalars().all()

        # Seed defaults if database table is empty
        if not settings_list and not group_name:
            defaults = [
                SiteSetting(
                    key="general_settings",
                    group_name="general",
                    value={
                        "platform_name": "Horizon Equity",
                        "support_email": "support@horizonequity.io",
                        "base_currency": "USD",
                        "operating_timezone": "UTC",
                        "company_address": "Horizon Towers, Financial Center, London",
                    },
                    description="General brand, legal, and operational parameters",
                ),
                SiteSetting(
                    key="deposit_settings",
                    group_name="deposits",
                    value={
                        "min_deposit_btc": 0.001,
                        "min_deposit_eth": 0.02,
                        "min_deposit_usdt": 50.0,
                        "min_deposit_sol": 0.5,
                        "require_manual_approval": True,
                    },
                    description="Deposit minimums and operational controls",
                ),
                SiteSetting(
                    key="withdrawal_settings",
                    group_name="withdrawals",
                    value={
                        "min_withdrawal_usd": 50.0,
                        "max_withdrawal_usd": 250000.0,
                        "withdrawal_fee_percent": 0.5,
                        "requires_kyc": True,
                    },
                    description="Withdrawal threshold and validation controls",
                ),
                SiteSetting(
                    key="auto_withdrawal_settings",
                    group_name="withdrawals",
                    value={
                        "enabled": False,
                        "max_threshold": 500.0,
                        "allowed_currencies": ["USDT", "BTC"],
                        "requires_kyc": True,
                        "manual_review_above": 500.0,
                    },
                    description="Autonomous blockchain withdrawal limits and controls",
                ),
                SiteSetting(
                    key="security_settings",
                    group_name="security",
                    value={
                        "maintenance_mode": False,
                        "maintenance_message": "Horizon Equity is currently undergoing scheduled platform maintenance. Please check back shortly.",
                        "two_factor_enforced": False,
                        "max_login_attempts": 5,
                        "lockout_duration_minutes": 30,
                    },
                    description="Security enforcement policies and maintenance mode",
                ),
            ]
            for s in defaults:
                db.add(s)
            await db.commit()
            return [
                {
                    "key": s.key,
                    "value": s.value,
                    "group_name": s.group_name,
                    "description": s.description,
                    "updated_at": s.updated_at,
                }
                for s in defaults
            ]

        return [
            {
                "key": s.key,
                "value": s.value,
                "group_name": s.group_name,
                "description": s.description,
                "updated_at": s.updated_at,
            }
            for s in settings_list
        ]

    @staticmethod
    async def update_setting(
        db: AsyncSession,
        key: str,
        value: Any,
        admin_id: uuid.UUID,
    ) -> Dict[str, Any]:
        """Persistently update a configuration key and invalidate caches if critical."""
        result = await db.execute(select(SiteSetting).filter(SiteSetting.key == key))
        setting = result.scalars().first()

        old_val = None
        if not setting:
            setting = SiteSetting(key=key, value=value, group_name="general")
            db.add(setting)
        else:
            old_val = setting.value
            setting.value = value
            setting.updated_at = datetime.utcnow()
            db.add(setting)

        # Invalidate maintenance cache if security settings modified
        if key == "security_settings":
            invalidate_maintenance_cache()

        audit = AuditLog(
            admin_id=admin_id,
            action="platform_setting_updated",
            entity_type="site_setting",
            old_values={"key": key, "value": old_val},
            new_values={"key": key, "value": value},
        )
        db.add(audit)

        await db.commit()
        await db.refresh(setting)
        return {
            "key": setting.key,
            "value": setting.value,
            "group_name": setting.group_name,
            "updated_at": setting.updated_at,
        }

    # ========================================================
    # 8. EMAIL TEMPLATES MANAGEMENT
    # ========================================================

    @staticmethod
    async def get_email_templates(db: AsyncSession) -> List[Dict[str, Any]]:
        """Retrieve company-quality email templates from database storage or loaded defaults."""
        result = await db.execute(select(SiteSetting).filter(SiteSetting.key == "email_templates"))
        setting = result.scalars().first()

        if setting and isinstance(setting.value, dict):
            saved_templates = setting.value
            # Merge with default structure to ensure all keys exist
            merged = {}
            for k, def_tmpl in DEFAULT_EMAIL_TEMPLATES.items():
                if k in saved_templates:
                    merged[k] = {**def_tmpl, **saved_templates[k]}
                else:
                    merged[k] = def_tmpl
            return list(merged.values())

        return list(DEFAULT_EMAIL_TEMPLATES.values())

    @staticmethod
    async def update_email_template(
        db: AsyncSession,
        key: str,
        payload: Dict[str, Any],
        admin_id: uuid.UUID,
    ) -> Dict[str, Any]:
        """Update subject, html body, and active state of an email template."""
        result = await db.execute(select(SiteSetting).filter(SiteSetting.key == "email_templates"))
        setting = result.scalars().first()

        current_templates = {}
        if setting and isinstance(setting.value, dict):
            current_templates = dict(setting.value)
        else:
            current_templates = {k: v for k, v in DEFAULT_EMAIL_TEMPLATES.items()}

        if key not in current_templates and key not in DEFAULT_EMAIL_TEMPLATES:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template key not found.")

        tmpl = current_templates.get(key, DEFAULT_EMAIL_TEMPLATES[key])
        if "subject" in payload and payload["subject"]:
            tmpl["subject"] = payload["subject"]
        if "html_content" in payload and payload["html_content"]:
            tmpl["html_content"] = payload["html_content"]
        if "text_content" in payload and payload["text_content"]:
            tmpl["text_content"] = payload["text_content"]
        if "is_active" in payload:
            tmpl["is_active"] = bool(payload["is_active"])

        tmpl["updated_at"] = datetime.utcnow().isoformat()
        current_templates[key] = tmpl

        if not setting:
            setting = SiteSetting(key="email_templates", group_name="email", value=current_templates)
            db.add(setting)
        else:
            setting.value = current_templates
            setting.updated_at = datetime.utcnow()
            db.add(setting)

        audit = AuditLog(
            admin_id=admin_id,
            action="email_template_updated",
            entity_type="email_template",
            new_values={"key": key, "subject": tmpl["subject"]},
        )
        db.add(audit)

        await db.commit()
        return tmpl

    @staticmethod
    async def send_test_email(
        db: AsyncSession,
        template_key: str,
        recipient_email: str,
        variables: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """Render a template with variables and dispatch a test preview email."""
        templates = await AdminService.get_email_templates(db)
        target = next((t for t in templates if t["key"] == template_key), None)
        if not target:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email template not found.")

        # Default sample data for preview variables
        vars_dict = {
            "user_name": "Valued Investor",
            "amount": "1,500.00",
            "currency": "USDT",
            "reference": "TEST-TX-78945",
            "date": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
            "login_url": "https://horizonequity.io/login",
            "support_email": "support@horizonequity.io",
            "plan_name": "Apex Yield Tier",
            "expected_return": "1,725.00",
            "maturity_date": (datetime.utcnow() + timedelta(days=30)).strftime("%Y-%m-%d"),
            "tx_hash": "0x7a8b9c...f1e2d3",
            "wallet_address": "0x9876543210abcdef9876543210abcdef98765432",
            "event_type": "Authorized Test Notification",
            "ip_address": "127.0.0.1",
            "timestamp": datetime.utcnow().isoformat(),
        }
        if variables:
            vars_dict.update(variables)

        # Substitute variables safely
        subject = target["subject"]
        html_body = target["html_content"]
        text_body = target["text_content"]

        for var_name, var_val in vars_dict.items():
            subject = subject.replace(f"{{{{{var_name}}}}}", str(var_val))
            html_body = html_body.replace(f"{{{{{var_name}}}}}", str(var_val))
            text_body = text_body.replace(f"{{{{{var_name}}}}}", str(var_val))

        # Send via email service
        email_service._send_email(
            to_email=recipient_email,
            subject=f"[TEST PREVIEW] {subject}",
            html_content=html_body,
            text_content=text_body,
        )

        return {
            "status": "dispatched",
            "recipient": recipient_email,
            "subject": subject,
            "timestamp": datetime.utcnow().isoformat(),
        }

    # ========================================================
    # 9. NOTIFICATIONS BROADCAST
    # ========================================================

    @staticmethod
    async def broadcast_notification(
        db: AsyncSession,
        title: str,
        message: str,
        notif_type: str,
        admin_id: uuid.UUID,
        target_user_id: Optional[uuid.UUID] = None,
    ) -> Dict[str, Any]:
        """Broadcast in-app alert to all active users or a targeted user."""
        recipients_count = 0
        if target_user_id:
            user = (await db.execute(select(User).filter(User.id == target_user_id))).scalars().first()
            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user not found.")
            await notification_service.create_notification(
                db,
                user_id=target_user_id,
                type=notif_type,
                title=title,
                message=message,
            )
            recipients_count = 1
        else:
            users_res = await db.execute(select(User.id).filter(User.is_active == True, User.is_suspended == False))
            user_ids = users_res.scalars().all()
            for uid in user_ids:
                n = Notification(
                    user_id=uid,
                    type=notif_type,
                    title=title,
                    message=message,
                    is_read=False,
                )
                db.add(n)
            recipients_count = len(user_ids)

        audit = AuditLog(
            admin_id=admin_id,
            action="notification_broadcast",
            entity_type="notification",
            new_values={"title": title, "recipients_count": recipients_count, "type": notif_type},
        )
        db.add(audit)
        await db.commit()

        return {"status": "broadcast_sent", "recipients_count": recipients_count}

    # ========================================================
    # 10. AUDIT LOGS & SECURITY LOGS
    # ========================================================

    @staticmethod
    async def get_audit_logs(
        db: AsyncSession,
        limit: int = 50,
        offset: int = 0,
        action: Optional[str] = None,
        entity_type: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Fetch immutable platform audit logs with pagination and filters."""
        query = select(AuditLog)
        if action:
            query = query.filter(AuditLog.action.ilike(f"%{action.strip()}%"))
        if entity_type:
            query = query.filter(AuditLog.entity_type == entity_type.strip())

        total = (await db.execute(select(func.count(AuditLog.id)).select_from(query.subquery()))).scalar() or 0
        result = await db.execute(query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit))
        logs = result.scalars().all()

        items = []
        for l in logs:
            items.append({
                "id": str(l.id),
                "user_id": str(l.user_id) if l.user_id else None,
                "admin_id": str(l.admin_id) if l.admin_id else None,
                "action": l.action,
                "entity_type": l.entity_type,
                "entity_id": str(l.entity_id) if l.entity_id else None,
                "old_values": l.old_values,
                "new_values": l.new_values,
                "ip_address": l.ip_address,
                "user_agent": l.user_agent,
                "created_at": l.created_at.isoformat() if l.created_at else None,
            })

        return {"total": total, "items": items, "limit": limit, "offset": offset}

    # ========================================================
    # 11. DEPOSIT & WITHDRAWAL LEGACY WRAPPERS
    # ========================================================

    @staticmethod
    async def verify_user_deposit(
        db: AsyncSession,
        deposit_id: uuid.UUID,
        status_val: str,
        admin_id: uuid.UUID,
        rejection_reason: Optional[str] = None,
    ) -> DepositRequest:
        """Approve or reject a user manual deposit request, crediting their wallet balances on approval."""
        status_clean = status_val.lower().strip()
        if status_clean not in ["verified", "rejected"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status selection. Must be 'verified' or 'rejected'.",
            )

        result = await db.execute(select(DepositRequest).filter(DepositRequest.id == deposit_id))
        deposit = result.scalars().first()
        if deposit is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deposit request not found.")

        if deposit.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Deposit request is already processed and marked as '{deposit.status}'.",
            )

        deposit.verified_by = admin_id
        deposit.verified_at = datetime.utcnow()
        deposit.status = status_clean

        if status_clean == "verified":
            wallet_result = await db.execute(
                select(Wallet).filter(Wallet.user_id == deposit.user_id, Wallet.currency == deposit.currency)
            )
            wallet = wallet_result.scalars().first()
            if wallet is None:
                wallet = Wallet(
                    user_id=deposit.user_id,
                    currency=deposit.currency,
                    balance=Decimal("0.0"),
                    frozen_balance=Decimal("0.0"),
                )
                db.add(wallet)

            wallet.balance += deposit.amount
            wallet.total_deposited += deposit.amount
            db.add(wallet)

            tx_ref = deposit.transaction_hash or f"DEP-{deposit.id.hex[:12].upper()}"
            await transaction_service.create_transaction(
                db,
                user_id=deposit.user_id,
                type="deposit",
                amount=deposit.amount,
                currency=deposit.currency,
                status="completed",
                reference=tx_ref,
                description="Manual Cryptocurrency Deposit Credited",
            )

            await notification_service.create_notification(
                db,
                user_id=deposit.user_id,
                type="deposit",
                title="Deposit Verified",
                message=f"Your deposit of {deposit.amount} {deposit.currency} has been verified and credited.",
            )

        elif status_clean == "rejected":
            deposit.rejection_reason = rejection_reason.strip() if rejection_reason else "Invalid proof details."
            await notification_service.create_notification(
                db,
                user_id=deposit.user_id,
                type="deposit",
                title="Deposit Rejected",
                message=f"Your deposit request of {deposit.amount} {deposit.currency} was rejected. Reason: {deposit.rejection_reason}",
            )

        db.add(deposit)
        await db.commit()
        await db.refresh(deposit)
        return deposit

    @staticmethod
    async def process_user_withdrawal(
        db: AsyncSession,
        withdrawal_id: uuid.UUID,
        status_val: str,
        admin_id: uuid.UUID,
        rejection_reason: Optional[str] = None,
        transaction_hash: Optional[str] = None,
    ) -> WithdrawalRequest:
        """Process a withdrawal request into processing, completed, or rejected."""
        status_clean = status_val.lower().strip()
        if status_clean not in ["processing", "completed", "rejected"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status selection. Must be 'processing', 'completed', or 'rejected'.",
            )

        result = await db.execute(select(WithdrawalRequest).filter(WithdrawalRequest.id == withdrawal_id))
        withdrawal = result.scalars().first()
        if withdrawal is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Withdrawal request not found.")

        if withdrawal.status in ["completed", "rejected", "reinvested"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Withdrawal request is already finalized as '{withdrawal.status}'.",
            )

        wallet_result = await db.execute(
            select(Wallet).filter(Wallet.user_id == withdrawal.user_id, Wallet.currency == withdrawal.currency)
        )
        wallet = wallet_result.scalars().first()
        if wallet is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User wallet was not found.")

        withdrawal.processed_by = admin_id
        withdrawal.processed_at = datetime.utcnow()
        withdrawal.status = status_clean

        if status_clean == "processing":
            await notification_service.create_notification(
                db,
                user_id=withdrawal.user_id,
                type="withdrawal",
                title="Withdrawal Processing",
                message=f"Your withdrawal of {withdrawal.amount} {withdrawal.currency} has been approved and is now being dispatched.",
            )

        elif status_clean == "completed":
            if not transaction_hash:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Blockchain transaction hash (TXID) is required to complete withdrawals.",
                )
            
            withdrawal.transaction_hash = transaction_hash.strip()
            wallet.frozen_balance -= withdrawal.amount
            wallet.total_withdrawn += withdrawal.amount
            db.add(wallet)

            await transaction_service.create_transaction(
                db,
                user_id=withdrawal.user_id,
                type="withdrawal",
                amount=withdrawal.amount,
                currency=withdrawal.currency,
                status="completed",
                reference=withdrawal.transaction_hash,
                description="Manual Cryptocurrency Withdrawal Executed",
            )

            await notification_service.create_notification(
                db,
                user_id=withdrawal.user_id,
                type="withdrawal",
                title="Withdrawal Completed",
                message=f"Your withdrawal of {withdrawal.amount} {withdrawal.currency} has been processed. TXID: {withdrawal.transaction_hash}",
            )

        elif status_clean == "rejected":
            reason = rejection_reason.strip() if rejection_reason else "Cancelled by Administrator."
            withdrawal.rejection_reason = reason

            wallet.frozen_balance -= withdrawal.amount
            wallet.balance += withdrawal.amount
            db.add(wallet)

            ref_tx = f"WDR-REJ-{withdrawal.id.hex[:12].upper()}"
            await transaction_service.create_transaction(
                db,
                user_id=withdrawal.user_id,
                type="withdrawal",
                amount=withdrawal.amount,
                currency=withdrawal.currency,
                status="failed",
                reference=ref_tx,
                description=f"Withdrawal Rejected. Refunded balance. Reason: {reason}",
            )

            await notification_service.create_notification(
                db,
                user_id=withdrawal.user_id,
                type="withdrawal",
                title="Withdrawal Rejected",
                message=f"Your withdrawal request of {withdrawal.amount} {withdrawal.currency} was rejected. Reason: {reason}",
            )

        db.add(withdrawal)
        await db.commit()
        await db.refresh(withdrawal)
        return withdrawal

    # ========================================================
    # 12. KYC, SUSPENSION, BALANCE ADJUSTMENT
    # ========================================================

    @staticmethod
    async def update_user_kyc(
        db: AsyncSession,
        user_id: uuid.UUID,
        kyc_status: str,
        admin_id: uuid.UUID,
        rejection_reason: Optional[str] = None,
    ) -> User:
        """Approve or reject a user's KYC verification."""
        status_clean = kyc_status.lower().strip()
        if status_clean not in ["verified", "rejected"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status selection. Must be 'verified' or 'rejected'.",
            )

        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        user.kyc_status = status_clean
        if status_clean == "verified":
            user.kyc_verified_at = datetime.utcnow()
            await notification_service.create_notification(
                db,
                user_id=user.id,
                type="system",
                title="KYC Approved",
                message="Congratulations! Your identity verification (KYC) request has been approved.",
            )
        elif status_clean == "rejected":
            user.kyc_verified_at = None
            reason = rejection_reason.strip() if rejection_reason else "Documentation unreadable or expired."
            await notification_service.create_notification(
                db,
                user_id=user.id,
                type="system",
                title="KYC Rejected",
                message=f"Your identity verification (KYC) request was rejected. Reason: {reason}",
            )

        db.add(user)
        audit = AuditLog(
            user_id=user.id,
            admin_id=admin_id,
            action="kyc_status_updated",
            entity_type="user",
            entity_id=user.id,
            new_values={"kyc_status": status_clean, "rejection_reason": rejection_reason},
        )
        db.add(audit)

        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def suspend_user(
        db: AsyncSession,
        user_id: uuid.UUID,
        is_suspended: bool,
        admin_id: uuid.UUID,
        suspension_reason: Optional[str] = None,
    ) -> User:
        """Suspend or activate a user account, terminating all active logins immediately upon suspension."""
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        user.is_suspended = is_suspended
        if is_suspended:
            user.suspension_reason = suspension_reason.strip() if suspension_reason else "Violations of platform terms."
            user.suspended_at = datetime.utcnow()
            
            # Revoke all active sessions
            sessions_result = await db.execute(
                select(SessionToken).filter(SessionToken.user_id == user.id, SessionToken.revoked == False)
            )
            for s in sessions_result.scalars().all():
                s.revoked = True
                s.revoked_at = datetime.utcnow()
                db.add(s)
        else:
            user.suspension_reason = None
            user.suspended_at = None

        db.add(user)
        audit = AuditLog(
            user_id=user.id,
            admin_id=admin_id,
            action="user_suspension_toggled",
            entity_type="user",
            entity_id=user.id,
            new_values={"is_suspended": is_suspended, "suspension_reason": user.suspension_reason},
        )
        db.add(audit)

        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def manual_adjust_balance(
        db: AsyncSession,
        user_id: uuid.UUID,
        currency: str,
        amount: Decimal,
        adjustment_type: str,
        admin_id: uuid.UUID,
        description: Optional[str] = None,
    ) -> Wallet:
        """Manually credit or debit a user's wallet balance, logging details to transaction histories."""
        currency = currency.upper().strip()
        adj_type = adjustment_type.lower().strip()
        
        if adj_type not in ["credit", "debit"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Adjustment type must be 'credit' (add funds) or 'debit' (remove funds).",
            )

        wallet_result = await db.execute(
            select(Wallet).filter(Wallet.user_id == user_id, Wallet.currency == currency)
        )
        wallet = wallet_result.scalars().first()
        if wallet is None:
            wallet = Wallet(user_id=user_id, currency=currency, balance=Decimal("0.0"), frozen_balance=Decimal("0.0"))
            db.add(wallet)

        old_balance = wallet.balance

        if adj_type == "credit":
            wallet.balance += amount
            desc = description or "Administrative balance credit."
            
            await transaction_service.create_transaction(
                db,
                user_id=user_id,
                type="adjustment",
                amount=amount,
                currency=currency,
                status="completed",
                description=desc,
            )
            
            await notification_service.create_notification(
                db,
                user_id=user_id,
                type="system",
                title="Balance Adjustment",
                message=f"Your wallet has been credited with {amount} {currency} by system admin.",
            )

        elif adj_type == "debit":
            if wallet.balance < amount:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Inadequate funds for debit. Current balance is {wallet.balance} {currency}.",
                )
            wallet.balance -= amount
            desc = description or "Administrative balance debit."

            await transaction_service.create_transaction(
                db,
                user_id=user_id,
                type="adjustment",
                amount=-amount,
                currency=currency,
                status="completed",
                description=desc,
            )

            await notification_service.create_notification(
                db,
                user_id=user_id,
                type="system",
                title="Balance Adjustment",
                message=f"Your wallet has been debited by {amount} {currency} by system admin.",
            )

        db.add(wallet)

        audit = AuditLog(
            user_id=user_id,
            admin_id=admin_id,
            action="manual_balance_adjustment",
            entity_type="wallet",
            entity_id=wallet.id,
            old_values={"balance": float(old_balance)},
            new_values={"balance": float(wallet.balance), "type": adj_type, "amount": float(amount)},
        )
        db.add(audit)

        await db.commit()
        await db.refresh(wallet)
        return wallet


admin_service = AdminService()
