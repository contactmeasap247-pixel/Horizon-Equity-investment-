# ============================================
# HORIZON EQUITY - LOAN SCHEMAS
# ============================================

from pydantic import BaseModel, Field, model_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class LoanProductResponse(BaseModel):
    id: UUID
    name: str
    currency: str
    min_amount: float
    max_amount: float
    monthly_interest_rate: float
    interest_rate: Optional[float] = None
    duration_months: int
    duration_days: Optional[int] = None
    duration_weeks: Optional[float] = None
    repayment_frequency: str
    description: Optional[str] = None
    is_active: bool

    @model_validator(mode="after")
    def populate_duration_and_rate(self) -> "LoanProductResponse":
        if self.interest_rate is None:
            self.interest_rate = self.monthly_interest_rate
        if self.duration_days is None:
            self.duration_days = self.duration_months if self.duration_months <= 14 else min(14, self.duration_months * 30)
        self.duration_weeks = round(self.duration_days / 7.0, 1)
        return self

    class Config:
        from_attributes = True


class LoanProductCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    currency: str = Field("USDT", max_length=10)
    min_amount: Decimal = Field(..., gt=0)
    max_amount: Decimal = Field(..., gt=0)
    interest_rate: Decimal = Field(..., ge=0, description="Flat interest percentage (e.g. 5.0 for 5%)")
    duration_days: int = Field(..., ge=1, le=14, description="Duration in days (1–14 days, max 2 weeks)")
    repayment_frequency: Optional[str] = "lump_sum"
    description: Optional[str] = None
    is_active: bool = True


class LoanProductUpdate(BaseModel):
    name: Optional[str] = None
    currency: Optional[str] = None
    min_amount: Optional[Decimal] = None
    max_amount: Optional[Decimal] = None
    interest_rate: Optional[Decimal] = None
    duration_days: Optional[int] = Field(None, ge=1, le=14)
    repayment_frequency: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class LoanEligibilityResponse(BaseModel):
    is_eligible: bool
    reason: str
    qualifying_investments_count: int
    active_loan: Optional[Dict[str, Any]] = None


class LoanApplicationCreate(BaseModel):
    product_id: UUID
    amount: Decimal = Field(..., gt=0, description="Principal amount to borrow")
    duration_months: Optional[int] = Field(None, ge=1, le=24, description="Duration in months")
    duration_days: Optional[int] = Field(None, ge=1, le=14, description="Duration in days (max 14 days)")
    duration_unit: Optional[str] = Field(None, description="Duration unit: 'days' or 'weeks'")
    duration_value: Optional[int] = Field(None, description="Duration value in unit")
    terms_accepted: bool = Field(..., description="Must explicitly accept loan agreement terms")

    @model_validator(mode="before")
    @classmethod
    def validate_duration_limits(cls, data: Any) -> Any:
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
                    raise ValueError("Loan duration cannot exceed 14 days (2 weeks). Maximum allowed is 14 days.")
                if days_int < 1:
                    raise ValueError("Loan duration must be at least 1 day.")
                data["duration_days"] = days_int
                # Provide fallback duration_months if not provided
                if not data.get("duration_months"):
                    data["duration_months"] = max(1, round(days_int / 30.0))
        return data


class LoanApplicationResponse(BaseModel):
    id: UUID
    reference: str
    user_id: UUID
    product_id: UUID
    product_name: Optional[str] = None
    principal_amount: float
    currency: str
    monthly_interest_rate: float
    duration_months: int
    total_interest: float
    total_repayment: float
    monthly_installment: float
    outstanding_balance: float
    total_repaid: float
    status: str
    decline_reason: Optional[str] = None
    terms_accepted: bool
    terms_accepted_at: Optional[datetime] = None
    disbursed_at: Optional[datetime] = None
    due_date: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class LoanRepaymentCreate(BaseModel):
    amount: Decimal = Field(..., gt=0, description="Amount to repay in USDT")


class LoanRepaymentResponse(BaseModel):
    id: UUID
    loan_id: UUID
    amount: float
    currency: str
    principal_portion: float
    interest_portion: float
    reference: str
    status: str
    paid_at: datetime

    class Config:
        from_attributes = True


class LoanReviewRequest(BaseModel):
    status: str = Field(..., description="approved, declined, requires_info")
    decline_reason: Optional[str] = Field(None, description="Reason if declined or requires_info")
