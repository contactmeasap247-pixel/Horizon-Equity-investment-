# ============================================
# HORIZON EQUITY - SUPPORT TICKET SERVICE
# ============================================

import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.support_ticket import SupportTicket, TicketReply
from app.schemas.ticket import SupportTicketCreate, TicketReplyCreate


class TicketService:
    """Business logic for support ticket management and replies conversations."""

    @staticmethod
    async def create_ticket(
        db: AsyncSession, user_id: uuid.UUID, ticket_in: SupportTicketCreate
    ) -> SupportTicket:
        """Open a new support ticket."""
        new_ticket = SupportTicket(
            user_id=user_id,
            subject=ticket_in.subject.strip(),
            message=ticket_in.message.strip(),
            category=ticket_in.category.strip() if ticket_in.category else "general",
            priority=ticket_in.priority.lower().strip() if ticket_in.priority else "medium",
            status="open",
        )
        db.add(new_ticket)
        await db.commit()
        await db.refresh(new_ticket)
        return new_ticket

    @staticmethod
    async def get_user_tickets(
        db: AsyncSession, user_id: uuid.UUID, status_filter: Optional[str] = None
    ) -> List[SupportTicket]:
        """Fetch all support tickets created by a specific user, sorted by date."""
        query = select(SupportTicket).filter(SupportTicket.user_id == user_id)
        if status_filter:
            query = query.filter(SupportTicket.status == status_filter.lower().strip())
        result = await db.execute(query.order_by(SupportTicket.created_at.desc()))
        return list(result.scalars().all())

    @staticmethod
    async def get_ticket_by_id(db: AsyncSession, ticket_id: uuid.UUID) -> Optional[SupportTicket]:
        """Fetch a specific support ticket by ID including all conversational replies."""
        result = await db.execute(
            select(SupportTicket)
            .filter(SupportTicket.id == ticket_id)
            .options(selectinload(SupportTicket.replies))
        )
        return result.scalars().first()

    async def create_ticket_reply(
        self,
        db: AsyncSession,
        ticket_id: uuid.UUID,
        user_id: uuid.UUID,
        reply_in: TicketReplyCreate,
        is_admin: bool = False,
    ) -> TicketReply:
        """Add a conversational reply to a support ticket, auto-updating ticket state."""
        ticket = await self.get_ticket_by_id(db, ticket_id)
        if ticket is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Support ticket not found.",
            )

        # Create reply record
        new_reply = TicketReply(
            ticket_id=ticket_id,
            user_id=user_id,
            message=reply_in.message.strip(),
            is_admin=is_admin,
        )
        db.add(new_reply)

        # Auto-update status: if admin responds -> in_progress; if user responds -> open
        if is_admin:
            ticket.status = "in_progress"
        else:
            ticket.status = "open"
        ticket.updated_at = datetime.utcnow()
        db.add(ticket)

        await db.commit()
        await db.refresh(new_reply)
        return new_reply

    async def resolve_ticket(self, db: AsyncSession, ticket_id: uuid.UUID, resolved_by: uuid.UUID) -> Optional[SupportTicket]:
        """Mark a support ticket as resolved."""
        ticket = await self.get_ticket_by_id(db, ticket_id)
        if ticket:
            ticket.status = "resolved"
            ticket.resolved_at = datetime.utcnow()
            ticket.assigned_to = resolved_by
            db.add(ticket)
            await db.commit()
            await db.refresh(ticket)
        return ticket

    async def close_ticket(self, db: AsyncSession, ticket_id: uuid.UUID) -> Optional[SupportTicket]:
        """Mark a support ticket as closed."""
        ticket = await self.get_ticket_by_id(db, ticket_id)
        if ticket:
            ticket.status = "closed"
            ticket.closed_at = datetime.utcnow()
            db.add(ticket)
            await db.commit()
            await db.refresh(ticket)
        return ticket

    # --- Admin CRUD Operations ---

    @staticmethod
    async def get_all_tickets(
        db: AsyncSession,
        status_filter: Optional[str] = None,
        category_filter: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[SupportTicket]:
        """Fetch all support tickets across the platform with optional filters for admin view."""
        query = select(SupportTicket)
        if status_filter:
            query = query.filter(SupportTicket.status == status_filter.lower().strip())
        if category_filter:
            query = query.filter(SupportTicket.category == category_filter.lower().strip())
            
        query = query.order_by(SupportTicket.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())


ticket_service = TicketService()
