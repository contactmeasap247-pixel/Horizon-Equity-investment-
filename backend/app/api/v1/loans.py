# ============================================
# HORIZON EQUITY - LOANS API ENDPOINTS
# ============================================

import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User

from app.services.loan_service import loan_service
from app.schemas.loan import (
    LoanProductResponse,
    LoanEligibilityResponse,
    LoanApplicationCreate,
    LoanApplicationResponse,
    LoanRepaymentCreate,
)

router = APIRouter()


@router.get("/products", response_model=List[LoanProductResponse])
async def get_loan_products(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve available platform loan products."""
    products = await loan_service.get_or_seed_products(db)
    return products


@router.get("/eligibility", response_model=LoanEligibilityResponse)
async def check_loan_eligibility(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Check if authenticated user qualifies for an investment-backed loan."""
    eligibility = await loan_service.check_user_eligibility(db, current_user.id)
    return eligibility


@router.post("/apply", response_model=LoanApplicationResponse, status_code=status.HTTP_201_CREATED)
async def apply_for_loan(
    payload: LoanApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a loan application with explicit terms acceptance."""
    application = await loan_service.apply_for_loan(
        db=db,
        user_id=current_user.id,
        product_id=payload.product_id,
        amount=payload.amount,
        duration_months=payload.duration_months,
        terms_accepted=payload.terms_accepted,
    )
    return application


@router.get("/my-loans", response_model=List[Dict[str, Any]])
async def get_my_loans(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get authenticated user's loan applications and active loans."""
    loans = await loan_service.get_user_loans(db, current_user.id)
    return loans


@router.post("/{loan_id}/repay")
async def repay_loan(
    loan_id: uuid.UUID,
    payload: LoanRepaymentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a loan repayment from USDT balance."""
    result = await loan_service.repay_loan(
        db=db,
        user_id=current_user.id,
        loan_id=loan_id,
        amount=payload.amount,
    )
    return result
