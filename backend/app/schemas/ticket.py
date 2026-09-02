# ============================================
# HORIZON EQUITY - SUPPORT TICKET SCHEMAS
# ============================================

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class TicketReplyCreate(BaseModel):
    """Schema for submitting a reply to a support ticket."""
    message: str = Field(..., description="Reply message body")


class TicketReplyResponse(BaseModel):
    """Schema representing a reply to a support ticket."""
    id: UUID
    ticket_id: UUID
    user_id: UUID
    message: str
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SupportTicketCreate(BaseModel):
    """Schema for opening a new support ticket."""
    subject: str = Field(..., min_length=5, description="Subject of the support ticket")
    message: str = Field(..., min_length=10, description="Detailed problem description")
    category: Optional[str] = Field("general", description="Category e.g. billing, investment, wallet")
    priority: Optional[str] = Field("medium", description="Priority level: low, medium, high, urgent")


class SupportTicketResponse(BaseModel):
    """Schema representing basic ticket details."""
    id: UUID
    user_id: UUID
    subject: str
    message: str
    category: Optional[str]
    priority: str
    status: str
    assigned_to: Optional[UUID]
    resolved_at: Optional[datetime]
    closed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SupportTicketDetailResponse(SupportTicketResponse):
    """Detailed schema including the conversational thread replies."""
    replies: List[TicketReplyResponse] = []

    class Config:
        from_attributes = True
