# ============================================
# HORIZON EQUITY - ADMIN OPERATIONS API
# Production-ready Platform Management Endpoints
# ============================================

from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, desc, func
from uuid import UUID
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_admin_user
from app.schemas.admin import (
    AdminDashboardStats,
    AdminOverviewMetrics,
    KycVerificationRequest,
    DepositVerificationRequest,
    WithdrawalProcessingRequest,
    WithdrawalReinvestRequest,
    UserSuspensionRequest,
    BalanceAdjustmentRequest,
    UserDetailResponse,
    UserUpdateRequest,
    ActiveInvestmentItem,
    ProcessMaturedResult,
    PlatformSettingItem,
    PlatformSettingUpdateRequest,
    EmailTemplateItem,
    EmailTemplateUpdateRequest,
    EmailTestSendRequest,
    BroadcastNotificationRequest,
    AuditLogItem,
    SecurityControlsData,
    SecurityControlsUpdateRequest,
)
from app.schemas.user import UserResponse
from app.schemas.wallet import DepositRequestResponse, WithdrawalRequestResponse, WalletResponse
from app.schemas.ticket import SupportTicketResponse
from app.services.admin_service import admin_service
from app.models.user import User
from app.models.deposit_request import DepositRequest
from app.models.withdrawal_request import WithdrawalRequest
from app.models.investment_plan import InvestmentPlan
from app.models.wallet import Wallet

router = APIRouter()


# ----------------------------------------------------
# 1. OVERVIEW & METRICS
# ----------------------------------------------------

@router.get("/stats")
async def get_dashboard_statistics(
    period: Optional[str] = Query("all", description="Time period filter: today, 7d, 30d, 90d, all"),
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve comprehensive platform metrics and historical activity strictly from real database records."""
    return await admin_service.get_dashboard_stats(db, period=period)


# ----------------------------------------------------
# 2. USERS MANAGEMENT
# ----------------------------------------------------

@router.get("/users")
async def list_users(
    search: Optional[str] = None,
    account_status: Optional[str] = None,  # "active", "suspended"
    kyc_status: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve users with search by name/email, account status filter, and pagination."""
    query = select(User)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(or_(User.email.ilike(s), User.full_name.ilike(s)))
    if account_status == "active":
        query = query.filter(User.is_active == True, User.is_suspended == False)
    elif account_status == "suspended":
        query = query.filter(User.is_suspended == True)
    if kyc_status:
        query = query.filter(User.kyc_status == kyc_status.lower().strip())

    total = (await db.execute(select(func.count(User.id)).select_from(query.subquery()))).scalar() or 0
    result = await db.execute(query.order_by(User.created_at.desc()).offset(offset).limit(limit))
    users = result.scalars().all()

    # Enrich users with wallet balance summaries
    user_list = []
    for u in users:
        wallets_res = await db.execute(select(Wallet).filter(Wallet.user_id == u.id))
        balances = {w.currency: float(w.balance) for w in wallets_res.scalars().all()}
        user_list.append({
            "id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "phone": u.phone,
            "country": u.country,
            "is_active": u.is_active,
            "is_suspended": u.is_suspended,
            "suspension_reason": u.suspension_reason,
            "kyc_status": u.kyc_status,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "last_login": u.last_login.isoformat() if u.last_login else None,
            "balances": balances,
            "referral_count": u.referral_count,
            "referral_earnings": float(u.referral_earnings or 0.0),
        })

    return {"total": total, "items": user_list, "limit": limit, "offset": offset}


@router.get("/users/{user_id}/detail")
async def get_user_drilldown(
    user_id: UUID,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve complete user profile, wallets, active investments, deposits, withdrawals and audit history."""
    return await admin_service.get_user_detail(db, user_id=user_id)


@router.put("/users/{user_id}")
async def update_user_profile(
    user_id: UUID,
    body: UserUpdateRequest,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user personal profile information, recording an administrative audit event."""
    return await admin_service.update_user_profile(
        db,
        user_id=user_id,
        payload=body.model_dump(exclude_unset=True),
        admin_id=current_admin.id,
    )


@router.post("/users/{user_id}/suspend", response_model=UserResponse)
async def toggle_user_suspension(
    user_id: UUID,
    body: UserSuspensionRequest,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Suspend or reactivate a user account, revoking active sessions on suspension."""
    return await admin_service.suspend_user(
        db,
        user_id=user_id,
        is_suspended=body.is_suspended,
        admin_id=current_admin.id,
        suspension_reason=body.suspension_reason,
    )


@router.post("/users/{user_id}/kyc", response_model=UserResponse)
async def update_kyc_status(
    user_id: UUID,
    body: KycVerificationRequest,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Approve or reject user identity documentation submissions (KYC)."""
    return await admin_service.update_user_kyc(
        db,
        user_id=user_id,
        kyc_status=body.status,
        admin_id=current_admin.id,
        rejection_reason=body.rejection_reason,
    )


@router.post("/users/{user_id}/adjust-balance", response_model=WalletResponse)
async def adjust_user_balance(
    user_id: UUID,
    body: BalanceAdjustmentRequest,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Manually credit or debit a user's wallet balance, logging details to immutable ledger."""
    return await admin_service.manual_adjust_balance(
        db,
        user_id=user_id,
        currency=body.currency,
        amount=body.amount,
        adjustment_type=body.adjustment_type,
        admin_id=current_admin.id,
        description=body.description,
    )


# ----------------------------------------------------
# 3. DEPOSITS MANAGEMENT
# ----------------------------------------------------

@router.get("/deposits")
async def list_deposits(
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all user deposit requests with search, status filters, and pagination."""
    query = select(DepositRequest, User).join(User, DepositRequest.user_id == User.id)
    if status:
        query = query.filter(DepositRequest.status == status.lower().strip())
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.email.ilike(s),
                User.full_name.ilike(s),
                DepositRequest.transaction_hash.ilike(s),
                DepositRequest.wallet_address.ilike(s),
            )
        )

    total = (await db.execute(select(func.count(DepositRequest.id)).select_from(query.subquery()))).scalar() or 0
    result = await db.execute(query.order_by(DepositRequest.created_at.desc()).offset(offset).limit(limit))

    items = []
    for dep, user in result.all():
        items.append({
            "id": str(dep.id),
            "user_id": str(user.id),
            "user_name": user.full_name,
            "user_email": user.email,
            "amount": float(dep.amount),
            "currency": dep.currency,
            "wallet_address": dep.wallet_address,
            "transaction_hash": dep.transaction_hash,
            "status": dep.status,
            "rejection_reason": dep.rejection_reason,
            "created_at": dep.created_at.isoformat() if dep.created_at else None,
            "verified_at": dep.verified_at.isoformat() if dep.verified_at else None,
        })

    return {"total": total, "items": items, "limit": limit, "offset": offset}


@router.post("/deposits/{deposit_id}/verify", response_model=DepositRequestResponse)
async def verify_deposit(
    deposit_id: UUID,
    body: DepositVerificationRequest,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Approve or reject a manual deposit request, crediting user wallet on verification."""
    return await admin_service.verify_user_deposit(
        db,
        deposit_id=deposit_id,
        status_val=body.status,
        admin_id=current_admin.id,
        rejection_reason=body.rejection_reason,
    )


# ----------------------------------------------------
# 4. WITHDRAWAL REQUESTS & REINVESTMENT
# ----------------------------------------------------

@router.get("/withdrawals")
async def list_withdrawals(
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all user withdrawal requests with search, status filters, and pagination."""
    query = select(WithdrawalRequest, User).join(User, WithdrawalRequest.user_id == User.id)
    if status:
        query = query.filter(WithdrawalRequest.status == status.lower().strip())
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.email.ilike(s),
                User.full_name.ilike(s),
                WithdrawalRequest.transaction_hash.ilike(s),
                WithdrawalRequest.wallet_address.ilike(s),
            )
        )

    total = (await db.execute(select(func.count(WithdrawalRequest.id)).select_from(query.subquery()))).scalar() or 0
    result = await db.execute(query.order_by(WithdrawalRequest.created_at.desc()).offset(offset).limit(limit))

    items = []
    for wdr, user in result.all():
        items.append({
            "id": str(wdr.id),
            "user_id": str(user.id),
            "user_name": user.full_name,
            "user_email": user.email,
            "amount": float(wdr.amount),
            "currency": wdr.currency,
            "wallet_address": wdr.wallet_address,
            "wallet_type": wdr.wallet_type,
            "status": wdr.status,
            "rejection_reason": wdr.rejection_reason,
            "transaction_hash": wdr.transaction_hash,
            "created_at": wdr.created_at.isoformat() if wdr.created_at else None,
            "processed_at": wdr.processed_at.isoformat() if wdr.processed_at else None,
        })

    return {"total": total, "items": items, "limit": limit, "offset": offset}


@router.post("/withdrawals/{withdrawal_id}/process", response_model=WithdrawalRequestResponse)
async def process_withdrawal(
    withdrawal_id: UUID,
    body: WithdrawalProcessingRequest,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Process a withdrawal request into processing, completed, or rejected state."""
    return await admin_service.process_user_withdrawal(
        db,
        withdrawal_id=withdrawal_id,
        status_val=body.status,
        admin_id=current_admin.id,
        rejection_reason=body.rejection_reason,
        transaction_hash=body.transaction_hash,
    )


@router.post("/withdrawals/{withdrawal_id}/reinvest")
async def reinvest_withdrawal_request(
    withdrawal_id: UUID,
    body: WithdrawalReinvestRequest,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Reinvest a pending withdrawal amount directly into an active investment portfolio tier."""
    return await admin_service.reinvest_withdrawal(
        db,
        withdrawal_id=withdrawal_id,
        plan_id=body.plan_id,
        admin_id=current_admin.id,
    )


# ----------------------------------------------------
# 5. ACTIVE DEPOSITS & INVESTMENT MATURITY
# ----------------------------------------------------

@router.get("/investments/active")
async def get_active_investments(
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve active deposits/investments that have not yet reached maturity, with countdowns."""
    return await admin_service.get_active_investments(db)


@router.post("/investments/process-matured", response_model=ProcessMaturedResult)
async def process_matured_contracts(
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Process and settle all contracts that have reached their maturity date."""
    return await admin_service.process_matured_investments(db, admin_id=current_admin.id)


@router.get("/investments/plans")
async def list_investment_plans(
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve available investment tiers for reinvestment or configuration."""
    result = await db.execute(select(InvestmentPlan).order_by(InvestmentPlan.sort_order.asc()))
    plans = result.scalars().all()
    return [
        {
            "id": str(p.id),
            "name": p.name,
            "min_amount": float(p.min_amount),
            "max_amount": float(p.max_amount) if p.max_amount else None,
            "return_percentage": float(p.return_percentage),
            "duration_days": p.duration_days,
            "is_active": p.is_active,
        }
        for p in plans
    ]


# ----------------------------------------------------
# 6. TRANSACTIONS LEDGER
# ----------------------------------------------------

@router.get("/transactions")
async def get_platform_transactions(
    search: Optional[str] = None,
    type: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Comprehensive searchable ledger of all platform financial operations."""
    return await admin_service.get_platform_transactions(
        db,
        search=search,
        type_filter=type,
        status_filter=status,
        limit=limit,
        offset=offset,
    )


# ----------------------------------------------------
# 7. REFERRAL EARNINGS ANALYTICS
# ----------------------------------------------------

@router.get("/referrals/analytics")
async def get_referral_analytics(
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Analytics on top referrers, total commissions paid and pending."""
    return await admin_service.get_referral_analytics(db)


# ----------------------------------------------------
# 8. PLATFORM SETTINGS & AUTO WITHDRAWAL
# ----------------------------------------------------

@router.get("/settings")
async def get_platform_settings(
    group: Optional[str] = None,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve persisted platform configuration parameters."""
    return await admin_service.get_settings(db, group_name=group)


@router.put("/settings/{key}")
async def update_platform_setting(
    key: str,
    body: PlatformSettingUpdateRequest,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Persistently update a platform configuration parameter."""
    return await admin_service.update_setting(
        db,
        key=key,
        value=body.value,
        admin_id=current_admin.id,
    )


# ----------------------------------------------------
# 9. EMAIL TEMPLATES MANAGEMENT
# ----------------------------------------------------

@router.get("/email-templates")
async def get_email_templates(
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve company-quality email templates across all categories."""
    return await admin_service.get_email_templates(db)


@router.put("/email-templates/{key}")
async def update_email_template(
    key: str,
    body: EmailTemplateUpdateRequest,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Update subject line, HTML content, and plain text content of an email template."""
    return await admin_service.update_email_template(
        db,
        key=key,
        payload=body.model_dump(exclude_unset=True),
        admin_id=current_admin.id,
    )


@router.post("/email-templates/{key}/test-send")
async def test_send_email_template(
    key: str,
    body: EmailTestSendRequest,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Dispatch an authorized test preview email to verify template formatting."""
    return await admin_service.send_test_email(
        db,
        template_key=key,
        recipient_email=body.recipient_email,
        variables=body.variables,
    )


# ----------------------------------------------------
# 10. NOTIFICATIONS BROADCAST
# ----------------------------------------------------

@router.post("/notifications/broadcast")
async def broadcast_notification(
    body: BroadcastNotificationRequest,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Broadcast an in-app alert or notification to all active investors or a target user."""
    return await admin_service.broadcast_notification(
        db,
        title=body.title,
        message=body.message,
        notif_type=body.type or "system",
        admin_id=current_admin.id,
        target_user_id=body.target_user_id,
    )


# ----------------------------------------------------
# 11. AUDIT LOGS & SECURITY CONTROLS
# ----------------------------------------------------

@router.get("/audit-logs")
async def list_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Immutable audit log history of all administrative actions and security changes."""
    return await admin_service.get_audit_logs(
        db,
        limit=limit,
        offset=offset,
        action=action,
        entity_type=entity_type,
    )


# ----------------------------------------------------
# 12. TICKETS (SUPPORT)
# ----------------------------------------------------

@router.get("/tickets", response_model=List[SupportTicketResponse])
async def list_tickets(
    status: Optional[str] = None,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve support tickets across the platform."""
    from app.services.ticket_service import ticket_service
    return await ticket_service.get_all_tickets(db, status_filter=status)


# ----------------------------------------------------
# 13. LOAN MANAGEMENT
# ----------------------------------------------------

@router.get("/loans")
async def admin_list_loans(
    status: Optional[str] = None,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Administrative overview and queue of all user loan applications."""
    from app.services.loan_service import loan_service
    return await loan_service.admin_list_loans(db, status_filter=status)


@router.post("/loans/{loan_id}/review")
async def admin_review_loan(
    loan_id: UUID,
    body: Dict[str, Any],
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Approve or decline an investment-backed loan application with recorded reason."""
    from app.services.loan_service import loan_service
    new_status = body.get("status", "")
    decline_reason = body.get("decline_reason")
    return await loan_service.admin_review_loan(
        db,
        loan_id=loan_id,
        new_status=new_status,
        admin_id=current_admin.id,
        decline_reason=decline_reason,
    )


@router.post("/loans/{loan_id}/disburse")
async def admin_disburse_loan(
    loan_id: UUID,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Disburse approved loan principal to the borrower's wallet."""
    from app.services.loan_service import loan_service
    return await loan_service.admin_disburse_loan(
        db,
        loan_id=loan_id,
        admin_id=current_admin.id,
    )


# ----------------------------------------------------
# 14. KYC QUEUE
# ----------------------------------------------------

@router.get("/kyc/submissions")
async def list_kyc_submissions(
    status: Optional[str] = None,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all users with submitted, pending, or reviewed KYC verification."""
    query = select(User).filter(User.kyc_status != None)
    if status:
        query = query.filter(User.kyc_status == status.lower().strip())
    else:
        query = query.filter(User.kyc_status.in_(["submitted", "under_review", "pending", "requires_info", "rejected", "verified"]))

    result = await db.execute(query.order_by(desc(User.kyc_submitted_at)))
    users = result.scalars().all()

    return [
        {
            "id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "country": u.country,
            "kyc_status": u.kyc_status,
            "kyc_documents": u.kyc_documents,
            "kyc_submitted_at": u.kyc_submitted_at.isoformat() if u.kyc_submitted_at else None,
            "kyc_verified_at": u.kyc_verified_at.isoformat() if u.kyc_verified_at else None,
        }
        for u in users
    ]

