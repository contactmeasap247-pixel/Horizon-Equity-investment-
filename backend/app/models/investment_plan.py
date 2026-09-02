# ============================================
# HORIZON EQUITY - INVESTMENT PLAN MODEL
# Investment tiers with ROI and duration
# ============================================

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Text, Integer, DECIMAL, TIMESTAMP, Uuid
from sqlalchemy.orm import relationship
from app.core.database import Base


class InvestmentPlan(Base):
    __tablename__ = "investment_plans"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    min_amount = Column(DECIMAL(20, 2), nullable=False)
    max_amount = Column(DECIMAL(20, 2), nullable=True)
    return_percentage = Column(DECIMAL(5, 2), nullable=False)
    duration_days = Column(Integer, nullable=False)
    referral_bonus_percentage = Column(DECIMAL(5, 2), default=5.00)
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    investments = relationship("Investment", back_populates="plan")

    def __repr__(self):
        return f"<InvestmentPlan {self.name} {self.return_percentage}%>"
