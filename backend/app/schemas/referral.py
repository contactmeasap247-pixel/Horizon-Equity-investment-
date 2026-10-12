# ============================================
# HORIZON EQUITY - REFERRAL SCHEMAS
# ============================================

from pydantic import BaseModel, Field, field_serializer
from typing import Optional, Dict
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class ReferralCommissionResponse(BaseModel):
    """Schema representing referral commission log details."""
    id: UUID
    referrer_id: UUID
    referred_user_id: UUID
    investment_id: UUID
    commission_amount: Decimal
    currency: str
    level: int
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
    referral_earnings: Decimal
    pending_commissions: Dict[str, Decimal]
    paid_commissions: Dict[str, Decimal]

    @field_serializer("referral_earnings")
    def serialize_earnings(self, v: Decimal) -> float:
        return float(v) if v is not None else 0.0

    @field_serializer("pending_commissions", "paid_commissions")
    def serialize_dict_commissions(self, v: Dict[str, Decimal]) -> Dict[str, float]:
        if not v:
            return {}
        return {k: float(val) if val is not None else 0.0 for k, val in v.items()}

    class Config:
        from_attributes = True
