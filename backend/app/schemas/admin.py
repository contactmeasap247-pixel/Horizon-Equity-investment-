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
    status: str = Field(..., description="Withdrawal status: processing, completed, or rejected")
    rejection_reason: Optional[str] = Field(None, description="Reason for rejection if status is 'rejected'")
    transaction_hash: Optional[str] = Field(None, description="Blockchain transaction hash (TXID) if status is 'completed'")


class WithdrawalReinvestRequest(BaseModel):
    """Schema for reinvesting a withdrawal amount directly into an investment plan."""
    plan_id: UUID = Field(..., description="Target investment plan ID for reinvestment")


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
    """Legacy schema for administrative dashboard statistics."""
    total_users: int
    active_users: int
    suspended_users: int
    kyc_pending: int
    wallet_balances: Dict[str, float]
    total_deposits_count: int
    total_withdrawals_count: int
    pending_withdrawals_count: int
    pending_deposits_count: int
    active_investments_count: int
    total_invested_amount: Dict[str, float]
    total_referral_commissions: Dict[str, float]


class AdminOverviewMetrics(BaseModel):
    """Comprehensive real-time overview metrics for the executive dashboard."""
    total_users: int
    active_users: int
    suspended_users: int
    kyc_pending: int
    total_deposits_count: int
    total_deposits_amount: Dict[str, float]
    total_withdrawals_count: int
    total_withdrawals_amount: Dict[str, float]
    completed_withdrawals_count: int
    pending_deposits_count: int
    pending_withdrawals_count: int
    active_investments_count: int
    active_investments_amount: Dict[str, float]
    total_transactions_count: int
    total_referral_commissions: Dict[str, float]
    wallet_balances: Dict[str, float]
    activity_chart: List[Dict[str, Any]]
    refreshed_at: datetime


class UserDetailResponse(BaseModel):
    """Complete user profile drilldown data."""
    id: UUID
    email: str
    full_name: str
    phone: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    btc_wallet: Optional[str] = None
    usdt_wallet: Optional[str] = None
    eth_wallet: Optional[str] = None
    sol_wallet: Optional[str] = None
    email_verified: bool
    is_active: bool
    is_admin: bool
    is_suspended: bool
    suspension_reason: Optional[str] = None
    kyc_status: str
    kyc_documents: Optional[Any] = None
    created_at: datetime
    last_login: Optional[datetime] = None
    login_ip: Optional[str] = None
    referral_code: str
    referral_count: int
    referral_earnings: float
    wallets: List[Dict[str, Any]]
    active_investments: List[Dict[str, Any]]
    deposit_history: List[Dict[str, Any]]
    withdrawal_history: List[Dict[str, Any]]
    transactions: List[Dict[str, Any]]
    audit_events: List[Dict[str, Any]]


class UserUpdateRequest(BaseModel):
    """Administrative user profile update payload."""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    btc_wallet: Optional[str] = None
    usdt_wallet: Optional[str] = None
    eth_wallet: Optional[str] = None
    sol_wallet: Optional[str] = None


class ActiveInvestmentItem(BaseModel):
    """Active investment record with time remaining and plan configuration."""
    id: UUID
    user_id: UUID
    user_name: str
    user_email: str
    plan_id: UUID
    plan_name: str
    amount: float
    currency: str
    expected_return: float
    return_percentage: float
    duration_days: int
    start_date: datetime
    maturity_date: datetime
    remaining_seconds: int
    status: str
    is_approaching_maturity: bool


class ProcessMaturedResult(BaseModel):
    """Result of processing matured investments."""
    processed_count: int
    total_credited: Dict[str, float]


class PlatformSettingItem(BaseModel):
    """Platform configuration key-value item."""
    id: Optional[UUID] = None
    key: str
    value: Any
    type: Optional[str] = "json"
    group_name: Optional[str] = "general"
    description: Optional[str] = None
    updated_at: Optional[datetime] = None


class PlatformSettingUpdateRequest(BaseModel):
    """Update payload for a platform setting."""
    value: Any


class EmailTemplateItem(BaseModel):
    """Company-grade email template definition."""
    key: str
    name: str
    category: str
    subject: str
    html_content: str
    text_content: str
    variables: List[str]
    is_active: bool
    updated_at: Optional[datetime] = None


class EmailTemplateUpdateRequest(BaseModel):
    """Update payload for an email template."""
    subject: str
    html_content: str
    text_content: Optional[str] = None
    is_active: Optional[bool] = True


class EmailTestSendRequest(BaseModel):
    """Request to send a test preview email."""
    recipient_email: EmailStr
    variables: Optional[Dict[str, str]] = None


class BroadcastNotificationRequest(BaseModel):
    """Payload for administrative broadcast in-app notifications."""
    title: str = Field(..., min_length=2, max_length=150)
    message: str = Field(..., min_length=2, max_length=1000)
    type: Optional[str] = Field("system", description="Notification type: system, alert, announcement")
    target_user_id: Optional[UUID] = Field(None, description="Optional specific user; omit for platform broadcast")


class AuditLogItem(BaseModel):
    """Detailed audit log entry for administrative traceability."""
    id: UUID
    user_id: Optional[UUID] = None
    user_email: Optional[str] = None
    admin_id: Optional[UUID] = None
    admin_email: Optional[str] = None
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[UUID] = None
    old_values: Optional[Any] = None
    new_values: Optional[Any] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime


class LoginAuditItem(BaseModel):
    """Security login audit record."""
    id: UUID
    user_id: Optional[UUID] = None
    email: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    status: str
    created_at: datetime


class SecurityControlsData(BaseModel):
    """Administrative security and operational controls."""
    maintenance_mode: bool
    maintenance_message: str
    two_factor_enforced: bool
    max_login_attempts: int
    lockout_duration_minutes: int
    auto_withdrawal_enabled: bool
    auto_withdrawal_max_threshold: float
    auto_withdrawal_allowed_currencies: List[str]
    auto_withdrawal_requires_kyc: bool


class SecurityControlsUpdateRequest(BaseModel):
    """Payload to update platform security controls."""
    maintenance_mode: Optional[bool] = None
    maintenance_message: Optional[str] = None
    two_factor_enforced: Optional[bool] = None
    max_login_attempts: Optional[int] = None
    lockout_duration_minutes: Optional[int] = None
    auto_withdrawal_enabled: Optional[bool] = None
    auto_withdrawal_max_threshold: Optional[float] = None
    auto_withdrawal_allowed_currencies: Optional[List[str]] = None
    auto_withdrawal_requires_kyc: Optional[bool] = None


class AdminEmailDispatchPayload(BaseModel):
    """Payload for administrative direct email composer and bulk dispatch."""
    mode: str = Field(..., description="Recipient mode: single, multiple, group, or custom")
    user_ids: Optional[List[UUID]] = Field(None, description="Target user IDs when mode is single or multiple")
    group: Optional[str] = Field(None, description="Target group key: all, active_investors, unverified, pending_kyc, with_deposits, suspended")
    custom_email: Optional[str] = Field(None, description="Custom recipient email address when mode is custom")
    subject: str = Field(..., min_length=2, max_length=250, description="Subject line")
    html_content: str = Field(..., min_length=5, description="HTML formatted email body")
    text_content: Optional[str] = Field(None, description="Plain text fallback alternative")
    template_key: Optional[str] = Field(None, description="Optional template key reference")
