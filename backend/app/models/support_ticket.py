# ============================================
# HORIZON EQUITY - SUPPORT TICKET MODELS
# ============================================

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, TIMESTAMP, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.core.database import Base


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), nullable=True)
    priority = Column(String(20), default="medium")  # low, medium, high, urgent
    status = Column(String(20), default="open", index=True)  # open, in_progress, resolved, closed
    assigned_to = Column(Uuid, ForeignKey("users.id"), nullable=True)
    resolved_at = Column(TIMESTAMP, nullable=True)
    closed_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="support_tickets", foreign_keys=[user_id])
    replies = relationship("TicketReply", back_populates="ticket", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<SupportTicket {self.subject} status={self.status}>"


class TicketReply(Base):
    __tablename__ = "ticket_replies"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    ticket_id = Column(Uuid, ForeignKey("support_tickets.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    # Relationships
    ticket = relationship("SupportTicket", back_populates="replies")

    def __repr__(self):
        return f"<TicketReply ticket={self.ticket_id}>"
