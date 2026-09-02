# ============================================
# HORIZON EQUITY - WITHDRAWAL REQUEST MODEL
# ============================================

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DECIMAL, TIMESTAMP, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.core.database import Base


class WithdrawalRequest(Base):
    __tablename__ = "withdrawal_requests"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(DECIMAL(20, 8), nullable=False)
    currency = Column(String(10), nullable=False)
    wallet_address = Column(String(255), nullable=False)
    wallet_type = Column(String(20), nullable=False)
    status = Column(String(20), default="pending", index=True)  # pending, processing, completed, rejected
    rejection_reason = Column(Text, nullable=True)
    processed_by = Column(Uuid, ForeignKey("users.id"), nullable=True)
    transaction_hash = Column(String(255), nullable=True)
    processed_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="withdrawal_requests", foreign_keys=[user_id])

    def __repr__(self):
        return f"<WithdrawalRequest {self.amount} {self.currency} status={self.status}>"
