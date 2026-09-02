# ============================================
# HORIZON EQUITY - TRANSACTION API ENDPOINTS
# ============================================

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.transaction import TransactionResponse
from app.services.transaction_service import transaction_service
from app.models.user import User

router = APIRouter()


@router.get("", response_model=List[TransactionResponse])
async def get_user_transactions(
    type: Optional[str] = Query(None, description="Filter by type: deposit, withdrawal, investment, return, referral_bonus, adjustment"),
    status: Optional[str] = Query(None, description="Filter by status: pending, processing, completed, failed, cancelled"),
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Page limit for pagination"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve the transaction history of the authenticated user with filtering and pagination."""
    return await transaction_service.get_user_transactions(
        db,
        user_id=current_user.id,
        type_filter=type,
        status_filter=status,
        skip=skip,
        limit=limit,
    )
