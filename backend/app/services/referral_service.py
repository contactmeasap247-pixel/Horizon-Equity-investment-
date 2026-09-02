# ============================================
# HORIZON EQUITY - REFERRAL SERVICE
# ============================================

import uuid
from typing import List, Optional, Dict, Any
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.models.user import User
from app.models.referral_commission import ReferralCommission


class ReferralService:
    """Business logic for querying referral structures and commission logs."""

    @staticmethod
    async def get_user_referrals(db: AsyncSession, user_id: uuid.UUID) -> List[User]:
        """Fetch all users who registered using this user's referral code."""
        result = await db.execute(select(User).filter(User.referred_by == user_id).order_by(User.created_at.desc()))
        return list(result.scalars().all())

    @staticmethod
    async def get_referral_commissions(
        db: AsyncSession, user_id: uuid.UUID, status_filter: Optional[str] = None
    ) -> List[ReferralCommission]:
        """Fetch all referral commissions earned by this user."""
        query = select(ReferralCommission).filter(ReferralCommission.referrer_id == user_id)
        if status_filter:
            query = query.filter(ReferralCommission.status == status_filter.lower())
        result = await db.execute(query.order_by(ReferralCommission.created_at.desc()))
        return list(result.scalars().all())

    async def get_referral_stats(self, db: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        """Generate referral statistics (referrals count, total earnings, pending, paid, etc.) for a user."""
        user_result = await db.execute(select(User).filter(User.id == user_id))
        user = user_result.scalars().first()

        if user is None:
            return {
                "referral_code": "",
                "referral_count": 0,
                "referral_earnings": 0.0,
                "pending_commissions": {},
                "paid_commissions": {},
            }

        # Calculate pending and paid commissions grouped by currency
        commissions_result = await db.execute(
            select(
                ReferralCommission.status,
                ReferralCommission.currency,
                func.sum(ReferralCommission.commission_amount),
            )
            .filter(ReferralCommission.referrer_id == user_id)
            .group_by(ReferralCommission.status, ReferralCommission.currency)
        )
        
        pending_commissions = {}
        paid_commissions = {}

        for status, currency, total in commissions_result.all():
            currency = currency.upper()
            total_decimal = Decimal(str(total)) if total else Decimal("0.0")
            if status == "pending":
                pending_commissions[currency] = float(total_decimal)
            elif status == "paid":
                paid_commissions[currency] = float(total_decimal)

        return {
            "referral_code": user.referral_code,
            "referral_count": user.referral_count,
            "referral_earnings": float(user.referral_earnings),
            "pending_commissions": pending_commissions,
            "paid_commissions": paid_commissions,
        }


referral_service = ReferralService()
