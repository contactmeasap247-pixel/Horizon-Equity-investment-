# ============================================
# HORIZON EQUITY - TRANSACTION API ENDPOINTS
# ============================================

import uuid
from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.transaction import TransactionResponse
from app.schemas.receipt import ReceiptDetailResponse, ReceiptPublicVerificationResponse
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


@router.get("/receipt/verify/{reference_or_id}", response_model=ReceiptPublicVerificationResponse)
async def verify_transaction_receipt(
    reference_or_id: str = Path(..., description="Transaction reference, receipt identifier, or UUID"),
    db: AsyncSession = Depends(get_db)
):
    """Publicly verify the authenticity of an institutional transaction receipt."""
    return await transaction_service.verify_receipt(db, query_str=reference_or_id)


@router.get("/{transaction_id}/receipt", response_model=ReceiptDetailResponse)
async def get_transaction_receipt(
    transaction_id: uuid.UUID = Path(..., description="UUID of the ledger transaction"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate an institutional-grade, verifiable transaction receipt for an authorized user or admin."""
    return await transaction_service.get_transaction_receipt(
        db,
        transaction_id=transaction_id,
        requesting_user=current_user,
    )
