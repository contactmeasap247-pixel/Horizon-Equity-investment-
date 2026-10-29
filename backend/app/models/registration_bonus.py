# ============================================
# HORIZON EQUITY - REGISTRATION BONUS MODEL
# Tracks promotional credits, lock states & qualifying investments
# ============================================

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DECIMAL, TIMESTAMP, ForeignKey, Uuid, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class RegistrationBonus(Base):
    __tablename__ = "registration_bonuses"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    amount = Column(DECIMAL(10, 2), default=10.00, nullable=False)
    currency = Column(String(10), default="USDT", nullable=False)
    status = Column(String(30), default="locked", index=True)  # locked, unlocked, expired
    qualifying_investment_id = Column(Uuid, ForeignKey("investments.id"), nullable=True)
    awarded_at = Column(TIMESTAMP, default=datetime.utcnow)
    unlocked_at = Column(TIMESTAMP, nullable=True)
    notes = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="registration_bonus")
    qualifying_investment = relationship("Investment")

    def __repr__(self):
        return f"<RegistrationBonus user={self.user_id} status={self.status} amount={self.amount}>"
