# ============================================
# HORIZON EQUITY - REFERRAL SCHEMAS
# ============================================

from pydantic import BaseModel, Field, field_serializer
from typing import Optional, Dict
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class ReferralValidationResponse(BaseModel):
    """Schema for validating referral codes during pre-registration."""
    valid: bool
    referral_code: Optional[str] = None
    referrer_name: Optional[str] = None
    message: Optional[str] = None


class ReferredUserItemResponse(BaseModel):
    """Detailed telemetry for an attributed referral partner."""
    id: UUID
    full_name: str
    email: str
    created_at: datetime
    kyc_status: Optional[str] = "not_started"
    has_deposited: bool = False
    total_deposited: float = 0.0
    deposit_status: str = "none"  # verified, pending, none
    has_invested: bool = False
    active_investments_count: int = 0
    investment_status: str = "none"  # active, completed, none
    qualifying_activity: str = "Registered"
    total_commission_earned: float = 0.0
    commission_status: str = "none"  # paid, pending, none

    class Config:
        from_attributes = True


class ReferralCommissionResponse(BaseModel):
    """Schema representing referral commission log details."""
    id: UUID
    referrer_id: UUID
    referred_user_id: UUID
    referred_user_name: Optional[str] = None
    investment_id: Optional[UUID] = None
    deposit_id: Optional[UUID] = None
    plan_name: Optional[str] = None
    source_type: Optional[str] = "investment"
    commission_amount: Decimal
    currency: str
    level: int = 1
    status: str
    created_at: datetime
    paid_at: Optional[datetime] = None

    @field_serializer("commission_amount")
    def serialize_comm_decimal(self, v: Decimal) -> float:
        return float(v) if v is not None else 0.0

    class Config:
        from_attributes = True


class ReferralStatsResponse(BaseModel):
    """Schema representing referral program performance statistics."""
    referral_code: str
    referral_count: int
    active_referrals_count: int = 0
    referral_earnings: Decimal = Decimal("0.0")
    pending_earnings: Decimal = Decimal("0.0")
    pending_commissions: Dict[str, Decimal] = {}
    paid_commissions: Dict[str, Decimal] = {}

    @field_serializer("referral_earnings", "pending_earnings")
    def serialize_earnings(self, v: Decimal) -> float:
        return float(v) if v is not None else 0.0

    @field_serializer("pending_commissions", "paid_commissions")
    def serialize_dict_commissions(self, v: Dict[str, Decimal]) -> Dict[str, float]:
        if not v:
            return {}
        return {k: float(val) if val is not None else 0.0 for k, val in v.items()}

    class Config:
        from_attributes = True
