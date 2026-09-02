# ============================================
# HORIZON EQUITY - TRANSACTION MODEL
# All financial activity records
# ============================================

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DECIMAL, TIMESTAMP, ForeignKey, Uuid, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(30), nullable=False, index=True)  # deposit, withdrawal, investment, return, referral_bonus, adjustment
    subtype = Column(String(30), nullable=True)
    amount = Column(DECIMAL(20, 8), nullable=False)
    fee = Column(DECIMAL(20, 8), default=0)
    currency = Column(String(10), nullable=False)
    status = Column(String(20), default="pending", index=True)  # pending, processing, completed, failed, cancelled
    reference = Column(String(100), unique=True, nullable=True)
    description = Column(Text, nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)
    approved_by = Column(Uuid, ForeignKey("users.id"), nullable=True)
    approved_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow, index=True)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="transactions", foreign_keys=[user_id])

    def __repr__(self):
        return f"<Transaction {self.type} {self.amount} {self.currency} status={self.status}>"
