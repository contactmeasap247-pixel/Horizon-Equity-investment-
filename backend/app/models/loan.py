# ============================================
# HORIZON EQUITY - INVESTMENT-BACKED LOAN MODELS
# Configurable products, applications, schedule & repayments
# ============================================

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, Text, Integer,
    DECIMAL, TIMESTAMP, ForeignKey, Uuid
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class LoanProduct(Base):
    __tablename__ = "loan_products"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    currency = Column(String(10), default="USDT", nullable=False)
    min_amount = Column(DECIMAL(20, 2), nullable=False)
    max_amount = Column(DECIMAL(20, 2), nullable=False)
    monthly_interest_rate = Column(DECIMAL(5, 2), default=2.00, nullable=False)  # Configurable simple interest monthly rate
    duration_months = Column(Integer, default=3, nullable=False)                 # e.g. 1, 3, 6, 12 months
    repayment_frequency = Column(String(20), default="monthly", nullable=False)  # monthly, lump_sum
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    applications = relationship("LoanApplication", back_populates="product")

    def __repr__(self):
        return f"<LoanProduct {self.name} {self.monthly_interest_rate}%/mo {self.duration_months}m>"


class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    reference = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Uuid, ForeignKey("loan_products.id"), nullable=False)
    qualifying_investment_id = Column(Uuid, ForeignKey("investments.id"), nullable=True)

    principal_amount = Column(DECIMAL(20, 2), nullable=False)
    currency = Column(String(10), default="USDT", nullable=False)
    monthly_interest_rate = Column(DECIMAL(5, 2), nullable=False)
    duration_months = Column(Integer, nullable=False)

    total_interest = Column(DECIMAL(20, 2), nullable=False)
    total_repayment = Column(DECIMAL(20, 2), nullable=False)
    monthly_installment = Column(DECIMAL(20, 2), nullable=False)
    outstanding_balance = Column(DECIMAL(20, 2), nullable=False)
    total_repaid = Column(DECIMAL(20, 2), default=0.0)

    # Lifecycle: submitted, under_review, approved, declined, awaiting_disbursement, active, repayment_due, overdue, fully_repaid, cancelled
    status = Column(String(30), default="submitted", index=True)
    decline_reason = Column(Text, nullable=True)

    terms_accepted = Column(Boolean, default=True)
    terms_accepted_at = Column(TIMESTAMP, default=datetime.utcnow)
    reviewed_by = Column(Uuid, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(TIMESTAMP, nullable=True)
    disbursed_at = Column(TIMESTAMP, nullable=True)
    due_date = Column(TIMESTAMP, nullable=True)

    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="loan_applications", foreign_keys=[user_id])
    product = relationship("LoanProduct", back_populates="applications")
    qualifying_investment = relationship("Investment")
    repayments = relationship("LoanRepayment", back_populates="loan", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<LoanApplication {self.reference} amount={self.principal_amount} status={self.status}>"


class LoanRepayment(Base):
    __tablename__ = "loan_repayments"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    loan_id = Column(Uuid, ForeignKey("loan_applications.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(DECIMAL(20, 2), nullable=False)
    currency = Column(String(10), nullable=False)
    principal_portion = Column(DECIMAL(20, 2), default=0.0)
    interest_portion = Column(DECIMAL(20, 2), default=0.0)
    reference = Column(String(50), unique=True, nullable=False)
    status = Column(String(20), default="completed")  # completed, failed
    notes = Column(Text, nullable=True)
    paid_at = Column(TIMESTAMP, default=datetime.utcnow)

    # Relationships
    loan = relationship("LoanApplication", back_populates="repayments")
    user = relationship("User")

    def __repr__(self):
        return f"<LoanRepayment {self.reference} amount={self.amount}>"
