# ============================================
# HORIZON EQUITY - ADMIN WALLET MODEL
# System wallet addresses for receiving deposits
# ============================================

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, TIMESTAMP, ForeignKey, UniqueConstraint, Uuid
from app.core.database import Base


class AdminWallet(Base):
    __tablename__ = "admin_wallets"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    currency = Column(String(10), nullable=False)  # BTC, ETH, USDT, SOL
    wallet_address = Column(String(255), nullable=False)
    label = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    is_primary = Column(Boolean, default=False)
    created_by = Column(Uuid, ForeignKey("users.id"), nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("currency", "wallet_address", name="uq_admin_wallet_currency_address"),
    )

    def __repr__(self):
        return f"<AdminWallet {self.currency} {self.wallet_address[:12]}...>"
