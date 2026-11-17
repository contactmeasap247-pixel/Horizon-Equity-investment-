# ============================================
# HORIZON EQUITY - CUSTOMER SUPPORT API ENDPOINTS
# Public & Client Facing Support Widget Configuration
# ============================================

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from app.core.database import get_db
from app.services.admin_service import admin_service

router = APIRouter()


@router.get("/widget-config", response_model=Dict[str, Any])
async def get_support_widget_configuration(
    db: AsyncSession = Depends(get_db)
):
    """
    Public endpoint to fetch active floating customer support widget configuration.
    Returns sanitized settings and only currently enabled channels.
    """
    raw_config = await admin_service.get_support_widget_config(db)

    # If disabled by administration, return minimal disabled payload
    if not raw_config.get("enabled", True):
        return {
            "enabled": False,
            "title": raw_config.get("title", "Horizon Concierge Support"),
            "welcome_message": raw_config.get("welcome_message", ""),
            "position": raw_config.get("position", "bottom-right"),
            "offset_x": raw_config.get("offset_x", 24),
            "offset_y": raw_config.get("offset_y", 24),
            "mobile_position": raw_config.get("mobile_position", "bottom-right"),
            "mobile_offset_x": raw_config.get("mobile_offset_x", 16),
            "mobile_offset_y": raw_config.get("mobile_offset_y", 16),
            "show_on_mobile": raw_config.get("show_on_mobile", True),
            "show_on_desktop": raw_config.get("show_on_desktop", True),
            "draggable": raw_config.get("draggable", True),
            "visibility_scope": raw_config.get("visibility_scope", "both"),
            "channels": [],
        }

    # Filter only enabled channels and sort by order
    channels = raw_config.get("channels", [])
    active_channels = [c for c in channels if c.get("enabled", True)]
    active_channels.sort(key=lambda x: x.get("order", 0))

    return {
        "enabled": True,
        "title": raw_config.get("title", "Horizon Concierge Support"),
        "welcome_message": raw_config.get("welcome_message", "How can our client desk assist your portfolio today?"),
        "position": raw_config.get("position", "bottom-right"),
        "offset_x": raw_config.get("offset_x", 24),
        "offset_y": raw_config.get("offset_y", 24),
        "mobile_position": raw_config.get("mobile_position", "bottom-right"),
        "mobile_offset_x": raw_config.get("mobile_offset_x", 16),
        "mobile_offset_y": raw_config.get("mobile_offset_y", 16),
        "show_on_mobile": raw_config.get("show_on_mobile", True),
        "show_on_desktop": raw_config.get("show_on_desktop", True),
        "draggable": raw_config.get("draggable", True),
        "visibility_scope": raw_config.get("visibility_scope", "both"),
        "channels": active_channels,
    }

