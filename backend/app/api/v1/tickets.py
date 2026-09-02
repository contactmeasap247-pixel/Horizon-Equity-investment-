# ============================================
# HORIZON EQUITY - SUPPORT TICKET API ENDPOINTS
# ============================================

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.ticket import (
    SupportTicketCreate,
    SupportTicketResponse,
    SupportTicketDetailResponse,
    TicketReplyCreate,
    TicketReplyResponse,
)
from app.services.ticket_service import ticket_service
from app.models.user import User

router = APIRouter()


@router.post("", response_model=SupportTicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    body: SupportTicketCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Open a new support ticket."""
    return await ticket_service.create_ticket(db, current_user.id, body)


@router.get("", response_model=List[SupportTicketResponse])
async def get_my_tickets(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve the list of support tickets created by the user, optionally filtered by status."""
    return await ticket_service.get_user_tickets(db, current_user.id, status)


@router.get("/{ticket_id}", response_model=SupportTicketDetailResponse)
async def get_ticket_details(
    ticket_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve details of a specific support ticket, including all messages in the conversation thread."""
    ticket = await ticket_service.get_ticket_by_id(db, ticket_id)
    if ticket is None or ticket.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Support ticket not found."
        )
    return ticket


@router.post("/{ticket_id}/reply", response_model=TicketReplyResponse, status_code=status.HTTP_201_CREATED)
async def reply_to_ticket(
    ticket_id: UUID,
    body: TicketReplyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Submit a reply to a support ticket thread."""
    # Ensure ticket exists and belongs to the user
    ticket = await ticket_service.get_ticket_by_id(db, ticket_id)
    if ticket is None or ticket.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Support ticket not found."
        )
        
    return await ticket_service.create_ticket_reply(
        db,
        ticket_id=ticket_id,
        user_id=current_user.id,
        reply_in=body,
        is_admin=False,
    )
