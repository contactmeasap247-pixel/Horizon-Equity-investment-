# ============================================
# HORIZON EQUITY - NOTIFICATION API ENDPOINTS
# ============================================

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.notification import NotificationResponse
from app.services.notification_service import notification_service
from app.models.user import User

router = APIRouter()


@router.get("", response_model=List[NotificationResponse])
async def get_my_notifications(
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve the list of user notifications, optionally filtering for unread only."""
    return await notification_service.get_user_notifications(db, current_user.id, unread_only)


@router.post("/read-all", status_code=status.HTTP_200_OK)
async def read_all_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark all notifications as read."""
    await notification_service.mark_all_notifications_as_read(db, current_user.id)
    return {"detail": "All notifications marked as read."}


@router.post("/{notification_id}/read", status_code=status.HTTP_200_OK)
async def read_notification(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark a specific notification as read."""
    success = await notification_service.mark_notification_as_read(db, notification_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or access denied."
        )
    return {"detail": "Notification marked as read."}
