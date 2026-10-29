# ============================================
# HORIZON EQUITY - WEBHOOKS (BREVO DELIVERY TRACKING)
# ============================================

import logging
from typing import Any, Dict, List, Union
from datetime import datetime
from fastapi import APIRouter, Depends, Request, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from app.core.database import get_db
from app.models.email_log import EmailLog

logger = logging.getLogger("horizon.webhooks")
router = APIRouter()


@router.post("/brevo", status_code=status.HTTP_200_OK)
async def brevo_email_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Receive asynchronous delivery, bounce, open, and click notifications from Brevo transactional email API.
    Updates corresponding EmailLog records for operational auditing.
    """
    try:
        body: Union[Dict[str, Any], List[Dict[str, Any]]] = await request.json()
    except Exception as e:
        logger.error(f"Failed to parse Brevo webhook JSON: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON payload.")

    events: List[Dict[str, Any]] = body if isinstance(body, list) else [body]
    processed_count = 0

    for ev in events:
        if not isinstance(ev, dict):
            continue

        event_type = (ev.get("event") or "").strip().lower()
        recipient_email = (ev.get("email") or "").strip().lower()
        provider_msg_id = ev.get("message-id") or ev.get("message_id")

        if not recipient_email and not provider_msg_id:
            continue

        # Map status
        mapped_status = "sent"
        if event_type == "delivered":
            mapped_status = "delivered"
        elif event_type in ["soft_bounce", "hard_bounce", "blocked", "invalid_email"]:
            mapped_status = "bounced"
        elif event_type in ["opened", "unique_opened"]:
            mapped_status = "opened"
        elif event_type == "click":
            mapped_status = "clicked"
        elif event_type in ["spam", "complaint"]:
            mapped_status = "spam"
        elif event_type in ["error", "deferred"]:
            mapped_status = "failed"
        else:
            mapped_status = event_type or "sent"

        # Find matching EmailLog
        log_entry = None
        if provider_msg_id:
            query = select(EmailLog).filter(EmailLog.provider_message_id == str(provider_msg_id))
            res = await db.execute(query)
            log_entry = res.scalars().first()

        if not log_entry and recipient_email:
            query = (
                select(EmailLog)
                .filter(EmailLog.recipient == recipient_email)
                .order_by(desc(EmailLog.created_at))
            )
            res = await db.execute(query)
            log_entry = res.scalars().first()

        if log_entry:
            log_entry.status = mapped_status
            log_entry.event_data = ev
            log_entry.updated_at = datetime.utcnow()
            db.add(log_entry)
            processed_count += 1
            logger.info(f"Updated EmailLog #{log_entry.id} ({recipient_email}) status to '{mapped_status}' via Brevo webhook")

    if processed_count > 0:
        await db.commit()

    return {
        "status": "success",
        "events_received": len(events),
        "events_processed": processed_count,
    }
