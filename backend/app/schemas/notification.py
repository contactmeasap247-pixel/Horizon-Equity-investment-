# ============================================
# HORIZON EQUITY - NOTIFICATION SCHEMAS
# ============================================

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class NotificationResponse(BaseModel):
    """Schema representing user notification details."""
    id: UUID
    user_id: UUID
    type: str
    title: str
    message: str
    is_read: bool
    read_at: Optional[datetime] = None
    metadata_: Optional[Dict[str, Any]] = Field(None, alias="metadata")
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True
