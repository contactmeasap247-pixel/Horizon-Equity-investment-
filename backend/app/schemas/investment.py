# ============================================
# HORIZON EQUITY - INVESTMENT SCHEMAS
# ============================================

from pydantic import BaseModel, Field, field_serializer
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class InvestmentPlanBase(BaseModel):
    """Base schema for investment plans."""
    name: str = Field(..., description="Plan tier name")
    description: Optional[str] = None
    min_amount: Decimal = Field(..., gt=0, description="Minimum investment limit")
    max_amount: Optional[Decimal] = Field(None, description="Maximum investment limit (None means unlimited)")
    return_percentage: Decimal = Field(..., gt=0, description="Return ROI percentage")
    duration_days: int = Field(..., gt=0, description="Duration in days")
    referral_bonus_percentage: Decimal = Field(Decimal("5.00"), description="Referral reward bonus ROI")
    is_active: bool = True
    is_featured: bool = False
    sort_order: int = 0

    @field_serializer("min_amount", "max_amount", "return_percentage", "referral_bonus_percentage")
    def serialize_plan_decimals(self, v: Optional[Decimal]) -> Optional[float]:
        return float(v) if v is not None else None


class InvestmentPlanCreate(InvestmentPlanBase):
    """Schema for creating a new investment plan by admin."""
    pass


class InvestmentPlanUpdate(BaseModel):
    """Schema for updating an investment plan tier."""
    name: Optional[str] = None
    description: Optional[str] = None
    min_amount: Optional[Decimal] = None
    max_amount: Optional[Decimal] = None
    return_percentage: Optional[Decimal] = None
    duration_days: Optional[int] = None
    referral_bonus_percentage: Optional[Decimal] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    sort_order: Optional[int] = None


class InvestmentPlanResponse(InvestmentPlanBase):
    """Detailed schema representing a plan tier."""
    id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InvestmentCreate(BaseModel):
    """Schema for a user starting an investment plan."""
    plan_id: UUID = Field(..., description="ID of the plan tier")
    amount: Decimal = Field(..., gt=0, description="Amount to invest")
    currency: str = Field(..., description="Currency to use: BTC, ETH, USDT, SOL")
    is_auto_renew: bool = False


class InvestmentResponse(BaseModel):
    """Detailed schema representing a user's active/matured investment."""
    id: UUID
    user_id: UUID
    plan_id: UUID
    amount: Decimal
    currency: str
    expected_return: Decimal
    actual_return: Optional[Decimal]
    status: str
    start_date: datetime
    end_date: Optional[datetime]
    maturity_date: datetime
    is_auto_renew: bool
    created_at: datetime
    updated_at: datetime
    plan: Optional[InvestmentPlanResponse] = None

    @field_serializer("amount", "expected_return", "actual_return")
    def serialize_investment_decimals(self, v: Optional[Decimal]) -> Optional[float]:
        return float(v) if v is not None else None

    class Config:
        from_attributes = True
