# ============================================
# HORIZON EQUITY - USER MODEL
# ============================================

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, Text, Integer,
    DECIMAL, TIMESTAMP, ForeignKey, Uuid, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    country = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)

    # Crypto Wallet Addresses (user's personal wallets)
    btc_wallet = Column(String(100), nullable=True)
    usdt_wallet = Column(String(100), nullable=True)
    eth_wallet = Column(String(100), nullable=True)
    sol_wallet = Column(String(100), nullable=True)

    # Account Status
    email_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    is_suspended = Column(Boolean, default=False)
    suspension_reason = Column(Text, nullable=True)
    suspended_at = Column(TIMESTAMP, nullable=True)

    # Referral System
    referral_code = Column(String(20), unique=True, nullable=False, index=True)
    referred_by = Column(Uuid, ForeignKey("users.id"), nullable=True)
    referral_earnings = Column(DECIMAL(20, 8), default=0)
    referral_count = Column(Integer, default=0)

    # KYC
    kyc_status = Column(String(20), default="pending")  # pending, submitted, verified, rejected
    kyc_documents = Column(JSON, nullable=True)
    kyc_submitted_at = Column(TIMESTAMP, nullable=True)
    kyc_verified_at = Column(TIMESTAMP, nullable=True)

    # Security
    two_factor_enabled = Column(Boolean, default=False)
    two_factor_secret = Column(String(255), nullable=True)
    last_login = Column(TIMESTAMP, nullable=True)
    login_ip = Column(String(45), nullable=True)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(TIMESTAMP, nullable=True)

    # Metadata
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    wallets = relationship("Wallet", back_populates="user", cascade="all, delete-orphan")
    investments = relationship("Investment", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", foreign_keys="Transaction.user_id", cascade="all, delete-orphan")
    withdrawal_requests = relationship("WithdrawalRequest", back_populates="user", foreign_keys="WithdrawalRequest.user_id", cascade="all, delete-orphan")
    deposit_requests = relationship("DepositRequest", back_populates="user", foreign_keys="DepositRequest.user_id", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    support_tickets = relationship("SupportTicket", back_populates="user", foreign_keys="SupportTicket.user_id", cascade="all, delete-orphan")
    referrer = relationship("User", remote_side="User.id", foreign_keys=[referred_by])
    session_tokens = relationship("SessionToken", back_populates="user", cascade="all, delete-orphan")
    saved_wallets = relationship("UserSavedWallet", back_populates="user", cascade="all, delete-orphan")
    registration_bonus = relationship("RegistrationBonus", back_populates="user", uselist=False, cascade="all, delete-orphan")
    loan_applications = relationship("LoanApplication", back_populates="user", foreign_keys="LoanApplication.user_id", cascade="all, delete-orphan")
    auth_tokens = relationship("AuthToken", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.email}>"
