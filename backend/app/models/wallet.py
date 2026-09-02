# ============================================
# HORIZON EQUITY - WALLET MODEL
# User balance per cryptocurrency
# ============================================

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DECIMAL, TIMESTAMP, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.core.database import Base


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    currency = Column(String(10), nullable=False, index=True)  # BTC, ETH, USDT, SOL
    balance = Column(DECIMAL(20, 8), default=0)
    frozen_balance = Column(DECIMAL(20, 8), default=0)
    total_deposited = Column(DECIMAL(20, 8), default=0)
    total_withdrawn = Column(DECIMAL(20, 8), default=0)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="wallets")

    # Unique constraint: one wallet per user per currency
    __table_args__ = (
        {"extend_existing": True},
    )

    def __repr__(self):
        return f"<Wallet {self.currency} balance={self.balance}>"
