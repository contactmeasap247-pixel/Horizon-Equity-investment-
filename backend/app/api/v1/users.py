# ============================================
# HORIZON EQUITY - USER API ENDPOINTS
# ============================================

from fastapi import APIRouter, Depends, status, HTTPException
from datetime import datetime
from decimal import Decimal
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import verify_password, hash_password
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.kyc import KycSubmissionRequest, KycStatusResponse
from app.models.user import User
from app.models.wallet import Wallet
from app.models.registration_bonus import RegistrationBonus
from app.models.investment import Investment
from app.models.transaction import Transaction
from app.models.audit_log import AuditLog
from app.services.notification_service import notification_service

router = APIRouter()


class ChangePasswordRequest(BaseModel):
    """Schema for changing user password."""
    current_password: str = Field(..., description="Current account password")
    new_password: str = Field(..., min_length=6, description="New password, minimum 6 characters")


class EmailChangeRequest(BaseModel):
    """Schema for requesting email address update."""
    new_email: str = Field(..., description="New email address")
    current_password: str = Field(..., description="Account password for verification")


@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Retrieve the current user's profile details."""
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update personal details and cryptocurrency withdrawal wallet addresses in the user profile."""
    for field, value in user_update.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Change the user's password."""
    if not verify_password(body.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password."
        )
    
    current_user.password_hash = hash_password(body.new_password)
    db.add(current_user)

    audit = AuditLog(
        user_id=current_user.id,
        action="password_changed",
        entity_type="user",
        entity_id=current_user.id,
    )
    db.add(audit)

    await db.commit()
    return {"detail": "Password changed successfully."}


@router.post("/request-email-change", status_code=status.HTTP_200_OK)
async def request_email_change(
    body: EmailChangeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Request an email change with strict re-authentication."""
    if not verify_password(body.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid account password provided for security verification."
        )

    clean_email = body.new_email.strip().lower()
    if clean_email == current_user.email.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The new email address cannot be the same as your current email address."
        )

    # Check uniqueness
    existing = await db.execute(select(User).filter(User.email == clean_email))
    if existing.scalars().first() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email address is already registered to another account."
        )

    old_email = current_user.email
    current_user.email = clean_email
    current_user.email_verified = False
    db.add(current_user)

    audit = AuditLog(
        user_id=current_user.id,
        action="email_updated",
        entity_type="user",
        entity_id=current_user.id,
        new_values={"old_email": old_email, "new_email": clean_email},
    )
    db.add(audit)

    await notification_service.create_notification(
        db,
        user_id=current_user.id,
        type="security",
        title="Email Address Changed",
        message=f"Your account email address was changed to {clean_email}.",
    )

    await db.commit()
    return {"status": "success", "message": f"Email address updated to {clean_email}."}


# ============================================
# KYC VERIFICATION
# ============================================

@router.get("/kyc", response_model=KycStatusResponse)
async def get_kyc_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve user's KYC verification status, submitted data, and instructions."""
    raw_status = current_user.kyc_status or "not_started"
    
    # Map internal status to standard user lifecycle
    instructions_map = {
        "not_started": "Please submit your government-issued ID (Passport, Driver's License, or National ID) and identity details to unlock unrestricted withdrawals.",
        "pending": "Your verification documents have been received and are waiting in the compliance queue.",
        "submitted": "Your documents have been submitted and are queued for administrative review.",
        "under_review": "Your submission is currently being reviewed by a compliance officer.",
        "verified": "Your identity has been verified successfully. Full platform privileges and withdrawals are active.",
        "approved": "Your identity has been verified successfully. Full platform privileges and withdrawals are active.",
        "rejected": "Your verification was not approved. Please review the reason below and resubmit clear documents.",
        "requires_info": "Additional information is required before compliance approval can be granted.",
    }

    instructions = instructions_map.get(raw_status, "Verification in progress.")

    # Return safe submission metadata (excluding raw base64 or secrets)
    safe_data = None
    if current_user.kyc_documents and isinstance(current_user.kyc_documents, dict):
        safe_data = {
            "document_type": current_user.kyc_documents.get("document_type"),
            "full_legal_name": current_user.kyc_documents.get("full_legal_name"),
            "nationality": current_user.kyc_documents.get("nationality"),
            "date_of_birth": current_user.kyc_documents.get("date_of_birth"),
            "submitted_fields": list(current_user.kyc_documents.keys()),
        }

    rejection_reason = None
    if isinstance(current_user.kyc_documents, dict):
        rejection_reason = current_user.kyc_documents.get("review_notes") or current_user.kyc_documents.get("rejection_reason")

    return KycStatusResponse(
        status=raw_status,
        submitted_at=current_user.kyc_submitted_at,
        verified_at=current_user.kyc_verified_at,
        submission_data=safe_data,
        rejection_reason=rejection_reason,
        instructions=instructions,
    )


@router.post("/kyc/submit", response_model=KycStatusResponse)
async def submit_kyc(
    payload: KycSubmissionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit identity verification data and documents for compliance review."""
    if current_user.kyc_status in ["verified", "approved"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your identity is already verified. Resubmission is not required.",
        )

    doc_store = {
        "document_type": payload.document_type,
        "document_number": payload.document_number.strip(),
        "full_legal_name": payload.full_legal_name.strip(),
        "date_of_birth": payload.date_of_birth.strip(),
        "nationality": payload.nationality,
        "front_document": payload.front_document,
        "back_document": payload.back_document,
        "selfie_proof": payload.selfie_proof,
        "submitted_at": datetime.utcnow().isoformat(),
    }

    current_user.kyc_documents = doc_store
    current_user.kyc_status = "under_review"
    current_user.kyc_submitted_at = datetime.utcnow()
    db.add(current_user)

    audit = AuditLog(
        user_id=current_user.id,
        action="kyc_submitted",
        entity_type="user",
        entity_id=current_user.id,
        new_values={
            "document_type": payload.document_type,
            "legal_name": payload.full_legal_name,
        },
    )
    db.add(audit)

    await notification_service.create_notification(
        db,
        user_id=current_user.id,
        type="system",
        title="Verification Documents Submitted",
        message="Your KYC verification documents have been received and are now under compliance review.",
    )

    await db.commit()
    await db.refresh(current_user)

    return KycStatusResponse(
        status="under_review",
        submitted_at=current_user.kyc_submitted_at,
        verified_at=None,
        submission_data={
            "document_type": payload.document_type,
            "full_legal_name": payload.full_legal_name,
            "nationality": payload.nationality,
            "date_of_birth": payload.date_of_birth,
        },
        rejection_reason=None,
        instructions="Your submission is currently under review by our compliance team.",
    )


# ============================================
# REGISTRATION BONUS
# ============================================

@router.get("/bonus")
async def get_registration_bonus_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve registration promotional credit status and unlock conditions."""
    bonus_res = await db.execute(
        select(RegistrationBonus).filter(RegistrationBonus.user_id == current_user.id)
    )
    bonus = bonus_res.scalars().first()

    # If user doesn't have a bonus record yet (e.g. registered earlier), award it safely now
    if not bonus:
        # Check if user USDT wallet exists
        wallet_res = await db.execute(
            select(Wallet).filter(Wallet.user_id == current_user.id, Wallet.currency == "USDT")
        )
        wallet = wallet_res.scalars().first()
        if not wallet:
            wallet = Wallet(user_id=current_user.id, currency="USDT", balance=Decimal("5.00"))
            db.add(wallet)
        else:
            wallet.balance += Decimal("5.00")
            db.add(wallet)

        bonus = RegistrationBonus(
            user_id=current_user.id,
            amount=Decimal("5.00"),
            currency="USDT",
            status="locked",
            awarded_at=datetime.utcnow(),
            notes="Welcome bonus auto-credited to existing account.",
        )
        db.add(bonus)

        tx = Transaction(
            user_id=current_user.id,
            type="registration_bonus",
            subtype="promotional_credit",
            amount=Decimal("5.00"),
            fee=Decimal("0.0"),
            currency="USDT",
            status="completed",
            reference=f"BONUS-{current_user.id.hex[:8].upper()}",
            description="Welcome promotional credit ($5.00 USDT). Locked until completing first qualifying investment.",
        )
        db.add(tx)
        await db.commit()
        await db.refresh(bonus)

    # Check if qualifying investment has completed to unlock bonus
    if bonus.status == "locked":
        inv_res = await db.execute(
            select(Investment).filter(
                Investment.user_id == current_user.id,
                Investment.status.in_(["matured", "completed"]),
            )
        )
        completed_inv = inv_res.scalars().first()
        if completed_inv:
            bonus.status = "unlocked"
            bonus.unlocked_at = datetime.utcnow()
            bonus.qualifying_investment_id = completed_inv.id
            db.add(bonus)
            await db.commit()
            await db.refresh(bonus)

    return {
        "amount": float(bonus.amount),
        "currency": bonus.currency,
        "status": bonus.status,
        "is_withdrawable": bonus.status == "unlocked",
        "awarded_at": bonus.awarded_at.isoformat() if bonus.awarded_at else None,
        "unlocked_at": bonus.unlocked_at.isoformat() if bonus.unlocked_at else None,
        "qualifying_investment_id": str(bonus.qualifying_investment_id) if bonus.qualifying_investment_id else None,
        "rules": {
            "title": "Welcome Registration Credit Policy",
            "requirement": "The $5.00 welcome bonus is a promotional credit credited directly to your USDT balance. To unlock this bonus for withdrawal, you must successfully complete at least one qualifying investment contract (e.g. Silver Plan).",
            "qualifying_plan": "Silver Starter Tier (Min $100, 2-day duration)",
        },
    }

