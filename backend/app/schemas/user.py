# ============================================
# HORIZON EQUITY - USER SCHEMAS
# ============================================

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID


class UserBase(BaseModel):
    """Base user schema with shared fields."""
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    btc_wallet: Optional[str] = None
    usdt_wallet: Optional[str] = None
    eth_wallet: Optional[str] = None
    sol_wallet: Optional[str] = None


class UserCreate(UserBase):
    """Schema for registering a new user."""
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters long")
    referred_by_code: Optional[str] = None


class UserUpdate(BaseModel):
    """Schema for updating user details."""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    btc_wallet: Optional[str] = None
    usdt_wallet: Optional[str] = None
    eth_wallet: Optional[str] = None
    sol_wallet: Optional[str] = None


class UserResponse(UserBase):
    """Detailed schema representing a user returned in API responses."""
    id: UUID
    is_active: bool
    is_admin: bool
    is_suspended: bool
    referral_code: str
    referred_by: Optional[UUID] = None
    referral_earnings: float
    referral_count: int
    kyc_status: str
    kyc_submitted_at: Optional[datetime] = None
    two_factor_enabled: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            UUID: lambda v: str(v)
        }
