# ============================================
# HORIZON EQUITY - NOTIFICATION SERVICE
# ============================================

import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.notification import Notification


class NotificationService:
    """Business logic for user notifications."""

    @staticmethod
    async def get_user_notifications(
        db: AsyncSession, user_id: uuid.UUID, only_unread: bool = False
    ) -> List[Notification]:
        """Fetch all notifications of a user, optionally filtering for unread only."""
        query = select(Notification).filter(Notification.user_id == user_id)
        if only_unread:
            query = query.filter(Notification.is_read == False)
        result = await db.execute(query.order_by(Notification.created_at.desc()))
        return list(result.scalars().all())

    @staticmethod
    async def get_notification_by_id(
        db: AsyncSession, notification_id: uuid.UUID
    ) -> Optional[Notification]:
        """Fetch a specific notification by ID."""
        result = await db.execute(select(Notification).filter(Notification.id == notification_id))
        return result.scalars().first()

    @staticmethod
    async def create_notification(
        db: AsyncSession,
        user_id: uuid.UUID,
        type: str,
        title: str,
        message: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Notification:
        """Create and persist a new notification for a user."""
        notification = Notification(
            user_id=user_id,
            type=type.lower().strip(),
            title=title.strip(),
            message=message.strip(),
            is_read=False,
            metadata_=metadata,
        )
        db.add(notification)
        await db.commit()
        await db.refresh(notification)
        return notification

    async def mark_notification_as_read(
        self, db: AsyncSession, notification_id: uuid.UUID, user_id: uuid.UUID
    ) -> bool:
        """Mark a specific user notification as read."""
        notification = await self.get_notification_by_id(db, notification_id)
        if notification and notification.user_id == user_id:
            if not notification.is_read:
                notification.is_read = True
                notification.read_at = datetime.utcnow()
                db.add(notification)
                await db.commit()
            return True
        return False

    @staticmethod
    async def mark_all_notifications_as_read(db: AsyncSession, user_id: uuid.UUID) -> bool:
        """Mark all notifications of a user as read."""
        result = await db.execute(
            select(Notification).filter(Notification.user_id == user_id, Notification.is_read == False)
        )
        unread_notifications = result.scalars().all()
        if not unread_notifications:
            return True

        for notification in unread_notifications:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
            db.add(notification)
            
        await db.commit()
        return True


notification_service = NotificationService()
