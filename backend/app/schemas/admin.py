# ============================================
# HORIZON EQUITY - ADMIN OPERATION SCHEMAS
# ============================================

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class KycVerificationRequest(BaseModel):
    """Schema for approving or rejecting a user's KYC verification."""
    status: str = Field(..., description="KYC status: verified or rejected")
    rejection_reason: Optional[str] = Field(None, description="Reason for rejection, required if status is 'rejected'")


class DepositVerificationRequest(BaseModel):
    """Schema for verifying or rejecting a user's deposit request."""
    status: str = Field(..., description="Deposit status: verified or rejected")
    rejection_reason: Optional[str] = Field(None, description="Reason for rejection if status is 'rejected'")


class WithdrawalProcessingRequest(BaseModel):
    """Schema for processing a withdrawal request."""
    status: str = Field(..., description="Withdrawal status: completed or rejected")
    rejection_reason: Optional[str] = Field(None, description="Reason for rejection if status is 'rejected'")
    transaction_hash: Optional[str] = Field(None, description="Blockchain transaction hash (TXID) if status is 'completed'")


class UserSuspensionRequest(BaseModel):
    """Schema for suspending or activating a user account."""
    is_suspended: bool = Field(..., description="Set to True to suspend the user, False to activate")
    suspension_reason: Optional[str] = Field(None, description="Reason for suspension")


class BalanceAdjustmentRequest(BaseModel):
    """Schema for administrative wallet balance adjustment."""
    currency: str = Field(..., description="Currency ticker (e.g. BTC, ETH, USDT, SOL)")
    amount: Decimal = Field(..., gt=0, description="Amount to adjust, must be greater than zero")
    adjustment_type: str = Field(..., description="Adjustment type: credit or debit")
    description: Optional[str] = Field(None, description="Description or reason for adjustment")


class AdminDashboardStats(BaseModel):
    """Schema for administrative dashboard statistics and reports."""
    total_users: int
    active_users: int
    suspended_users: int
    kyc_pending: int
    
    # Financial metrics (BTC, ETH, USDT, SOL aggregated)
    wallet_balances: Dict[str, Decimal]  # Total of user balances per currency
    total_deposits_count: int
    total_withdrawals_count: int
    pending_withdrawals_count: int
    pending_deposits_count: int
    
    # Active investments count and sum
    active_investments_count: int
    total_invested_amount: Dict[str, Decimal]  # Total invested per currency
    
    # Referral commissions paid
    total_referral_commissions: Dict[str, Decimal]

    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v)
        }
