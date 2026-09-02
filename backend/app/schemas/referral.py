# ============================================
# HORIZON EQUITY - REFERRAL SCHEMAS
# ============================================

from pydantic import BaseModel, Field
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

    class Config:
        from_attributes = True


class ReferralStatsResponse(BaseModel):
    """Schema representing referral program performance statistics."""
    referral_code: str
    referral_count: int
    referral_earnings: Decimal
    pending_commissions: Dict[str, Decimal]
    paid_commissions: Dict[str, Decimal]

    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v)
        }
