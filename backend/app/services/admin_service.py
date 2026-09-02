# ============================================
# HORIZON EQUITY - ADMIN SERVICE
# ============================================

import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.models.user import User
from app.models.wallet import Wallet
from app.models.admin_wallet import AdminWallet
from app.models.deposit_request import DepositRequest
from app.models.withdrawal_request import WithdrawalRequest
from app.models.investment import Investment
from app.models.transaction import Transaction
from app.models.referral_commission import ReferralCommission
from app.models.session_token import SessionToken
from app.models.audit_log import AuditLog
from app.services.notification_service import notification_service
from app.services.transaction_service import transaction_service


class AdminService:
    """Business logic for administrator actions and metrics aggregation."""

    @staticmethod
    async def get_dashboard_stats(db: AsyncSession) -> Dict[str, Any]:
        """Aggregate site stats, user states, wallet sums, active investments, and referral earnings."""
        # 1. User counts
        total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
        active_users = (await db.execute(select(func.count(User.id)).filter(User.is_active == True, User.is_suspended == False))).scalar() or 0
        suspended_users = (await db.execute(select(func.count(User.id)).filter(User.is_suspended == True))).scalar() or 0
        kyc_pending = (await db.execute(select(func.count(User.id)).filter(User.kyc_status == "pending"))).scalar() or 0

        # 2. Wallet balances total by currency
        balances_query = await db.execute(
            select(Wallet.currency, func.sum(Wallet.balance)).group_by(Wallet.currency)
        )
        wallet_balances = {currency.upper(): Decimal(str(total or 0.0)) for currency, total in balances_query.all()}
        # Ensure default currencies are listed
        for cur in ["BTC", "ETH", "USDT", "SOL"]:
            if cur not in wallet_balances:
                wallet_balances[cur] = Decimal("0.0")

        # 3. Transaction counts
        total_deposits = (await db.execute(select(func.count(DepositRequest.id)))).scalar() or 0
        total_withdrawals = (await db.execute(select(func.count(WithdrawalRequest.id)))).scalar() or 0
        pending_deposits = (await db.execute(select(func.count(DepositRequest.id)).filter(DepositRequest.status == "pending"))).scalar() or 0
        pending_withdrawals = (await db.execute(select(func.count(WithdrawalRequest.id)).filter(WithdrawalRequest.status == "pending"))).scalar() or 0

        # 4. Investment stats
        active_investments_count = (await db.execute(select(func.count(Investment.id)).filter(Investment.status == "active"))).scalar() or 0
        investments_query = await db.execute(
            select(Investment.currency, func.sum(Investment.amount)).filter(Investment.status == "active").group_by(Investment.currency)
        )
        total_invested = {currency.upper(): Decimal(str(total or 0.0)) for currency, total in investments_query.all()}
        for cur in ["BTC", "ETH", "USDT", "SOL"]:
            if cur not in total_invested:
                total_invested[cur] = Decimal("0.0")

        # 5. Referral Commissions paid
        commissions_query = await db.execute(
            select(ReferralCommission.currency, func.sum(ReferralCommission.commission_amount))
            .filter(ReferralCommission.status == "paid")
            .group_by(ReferralCommission.currency)
        )
        total_commissions = {currency.upper(): Decimal(str(total or 0.0)) for currency, total in commissions_query.all()}
        for cur in ["BTC", "ETH", "USDT", "SOL"]:
            if cur not in total_commissions:
                total_commissions[cur] = Decimal("0.0")

        return {
            "total_users": total_users,
            "active_users": active_users,
            "suspended_users": suspended_users,
            "kyc_pending": kyc_pending,
            "wallet_balances": wallet_balances,
            "total_deposits_count": total_deposits,
            "total_withdrawals_count": total_withdrawals,
            "pending_deposits_count": pending_deposits,
            "pending_withdrawals_count": pending_withdrawals,
            "active_investments_count": active_investments_count,
            "total_invested_amount": total_invested,
            "total_referral_commissions": total_commissions,
        }

    # --- Deposit Verification ---

    @staticmethod
    async def verify_user_deposit(
        db: AsyncSession,
        deposit_id: uuid.UUID,
        status_val: str,
        admin_id: uuid.UUID,
        rejection_reason: Optional[str] = None,
    ) -> DepositRequest:
        """Approve or reject a user manual deposit request, crediting their wallet balances on approval."""
        status_clean = status_val.lower().strip()
        if status_clean not in ["verified", "rejected"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status selection. Must be 'verified' or 'rejected'.",
            )

        # Retrieve request
        result = await db.execute(select(DepositRequest).filter(DepositRequest.id == deposit_id))
        deposit = result.scalars().first()
        if deposit is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Deposit request not found.",
            )

        if deposit.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Deposit request is already processed and marked as '{deposit.status}'.",
            )

        deposit.verified_by = admin_id
        deposit.verified_at = datetime.utcnow()
        deposit.status = status_clean

        if status_clean == "verified":
            # Fetch user wallet to credit balance
            wallet_result = await db.execute(
                select(Wallet).filter(Wallet.user_id == deposit.user_id, Wallet.currency == deposit.currency)
            )
            wallet = wallet_result.scalars().first()
            if wallet is None:
                # Fallback: create user wallet if it somehow doesn't exist
                wallet = Wallet(
                    user_id=deposit.user_id,
                    currency=deposit.currency,
                    balance=Decimal("0.0"),
                    frozen_balance=Decimal("0.0"),
                )
                db.add(wallet)

            wallet.balance += deposit.amount
            wallet.total_deposited += deposit.amount
            db.add(wallet)

            # Record completed transaction ledger
            tx_ref = deposit.transaction_hash or f"DEP-{deposit.id.hex[:12].upper()}"
            await transaction_service.create_transaction(
                db,
                user_id=deposit.user_id,
                type="deposit",
                amount=deposit.amount,
                currency=deposit.currency,
                status="completed",
                reference=tx_ref,
                description="Manual Cryptocurrency Deposit Credited",
            )

            # Dispatch notification
            await notification_service.create_notification(
                db,
                user_id=deposit.user_id,
                type="deposit",
                title="Deposit Verified",
                message=f"Your deposit of {deposit.amount} {deposit.currency} has been verified and credited.",
            )

        elif status_clean == "rejected":
            deposit.rejection_reason = rejection_reason.strip() if rejection_reason else "Invalid proof details."
            
            # Dispatch notification
            await notification_service.create_notification(
                db,
                user_id=deposit.user_id,
                type="deposit",
                title="Deposit Rejected",
                message=f"Your deposit request of {deposit.amount} {deposit.currency} was rejected. Reason: {deposit.rejection_reason}",
            )

        db.add(deposit)
        await db.commit()
        await db.refresh(deposit)
        return deposit

    # --- Withdrawal Processing ---

    @staticmethod
    async def process_user_withdrawal(
        db: AsyncSession,
        withdrawal_id: uuid.UUID,
        status_val: str,
        admin_id: uuid.UUID,
        rejection_reason: Optional[str] = None,
        transaction_hash: Optional[str] = None,
    ) -> WithdrawalRequest:
        """Complete or reject a user withdrawal request, updating frozen balances and logging transactions."""
        status_clean = status_val.lower().strip()
        if status_clean not in ["completed", "rejected"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status selection. Must be 'completed' or 'rejected'.",
            )

        # Retrieve request
        result = await db.execute(select(WithdrawalRequest).filter(WithdrawalRequest.id == withdrawal_id))
        withdrawal = result.scalars().first()
        if withdrawal is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Withdrawal request not found.",
            )

        if withdrawal.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Withdrawal request is already processed and marked as '{withdrawal.status}'.",
            )

        # Retrieve user wallet
        wallet_result = await db.execute(
            select(Wallet).filter(Wallet.user_id == withdrawal.user_id, Wallet.currency == withdrawal.currency)
        )
        wallet = wallet_result.scalars().first()
        if wallet is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User wallet for this withdrawal currency was not found.",
            )

        withdrawal.processed_by = admin_id
        withdrawal.processed_at = datetime.utcnow()
        withdrawal.status = status_clean

        if status_clean == "completed":
            if not transaction_hash:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Blockchain transaction hash (TXID) is required to complete withdrawals.",
                )
            
            withdrawal.transaction_hash = transaction_hash.strip()
            
            # Deduct from frozen balance
            wallet.frozen_balance -= withdrawal.amount
            wallet.total_withdrawn += withdrawal.amount
            db.add(wallet)

            # Record transaction
            await transaction_service.create_transaction(
                db,
                user_id=withdrawal.user_id,
                type="withdrawal",
                amount=withdrawal.amount,
                currency=withdrawal.currency,
                status="completed",
                reference=withdrawal.transaction_hash,
                description="Manual Cryptocurrency Withdrawal Executed",
            )

            # Notify user
            await notification_service.create_notification(
                db,
                user_id=withdrawal.user_id,
                type="withdrawal",
                title="Withdrawal Completed",
                message=f"Your withdrawal of {withdrawal.amount} {withdrawal.currency} has been processed. TXID: {withdrawal.transaction_hash}",
            )

        elif status_clean == "rejected":
            reason = rejection_reason.strip() if rejection_reason else "Cancelled by Administrator."
            withdrawal.rejection_reason = reason

            # Refund the frozen balance
            wallet.frozen_balance -= withdrawal.amount
            wallet.balance += withdrawal.amount
            db.add(wallet)

            # Record failed transaction log
            ref_tx = f"WDR-REJ-{withdrawal.id.hex[:12].upper()}"
            await transaction_service.create_transaction(
                db,
                user_id=withdrawal.user_id,
                type="withdrawal",
                amount=withdrawal.amount,
                currency=withdrawal.currency,
                status="failed",
                reference=ref_tx,
                description=f"Withdrawal Rejected. Refunded balance. Reason: {reason}",
            )

            # Notify user
            await notification_service.create_notification(
                db,
                user_id=withdrawal.user_id,
                type="withdrawal",
                title="Withdrawal Rejected",
                message=f"Your withdrawal request of {withdrawal.amount} {withdrawal.currency} was rejected. Reason: {reason}",
            )

        db.add(withdrawal)
        await db.commit()
        await db.refresh(withdrawal)
        return withdrawal

    # --- KYC Management ---

    @staticmethod
    async def update_user_kyc(
        db: AsyncSession,
        user_id: uuid.UUID,
        kyc_status: str,
        admin_id: uuid.UUID,
        rejection_reason: Optional[str] = None,
    ) -> User:
        """Approve or reject a user's KYC documentation submission."""
        status_clean = kyc_status.lower().strip()
        if status_clean not in ["verified", "rejected"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status selection. Must be 'verified' or 'rejected'.",
            )

        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        user.kyc_status = status_clean
        if status_clean == "verified":
            user.kyc_verified_at = datetime.utcnow()
            await notification_service.create_notification(
                db,
                user_id=user.id,
                type="system",
                title="KYC Approved",
                message="Congratulations! Your identity verification (KYC) request has been approved.",
            )
        elif status_clean == "rejected":
            user.kyc_verified_at = None
            reason = rejection_reason.strip() if rejection_reason else "Documents submitted are unreadable/expired."
            # We keep the rejection details or save them in user metadata/notes if needed. Here we notify:
            await notification_service.create_notification(
                db,
                user_id=user.id,
                type="system",
                title="KYC Rejected",
                message=f"Your identity verification (KYC) request was rejected. Reason: {reason}",
            )

        db.add(user)

        # Log audit trail
        audit = AuditLog(
            user_id=user.id,
            admin_id=admin_id,
            action="kyc_status_updated",
            entity_type="user",
            entity_id=user.id,
            new_values={"kyc_status": status_clean, "rejection_reason": rejection_reason},
        )
        db.add(audit)

        await db.commit()
        await db.refresh(user)
        return user

    # --- User Account Management ---

    @staticmethod
    async def suspend_user(
        db: AsyncSession,
        user_id: uuid.UUID,
        is_suspended: bool,
        admin_id: uuid.UUID,
        suspension_reason: Optional[str] = None,
    ) -> User:
        """Suspend or activate a user account, terminating all active logins immediately upon suspension."""
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        user.is_suspended = is_suspended
        if is_suspended:
            user.suspension_reason = suspension_reason.strip() if suspension_reason else "Violations of platform terms."
            user.suspended_at = datetime.utcnow()
            
            # Log out the user immediately by revoking all sessions
            sessions_result = await db.execute(
                select(SessionToken).filter(SessionToken.user_id == user.id, SessionToken.revoked == False)
            )
            for s in sessions_result.scalars().all():
                s.revoked = True
                s.revoked_at = datetime.utcnow()
                db.add(s)
        else:
            user.suspension_reason = None
            user.suspended_at = None

        db.add(user)

        # Log audit trail
        audit = AuditLog(
            user_id=user.id,
            admin_id=admin_id,
            action="user_suspension_toggled",
            entity_type="user",
            entity_id=user.id,
            new_values={"is_suspended": is_suspended, "suspension_reason": user.suspension_reason},
        )
        db.add(audit)

        await db.commit()
        await db.refresh(user)
        return user

    # --- Balance Adjustment ---

    @staticmethod
    async def manual_adjust_balance(
        db: AsyncSession,
        user_id: uuid.UUID,
        currency: str,
        amount: Decimal,
        adjustment_type: str,
        admin_id: uuid.UUID,
        description: Optional[str] = None,
    ) -> Wallet:
        """Manually credit or debit a user's wallet balance, logging details to transaction histories."""
        currency = currency.upper().strip()
        adj_type = adjustment_type.lower().strip()
        
        if adj_type not in ["credit", "debit"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Adjustment type must be 'credit' (add funds) or 'debit' (remove funds).",
            )

        # Retrieve user wallet
        wallet_result = await db.execute(
            select(Wallet).filter(Wallet.user_id == user_id, Wallet.currency == currency)
        )
        wallet = wallet_result.scalars().first()
        if wallet is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User wallet for {currency} not found.",
            )

        old_balance = wallet.balance

        if adj_type == "credit":
            wallet.balance += amount
            desc = description or f"System balance credit by administrator."
            
            # Log transaction
            await transaction_service.create_transaction(
                db,
                user_id=user_id,
                type="adjustment",
                amount=amount,
                currency=currency,
                status="completed",
                description=desc,
            )
            
            # Notify user
            await notification_service.create_notification(
                db,
                user_id=user_id,
                type="system",
                title="Balance Adjustment",
                message=f"Your wallet has been credited with {amount} {currency} by system admin.",
            )

        elif adj_type == "debit":
            if wallet.balance < amount:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Inadequate funds for debit. Current balance is {wallet.balance} {currency}.",
                )
            wallet.balance -= amount
            desc = description or f"System balance debit by administrator."

            # Log transaction
            await transaction_service.create_transaction(
                db,
                user_id=user_id,
                type="adjustment",
                amount=-amount,  # negative to indicate subtraction
                currency=currency,
                status="completed",
                description=desc,
            )

            # Notify user
            await notification_service.create_notification(
                db,
                user_id=user_id,
                type="system",
                title="Balance Adjustment",
                message=f"Your wallet has been debited by {amount} {currency} by system admin.",
            )

        db.add(wallet)

        # Log audit trail
        audit = AuditLog(
            user_id=user_id,
            admin_id=admin_id,
            action="manual_balance_adjustment",
            entity_type="wallet",
            entity_id=wallet.id,
            old_values={"balance": float(old_balance)},
            new_values={"balance": float(wallet.balance), "type": adj_type, "amount": float(amount)},
        )
        db.add(audit)

        await db.commit()
        await db.refresh(wallet)
        return wallet


admin_service = AdminService()
