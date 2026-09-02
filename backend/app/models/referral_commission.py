# ============================================
# HORIZON EQUITY - REFERRAL COMMISSION MODEL
# ============================================

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DECIMAL, TIMESTAMP, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.core.database import Base


class ReferralCommission(Base):
    __tablename__ = "referral_commissions"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    referrer_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    referred_user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    investment_id = Column(Uuid, ForeignKey("investments.id", ondelete="CASCADE"), nullable=False)
    commission_amount = Column(DECIMAL(20, 8), nullable=False)
    currency = Column(String(10), nullable=False)
    level = Column(Integer, default=1)
    status = Column(String(20), default="pending", index=True)  # pending, paid, cancelled
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    paid_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    investment = relationship("Investment", back_populates="referral_commissions")

    def __repr__(self):
        return f"<ReferralCommission {self.commission_amount} {self.currency} status={self.status}>"
