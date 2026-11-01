# ============================================
# HORIZON EQUITY - TRANSACTION RECEIPT SCHEMAS
# Official institutional audit & clearing receipts
# ============================================

from pydantic import BaseModel, Field, field_serializer
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class ReceiptBreakdownItem(BaseModel):
    label: str
    value: str
    badge: Optional[str] = None


class ReceiptDetailResponse(BaseModel):
    """Enriched, institutional-grade receipt response for authenticated users and admins."""
    receipt_number: str
    transaction_id: UUID
    reference: str
    type: str
    subtype: Optional[str] = None
    status: str
    amount: float
    fee: float
    net_amount: float
    currency: str
    description: Optional[str] = None
    created_at: datetime
    approved_at: Optional[datetime] = None

    # Investor details
    user_id: UUID
    user_name: str
    user_email: str
    user_country: Optional[str] = None

    # Institution credentials
    issuer_name: str = "Horizon Equity Custody & Clearing Ltd"
    issuer_address: str = "One Canada Square, Canary Wharf, London E14 5AA, United Kingdom"
    issuer_license: str = "Institutional Multi-Asset Portfolio Custody & Clearing"
    issuer_jurisdiction: str = "United Kingdom / Global Clearing"

    # Security & Verification
    verification_hash: str
    verification_url: str
    security_seal_text: str = "OFFICIAL SETTLEMENT RECORD - CRYPTOGRAPHICALLY AUDITED"

    # Categorized ledger context
    category_title: str
    category_subtitle: str
    breakdown: List[ReceiptBreakdownItem] = []
    metadata_: Optional[Dict[str, Any]] = Field(None, alias="metadata")

    @field_serializer("amount", "fee", "net_amount")
    def serialize_decimals(self, v: Any) -> float:
        if v is None:
            return 0.0
        return float(v)

    class Config:
        from_attributes = True
        populate_by_name = True


class ReceiptPublicVerificationResponse(BaseModel):
    """Sanitized receipt verification response safe for unauthenticated public audit."""
    is_valid: bool
    receipt_number: Optional[str] = None
    reference: Optional[str] = None
    type: Optional[str] = None
    category_title: Optional[str] = None
    status: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    issued_at: Optional[datetime] = None
    settled_at: Optional[datetime] = None
    masked_investor: Optional[str] = None
    masked_email: Optional[str] = None
    verification_hash: Optional[str] = None
    issuer: str = "Horizon Equity Custody & Clearing Ltd"
    message: str = "Transaction receipt is verified and authentic."

