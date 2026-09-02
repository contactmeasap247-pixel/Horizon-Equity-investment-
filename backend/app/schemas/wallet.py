# ============================================
# HORIZON EQUITY - WALLET SCHEMAS
# ============================================

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class WalletResponse(BaseModel):
    """Schema representing user's cryptocurrency wallet balance."""
    id: UUID
    user_id: UUID
    currency: str
    balance: Decimal
    frozen_balance: Decimal
    total_deposited: Decimal
    total_withdrawn: Decimal
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AdminWalletBase(BaseModel):
    """Base schema for admin deposit wallets."""
    currency: str = Field(..., description="Crypto currency: BTC, ETH, USDT, SOL")
    wallet_address: str = Field(..., description="Public wallet address for deposits")
    label: Optional[str] = None
    is_active: bool = True
    is_primary: bool = False


class AdminWalletCreate(AdminWalletBase):
    """Schema for creating a new admin wallet address."""
    pass


class AdminWalletUpdate(BaseModel):
    """Schema for updating an admin wallet address."""
    wallet_address: Optional[str] = None
    label: Optional[str] = None
    is_active: Optional[bool] = None
    is_primary: Optional[bool] = None


class AdminWalletResponse(AdminWalletBase):
    """Detailed schema returned for admin wallets."""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DepositRequestCreate(BaseModel):
    """Schema for submitting a manual deposit proof/request."""
    amount: Decimal = Field(..., gt=0, description="Amount deposited")
    currency: str = Field(..., description="Currency deposited: BTC, ETH, USDT, SOL")
    transaction_hash: str = Field(..., description="Transaction hash or TXID of the payment")
    sender_address: Optional[str] = Field(None, description="Sender's personal wallet address")


class DepositRequestResponse(BaseModel):
    """Detailed schema representing a deposit validation request."""
    id: UUID
    user_id: UUID
    amount: Decimal
    currency: str
    wallet_address: str
    transaction_hash: Optional[str]
    sender_address: Optional[str]
    status: str
    rejection_reason: Optional[str]
    verified_by: Optional[UUID]
    verified_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WithdrawalRequestCreate(BaseModel):
    """Schema for submitting a withdrawal request."""
    amount: Decimal = Field(..., gt=0, description="Amount to withdraw")
    currency: str = Field(..., description="Currency: BTC, ETH, USDT, SOL")
    wallet_address: str = Field(..., description="User's destination wallet address")
    wallet_type: str = Field(..., description="Type of wallet e.g. Native, ERC20, SPL")


class WithdrawalRequestResponse(BaseModel):
    """Detailed schema representing a withdrawal request."""
    id: UUID
    user_id: UUID
    amount: Decimal
    currency: str
    wallet_address: str
    wallet_type: str
    status: str
    rejection_reason: Optional[str]
    processed_by: Optional[UUID]
    transaction_hash: Optional[str]
    processed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
