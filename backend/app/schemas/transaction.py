# ============================================
# HORIZON EQUITY - TRANSACTION SCHEMAS
# ============================================

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class TransactionResponse(BaseModel):
    """Schema representing financial records / log details."""
    id: UUID
    user_id: UUID
    type: str
    subtype: Optional[str] = None
    amount: Decimal
    fee: Decimal
    currency: str
    status: str
    reference: Optional[str] = None
    description: Optional[str] = None
    metadata_: Optional[Dict[str, Any]] = Field(None, alias="metadata")
    approved_by: Optional[UUID] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True


class TransactionCreate(BaseModel):
    """Schema for creating a manual adjustment transaction (e.g. by admin)."""
    user_id: UUID
    type: str = Field(..., description="Type of transaction: deposit, withdrawal, investment, return, referral_bonus, adjustment")
    subtype: Optional[str] = None
    amount: Decimal
    fee: Decimal = Decimal("0.0")
    currency: str
    status: str = "completed"
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
