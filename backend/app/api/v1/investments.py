# ============================================
# HORIZON EQUITY - INVESTMENT API ENDPOINTS
# ============================================

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.investment import (
    InvestmentPlanResponse,
    InvestmentCreate,
    InvestmentResponse,
)
from app.services.investment_service import investment_service
from app.models.user import User

router = APIRouter()


@router.get("/plans", response_model=List[InvestmentPlanResponse])
async def get_active_plans(
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all active investment plans available for purchase."""
    return await investment_service.get_active_investment_plans(db)


@router.get("", response_model=List[InvestmentResponse])
async def get_investments(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve the logged-in user's list of investments, optionally filtered by status."""
    return await investment_service.get_user_investments(db, current_user.id, status)


@router.get("/{investment_id}", response_model=InvestmentResponse)
async def get_investment_details(
    investment_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve details of a specific user investment."""
    investment = await investment_service.get_investment_by_id(db, investment_id)
    if investment is None or investment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment record not found."
        )
    return investment


@router.post("", response_model=InvestmentResponse, status_code=status.HTTP_201_CREATED)
async def create_new_investment(
    body: InvestmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Start/purchase a new investment plan tier."""
    return await investment_service.create_investment(db, current_user.id, body)
