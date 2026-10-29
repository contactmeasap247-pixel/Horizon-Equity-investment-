# ============================================
# HORIZON EQUITY - AUTH TOKEN MODEL
# Tracks single-use email verification & password reset tokens
# ============================================

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, TIMESTAMP, ForeignKey, Uuid, Index
from sqlalchemy.orm import relationship
from app.core.database import Base


class AuthToken(Base):
    __tablename__ = "auth_tokens"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(64), nullable=False, unique=True, index=True)  # SHA-256 hash of token
    token_type = Column(String(30), nullable=False, index=True)  # verify_email, password_reset
    expires_at = Column(TIMESTAMP, nullable=False, index=True)
    is_used = Column(Boolean, default=False, nullable=False, index=True)
    used_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow, index=True)

    # Relationship
    user = relationship("User", back_populates="auth_tokens")

    def __repr__(self):
        return f"<AuthToken user={self.user_id} type={self.token_type} used={self.is_used}>"
