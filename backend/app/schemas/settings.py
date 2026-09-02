# ============================================
# HORIZON EQUITY - SETTINGS SCHEMAS
# ============================================

from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
from uuid import UUID


class SiteSettingResponse(BaseModel):
    """Schema representing system configuration settings."""
    id: UUID
    key: str
    value: Any
    type: Optional[str] = None
    group_name: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SiteSettingCreate(BaseModel):
    """Schema for creating a new site setting."""
    key: str
    value: Any
    type: Optional[str] = "string"
    group_name: Optional[str] = "general"
    description: Optional[str] = None


class SiteSettingUpdate(BaseModel):
    """Schema for updating a site setting value."""
    value: Any
    description: Optional[str] = None
