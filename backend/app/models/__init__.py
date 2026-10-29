# ============================================
# HORIZON EQUITY - MODELS REGISTRY
# Import all models so SQLAlchemy registers them
# ============================================

from app.models.user import User
from app.models.wallet import Wallet
from app.models.admin_wallet import AdminWallet
from app.models.investment_plan import InvestmentPlan
from app.models.investment import Investment
from app.models.transaction import Transaction
from app.models.withdrawal_request import WithdrawalRequest
from app.models.deposit_request import DepositRequest
from app.models.referral_commission import ReferralCommission
from app.models.notification import Notification
from app.models.support_ticket import SupportTicket, TicketReply
from app.models.audit_log import AuditLog
from app.models.site_setting import SiteSetting
from app.models.session_token import SessionToken
from app.models.user_saved_wallet import UserSavedWallet
from app.models.registration_bonus import RegistrationBonus
from app.models.loan import LoanProduct, LoanApplication, LoanRepayment
from app.models.auth_token import AuthToken
from app.models.email_log import EmailLog

__all__ = [
    "User",
    "Wallet",
    "AdminWallet",
    "InvestmentPlan",
    "Investment",
    "Transaction",
    "WithdrawalRequest",
    "DepositRequest",
    "ReferralCommission",
    "Notification",
    "SupportTicket",
    "TicketReply",
    "AuditLog",
    "SiteSetting",
    "SessionToken",
    "UserSavedWallet",
    "RegistrationBonus",
    "LoanProduct",
    "LoanApplication",
    "LoanRepayment",
    "AuthToken",
    "EmailLog",
]
