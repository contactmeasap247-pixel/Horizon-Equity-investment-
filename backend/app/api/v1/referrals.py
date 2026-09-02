# ============================================
# HORIZON EQUITY - REFERRAL API ENDPOINTS
# ============================================

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.referral import ReferralCommissionResponse, ReferralStatsResponse
from app.schemas.user import UserResponse
from app.services.referral_service import referral_service
from app.models.user import User

router = APIRouter()


@router.get("/stats", response_model=ReferralStatsResponse)
async def get_referral_statistics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve the user's referral code, count of referees, and commission analytics."""
    return await referral_service.get_referral_stats(db, current_user.id)


@router.get("/commissions", response_model=List[ReferralCommissionResponse])
async def get_commissions_history(
    status: Optional[str] = Query(None, description="Filter commissions by status: pending, paid, cancelled"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve the history of referral commissions earned by the user, optionally filtered by status."""
    return await referral_service.get_referral_commissions(db, current_user.id, status)


@router.get("/users", response_model=List[UserResponse])
async def get_referred_users(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve the list of users who registered using this user's referral code."""
    return await referral_service.get_user_referrals(db, current_user.id)
