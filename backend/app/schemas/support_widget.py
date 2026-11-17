# ============================================
# HORIZON EQUITY - SUPPORT WIDGET SCHEMAS
# Configuration schemas for Multi-Channel Floating Support Widget
# ============================================

from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal
from datetime import datetime
import re


SUPPORTED_CHANNEL_TYPES = Literal[
    "whatsapp",
    "telegram",
    "messenger",
    "instagram",
    "email",
    "phone",
    "custom",
    "live_chat",
]

POSITION_TYPES = Literal[
    "bottom-right",
    "bottom-left",
    "top-right",
    "top-left",
]

VISIBILITY_SCOPES = Literal[
    "both",
    "primary",
    "secondary",
]


class SupportChannelItem(BaseModel):
    id: str = Field(..., description="Unique identifier for the channel")
    type: str = Field(..., description="Channel platform type (whatsapp, telegram, email, etc.)")
    name: str = Field(..., max_length=100, description="Display name for the channel")
    value: str = Field(..., description="Destination contact value (phone, username, email, or URL)")
    country_code: Optional[str] = Field(None, description="Country calling code for phone/whatsapp (e.g. +44)")
    description: Optional[str] = Field(None, max_length=255, description="Short descriptive text")
    prefilled_message: Optional[str] = Field(None, description="Default greeting or inquiry message")
    icon: Optional[str] = Field(None, description="Custom icon name or override")
    enabled: bool = Field(True, description="Whether channel is active and displayed to users")
    order: int = Field(0, description="Display ordering position")

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        clean_v = v.lower().strip()
        allowed = ["whatsapp", "telegram", "messenger", "instagram", "email", "phone", "custom", "live_chat"]
        if clean_v not in allowed:
            raise ValueError(f"Channel type must be one of: {', '.join(allowed)}")
        return clean_v

    @field_validator("value")
    @classmethod
    def validate_value(cls, v: str) -> str:
        clean_v = v.strip()
        if not clean_v:
            raise ValueError("Contact value cannot be empty.")
        # Reject dangerous script protocols
        lower_v = clean_v.lower()
        if any(lower_v.startswith(p) for p in ["javascript:", "vbscript:", "data:", "file:"]):
            raise ValueError("Unsafe URL scheme detected. Only secure web protocols are permitted.")
        return clean_v


class SupportWidgetConfig(BaseModel):
    enabled: bool = Field(True, description="Master toggle for the floating support widget")
    title: str = Field("Horizon Concierge Support", max_length=100, description="Widget heading title")
    welcome_message: str = Field(
        "How can our client desk assist your portfolio today?",
        max_length=300,
        description="Greeting message displayed in expanded support panel",
    )
    position: str = Field("bottom-right", description="Default launcher position on desktop")
    offset_x: int = Field(24, ge=0, le=200, description="Horizontal offset in pixels on desktop")
    offset_y: int = Field(24, ge=0, le=200, description="Vertical offset in pixels on desktop")
    mobile_position: str = Field("bottom-right", description="Default launcher position on mobile")
    mobile_offset_x: int = Field(16, ge=0, le=200, description="Horizontal offset in pixels on mobile")
    mobile_offset_y: int = Field(16, ge=0, le=200, description="Vertical offset in pixels on mobile")
    show_on_mobile: bool = Field(True, description="Whether launcher renders on mobile viewports (< 768px)")
    show_on_desktop: bool = Field(True, description="Whether launcher renders on desktop viewports (>= 768px)")
    draggable: bool = Field(True, description="Allow users to drag the widget away from obstructed areas")
    visibility_scope: str = Field(
        "both",
        description="Scope where widget appears: 'both' (all), 'primary' (investor dashboard), 'secondary' (public website)",
    )
    channels: List[SupportChannelItem] = Field(default_factory=list, description="Configured contact channels")

    @field_validator("position", "mobile_position")
    @classmethod
    def validate_position(cls, v: str) -> str:
        clean_v = v.lower().strip()
        allowed = ["bottom-right", "bottom-left", "top-right", "top-left"]
        if clean_v not in allowed:
            raise ValueError(f"Position must be one of: {', '.join(allowed)}")
        return clean_v

    @field_validator("visibility_scope")
    @classmethod
    def validate_scope(cls, v: str) -> str:
        clean_v = v.lower().strip()
        allowed = ["both", "primary", "secondary"]
        if clean_v not in allowed:
            raise ValueError(f"Visibility scope must be one of: {', '.join(allowed)}")
        return clean_v


class SupportWidgetUpdateRequest(BaseModel):
    config: SupportWidgetConfig

