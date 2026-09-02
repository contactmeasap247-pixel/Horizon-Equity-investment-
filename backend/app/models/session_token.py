# ============================================
# HORIZON EQUITY - SESSION TOKEN MODEL
# ============================================

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, TIMESTAMP, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.core.database import Base


class SessionToken(Base):
    __tablename__ = "session_tokens"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token = Column(String(500), nullable=False)
    expires_at = Column(TIMESTAMP, nullable=False, index=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    revoked = Column(Boolean, default=False)
    revoked_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    user = relationship("User", back_populates="session_tokens")

    def __repr__(self):
        return f"<SessionToken user={self.user_id} revoked={self.revoked}>"
