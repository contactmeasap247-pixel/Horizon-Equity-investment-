# ============================================
# HORIZON EQUITY - INVESTMENT MODEL
# User investments with status tracking
# ============================================

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DECIMAL, TIMESTAMP, ForeignKey, Integer, Uuid
from sqlalchemy.orm import relationship
from app.core.database import Base


class Investment(Base):
    __tablename__ = "investments"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_id = Column(Uuid, ForeignKey("investment_plans.id"), nullable=False)
    amount = Column(DECIMAL(20, 8), nullable=False)
    currency = Column(String(10), nullable=False)
    expected_return = Column(DECIMAL(20, 8), nullable=False)
    actual_return = Column(DECIMAL(20, 8), nullable=True)
    status = Column(String(20), default="active", index=True)  # active, matured, cancelled, failed
    start_date = Column(TIMESTAMP, default=datetime.utcnow)
    end_date = Column(TIMESTAMP, nullable=True)
    maturity_date = Column(TIMESTAMP, nullable=False)
    is_auto_renew = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="investments")
    plan = relationship("InvestmentPlan", back_populates="investments")
    referral_commissions = relationship("ReferralCommission", back_populates="investment")

    def __repr__(self):
        return f"<Investment {self.amount} {self.currency} status={self.status}>"
