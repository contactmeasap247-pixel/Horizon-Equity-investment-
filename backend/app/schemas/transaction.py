# ============================================
# HORIZON EQUITY - TRANSACTION SCHEMAS
# ============================================

from pydantic import BaseModel, ConfigDict, Field, field_serializer
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class TransactionResponse(BaseModel):
    """Schema representing financial records / log details."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID
    user_id: UUID
    type: str
    subtype: Optional[str] = None
    amount: Decimal
    fee: Optional[Decimal] = Decimal("0.0")
    currency: str
    status: str
    reference: Optional[str] = None
    description: Optional[str] = None
    metadata_: Optional[Dict[str, Any]] = Field(None, validation_alias="metadata_", serialization_alias="metadata")
    approved_by: Optional[UUID] = None
    approved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_serializer("amount", "fee")
    def serialize_tx_decimals(self, v: Optional[Decimal]) -> float:
        return float(v) if v is not None else 0.0


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
