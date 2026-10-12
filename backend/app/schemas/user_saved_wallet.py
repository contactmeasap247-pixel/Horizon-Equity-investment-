# ============================================
# HORIZON EQUITY - SAVED WALLET SCHEMAS
# ============================================

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class UserSavedWalletCreate(BaseModel):
    asset: str = Field(..., description="Asset ticker: BTC, ETH, USDT, SOL")
    network: str = Field(..., description="Blockchain network: Bitcoin, Ethereum (ERC-20), Tron (TRC-20), etc.")
    address: str = Field(..., min_length=20, max_length=255, description="Wallet destination address")
    label: str = Field(..., min_length=2, max_length=100, description="Personal label (e.g. My Ledger Cold Storage)")
    is_default: Optional[bool] = False


class UserSavedWalletUpdate(BaseModel):
    label: Optional[str] = Field(None, min_length=2, max_length=100)
    address: Optional[str] = Field(None, min_length=20, max_length=255)
    network: Optional[str] = None
    is_default: Optional[bool] = None


class UserSavedWalletResponse(BaseModel):
    id: UUID
    user_id: UUID
    asset: str
    network: str
    address: str
    label: str
    is_default: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
