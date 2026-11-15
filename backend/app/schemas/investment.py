# ============================================
# HORIZON EQUITY - INVESTMENT SCHEMAS
# ============================================

from pydantic import BaseModel, Field, field_serializer, model_validator
from typing import Optional, Any
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
    duration_days: int = Field(..., ge=1, le=14, description="Duration in days (maximum 14 days)")
    duration_unit: Optional[str] = Field("days", description="Duration unit: 'days' or 'weeks'")
    duration_value: Optional[int] = Field(None, description="Duration value in selected unit")
    referral_bonus_percentage: Decimal = Field(Decimal("5.00"), description="Referral reward bonus ROI")
    is_active: bool = True
    is_featured: bool = False
    sort_order: int = 0

    @model_validator(mode="before")
    @classmethod
    def validate_and_convert_duration(cls, data: Any) -> Any:
        if isinstance(data, dict):
            unit = data.get("duration_unit")
            val = data.get("duration_value")
            if unit and val is not None:
                try:
                    val_int = int(val)
                except (ValueError, TypeError):
                    raise ValueError("Duration value must be a valid integer.")
                if unit.lower() in ("week", "weeks"):
                    data["duration_days"] = val_int * 7
                elif unit.lower() in ("day", "days"):
                    data["duration_days"] = val_int

            days = data.get("duration_days")
            if days is not None:
                try:
                    days_int = int(days)
                except (ValueError, TypeError):
                    raise ValueError("Duration days must be an integer.")
                if days_int > 14:
                    raise ValueError("Plan duration cannot exceed 14 days (2 weeks). Maximum allowed is 14 days.")
                if days_int < 1:
                    raise ValueError("Plan duration must be at least 1 day.")
                data["duration_days"] = days_int
        return data

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
    duration_days: Optional[int] = Field(None, ge=1, le=14, description="Duration in days (max 14 days)")
    duration_unit: Optional[str] = None
    duration_value: Optional[int] = None
    referral_bonus_percentage: Optional[Decimal] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    sort_order: Optional[int] = None

    @model_validator(mode="before")
    @classmethod
    def validate_and_convert_duration_update(cls, data: Any) -> Any:
        if isinstance(data, dict):
            unit = data.get("duration_unit")
            val = data.get("duration_value")
            if unit and val is not None:
                try:
                    val_int = int(val)
                except (ValueError, TypeError):
                    raise ValueError("Duration value must be a valid integer.")
                if unit.lower() in ("week", "weeks"):
                    data["duration_days"] = val_int * 7
                elif unit.lower() in ("day", "days"):
                    data["duration_days"] = val_int

            days = data.get("duration_days")
            if days is not None:
                try:
                    days_int = int(days)
                except (ValueError, TypeError):
                    raise ValueError("Duration days must be an integer.")
                if days_int > 14:
                    raise ValueError("Plan duration cannot exceed 14 days (2 weeks). Maximum allowed is 14 days.")
                if days_int < 1:
                    raise ValueError("Plan duration must be at least 1 day.")
                data["duration_days"] = days_int
        return data


class InvestmentPlanResponse(InvestmentPlanBase):
    """Detailed schema representing a plan tier."""
    id: UUID
    duration_weeks: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @model_validator(mode="after")
    def compute_duration_weeks(self) -> "InvestmentPlanResponse":
        if self.duration_days is not None:
            self.duration_weeks = round(self.duration_days / 7.0, 2)
        return self

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
