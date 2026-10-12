# ============================================
# HORIZON EQUITY - USER SAVED WALLET MODEL
# User's saved personal cryptocurrency withdrawal addresses
# ============================================

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, TIMESTAMP, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserSavedWallet(Base):
    __tablename__ = "user_saved_wallets"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    asset = Column(String(10), nullable=False, index=True)  # BTC, ETH, USDT, SOL
    network = Column(String(50), nullable=False)            # Bitcoin, Ethereum (ERC-20), Tron (TRC-20), BNB Smart Chain (BEP-20), Solana
    address = Column(String(255), nullable=False)
    label = Column(String(100), nullable=False)             # e.g. "Primary Cold Storage", "Binance Custody"
    is_default = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="saved_wallets")

    def __repr__(self):
        return f"<UserSavedWallet {self.asset} ({self.network}): {self.address[:10]}...>"
