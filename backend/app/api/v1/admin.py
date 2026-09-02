# ============================================
# HORIZON EQUITY - ADMIN OPERATIONS API
# ============================================

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_admin_user
from app.schemas.admin import (
    AdminDashboardStats,
    KycVerificationRequest,
    DepositVerificationRequest,
    WithdrawalProcessingRequest,
    UserSuspensionRequest,
    BalanceAdjustmentRequest,
)
from app.schemas.user import UserResponse
from app.schemas.wallet import DepositRequestResponse, WithdrawalRequestResponse, WalletResponse
from app.schemas.ticket import SupportTicketResponse
from app.services.admin_service import admin_service
from app.models.user import User
from app.models.deposit_request import DepositRequest
from app.models.withdrawal_request import WithdrawalRequest

router = APIRouter()


@router.get("/deposits", response_model=List[DepositRequestResponse])
async def list_deposits(
    status: Optional[str] = None,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all user deposit requests, optionally filtered by status."""
    query = select(DepositRequest)
    if status:
        query = query.filter(DepositRequest.status == status.lower().strip())
    result = await db.execute(query.order_by(DepositRequest.created_at.desc()))
    return list(result.scalars().all())


@router.get("/withdrawals", response_model=List[WithdrawalRequestResponse])
async def list_withdrawals(
    status: Optional[str] = None,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all user withdrawal requests, optionally filtered by status."""
    query = select(WithdrawalRequest)
    if status:
        query = query.filter(WithdrawalRequest.status == status.lower().strip())
    result = await db.execute(query.order_by(WithdrawalRequest.created_at.desc()))
    return list(result.scalars().all())


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    kyc_status: Optional[str] = None,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all registered users, optionally filtered by KYC status."""
    query = select(User)
    if kyc_status:
        query = query.filter(User.kyc_status == kyc_status.lower().strip())
    result = await db.execute(query.order_by(User.created_at.desc()))
    return list(result.scalars().all())


@router.get("/tickets", response_model=List[SupportTicketResponse])
async def list_tickets(
    status: Optional[str] = None,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all support tickets across the platform, optionally filtered by status."""
    from app.services.ticket_service import ticket_service
    return await ticket_service.get_all_tickets(db, status_filter=status)


@router.get("/stats", response_model=AdminDashboardStats)
async def get_dashboard_statistics(
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve platform metrics, analytics, wallet sums, active investments, and referral earnings."""
    return await admin_service.get_dashboard_stats(db)


@router.post("/deposits/{deposit_id}/verify", response_model=DepositRequestResponse)
async def verify_deposit(
    deposit_id: UUID,
    body: DepositVerificationRequest,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Approve or reject a manual deposit request, crediting the user wallet balance on approval."""
    return await admin_service.verify_user_deposit(
        db,
        deposit_id=deposit_id,
        status_val=body.status,
        admin_id=current_admin.id,
        rejection_reason=body.rejection_reason,
    )


@router.post("/withdrawals/{withdrawal_id}/process", response_model=WithdrawalRequestResponse)
async def process_withdrawal(
    withdrawal_id: UUID,
    body: WithdrawalProcessingRequest,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Process a withdrawal request. Approving will deduct frozen funds; rejecting will return frozen funds to the user balance."""
    return await admin_service.process_user_withdrawal(
        db,
        withdrawal_id=withdrawal_id,
        status_val=body.status,
        admin_id=current_admin.id,
        rejection_reason=body.rejection_reason,
        transaction_hash=body.transaction_hash,
    )


@router.post("/users/{user_id}/kyc", response_model=UserResponse)
async def update_kyc_status(
    user_id: UUID,
    body: KycVerificationRequest,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Approve or reject user identity documentation verification submissions (KYC)."""
    return await admin_service.update_user_kyc(
        db,
        user_id=user_id,
        kyc_status=body.status,
        admin_id=current_admin.id,
        rejection_reason=body.rejection_reason,
    )


@router.post("/users/{user_id}/suspend", response_model=UserResponse)
async def toggle_user_suspension(
    user_id: UUID,
    body: UserSuspensionRequest,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Suspend or reactivate a user account. Suspending a user immediately logs them out of all active sessions."""
    return await admin_service.suspend_user(
        db,
        user_id=user_id,
        is_suspended=body.is_suspended,
        admin_id=current_admin.id,
        suspension_reason=body.suspension_reason,
    )


@router.post("/users/{user_id}/adjust-balance", response_model=WalletResponse)
async def adjust_user_balance(
    user_id: UUID,
    body: BalanceAdjustmentRequest,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Manually credit or debit a user's cryptocurrency wallet balance."""
    return await admin_service.manual_adjust_balance(
        db,
        user_id=user_id,
        currency=body.currency,
        amount=body.amount,
        adjustment_type=body.adjustment_type,
        admin_id=current_admin.id,
        description=body.description,
    )
