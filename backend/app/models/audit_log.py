# ============================================
# HORIZON EQUITY - AUDIT LOG MODEL
# ============================================

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, TIMESTAMP, ForeignKey, Uuid, JSON
from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=True, index=True)
    admin_id = Column(Uuid, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(Uuid, nullable=True)
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow, index=True)

    def __repr__(self):
        return f"<AuditLog {self.action} entity={self.entity_type}>"
