# ============================================
# HORIZON EQUITY - REFERRAL API ENDPOINTS
# ============================================

from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.referral import (
    ReferralCommissionResponse,
    ReferralStatsResponse,
    ReferredUserItemResponse,
    ReferralValidationResponse,
)
from app.services.referral_service import referral_service
from app.models.user import User

router = APIRouter()


@router.get("/validate/{code}", response_model=ReferralValidationResponse)
async def validate_referral_code(
    code: str = Path(..., description="Referral code to validate"),
    db: AsyncSession = Depends(get_db)
):
    """Validate a referral invitation code before user registration."""
    return await referral_service.validate_referral_code(db, code)


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


@router.get("/users", response_model=List[ReferredUserItemResponse])
async def get_referred_users(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve the list of users who registered using this user's referral code, including deposit/investment telemetry."""
    return await referral_service.get_user_referrals(db, current_user.id)
