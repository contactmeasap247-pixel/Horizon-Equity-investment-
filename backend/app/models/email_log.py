# ============================================
# HORIZON EQUITY - EMAIL LOG MODEL
# Operational audit & Brevo delivery tracking
# ============================================

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, TIMESTAMP, Uuid, JSON
from app.core.database import Base


class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    recipient = Column(String(255), nullable=False, index=True)
    subject = Column(String(255), nullable=False)
    template_key = Column(String(50), nullable=True, index=True)
    status = Column(String(30), default="sent", nullable=False, index=True)  # queued, sent, delivered, bounced, failed
    provider_message_id = Column(String(255), nullable=True, index=True)
    error_message = Column(Text, nullable=True)
    event_data = Column(JSON, nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow, index=True)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<EmailLog recipient={self.recipient} status={self.status} template={self.template_key}>"
