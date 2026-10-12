# ============================================
# HORIZON EQUITY - LOAN SCHEMAS
# ============================================

from pydantic import BaseModel, Field
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
    duration_months: int
    repayment_frequency: str
    description: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class LoanEligibilityResponse(BaseModel):
    is_eligible: bool
    reason: str
    qualifying_investments_count: int
    active_loan: Optional[Dict[str, Any]] = None


class LoanApplicationCreate(BaseModel):
    product_id: UUID
    amount: Decimal = Field(..., gt=0, description="Principal amount to borrow")
    duration_months: int = Field(..., ge=1, le=24, description="Duration in months")
    terms_accepted: bool = Field(..., description="Must explicitly accept loan agreement terms")


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
