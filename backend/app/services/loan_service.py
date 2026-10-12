# ============================================
# HORIZON EQUITY - LOAN SERVICE
# Investment-Backed Loan Application & Settlement Logic
# ============================================

import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, desc, func

from app.models.user import User
from app.models.wallet import Wallet
from app.models.investment import Investment
from app.models.loan import LoanProduct, LoanApplication, LoanRepayment
from app.models.transaction import Transaction
from app.models.audit_log import AuditLog
from app.services.notification_service import notification_service
from app.services.transaction_service import transaction_service


class LoanService:
    """Business logic for Investment-Backed Lending."""

    @staticmethod
    async def get_or_seed_products(db: AsyncSession) -> List[LoanProduct]:
        """Retrieve available loan products, seeding initial products if none exist."""
        result = await db.execute(select(LoanProduct).filter(LoanProduct.is_active == True))
        products = result.scalars().all()

        if not products:
            defaults = [
                LoanProduct(
                    name="Micro Capital Advance",
                    currency="USDT",
                    min_amount=Decimal("100.00"),
                    max_amount=Decimal("500.00"),
                    monthly_interest_rate=Decimal("2.00"),
                    duration_months=3,
                    repayment_frequency="monthly",
                    description="Short-term liquidity backed by qualifying starter tier investments. 2% monthly simple interest.",
                    is_active=True,
                ),
                LoanProduct(
                    name="Growth Liquidity Tier",
                    currency="USDT",
                    min_amount=Decimal("500.00"),
                    max_amount=Decimal("2500.00"),
                    monthly_interest_rate=Decimal("2.00"),
                    duration_months=6,
                    repayment_frequency="monthly",
                    description="Mid-tier financing for active portfolio holders. 2% monthly simple interest.",
                    is_active=True,
                ),
                LoanProduct(
                    name="Institutional Portfolio Facility",
                    currency="USDT",
                    min_amount=Decimal("2500.00"),
                    max_amount=Decimal("10000.00"),
                    monthly_interest_rate=Decimal("1.75"),
                    duration_months=12,
                    repayment_frequency="monthly",
                    description="High-tier structured credit for established investors. 1.75% monthly simple interest.",
                    is_active=True,
                ),
            ]
            for p in defaults:
                db.add(p)
            await db.commit()
            return defaults

        return list(products)

    @staticmethod
    async def check_user_eligibility(db: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        """
        Evaluate loan eligibility:
        1. User must be active and not suspended.
        2. User must have at least one completed/matured qualifying investment.
        3. User must not have an existing active, overdue, or pending loan application.
        """
        user_res = await db.execute(select(User).filter(User.id == user_id))
        user = user_res.scalars().first()
        if not user or not user.is_active or user.is_suspended:
            return {
                "is_eligible": False,
                "reason": "Account is not in good standing.",
                "qualifying_investments_count": 0,
                "active_loan": None,
            }

        # Check existing active or pending loans
        existing_loan_res = await db.execute(
            select(LoanApplication).filter(
                LoanApplication.user_id == user_id,
                LoanApplication.status.in_(["submitted", "under_review", "approved", "active", "repayment_due", "overdue"]),
            )
        )
        existing_loan = existing_loan_res.scalars().first()
        if existing_loan:
            return {
                "is_eligible": False,
                "reason": f"You currently have an active or pending loan application ({existing_loan.reference}). Only one active loan is permitted at a time.",
                "qualifying_investments_count": 0,
                "active_loan": {
                    "id": str(existing_loan.id),
                    "reference": existing_loan.reference,
                    "status": existing_loan.status,
                    "outstanding_balance": float(existing_loan.outstanding_balance),
                },
            }

        # Check qualifying completed/matured investments
        inv_res = await db.execute(
            select(Investment).filter(
                Investment.user_id == user_id,
                Investment.status.in_(["matured", "completed"]),
            )
        )
        qualifying = inv_res.scalars().all()

        if not qualifying:
            return {
                "is_eligible": False,
                "reason": "You must successfully complete at least one qualifying investment (e.g. Silver Plan) before you can apply for an investment-backed loan.",
                "qualifying_investments_count": 0,
                "active_loan": None,
            }

        return {
            "is_eligible": True,
            "reason": f"Eligible. Verified {len(qualifying)} completed investment contract(s).",
            "qualifying_investments_count": len(qualifying),
            "active_loan": None,
        }

    @staticmethod
    async def apply_for_loan(
        db: AsyncSession,
        user_id: uuid.UUID,
        product_id: uuid.UUID,
        amount: Decimal,
        duration_months: int,
        terms_accepted: bool,
    ) -> LoanApplication:
        """Process and submit a loan application with precise simple-interest calculations."""
        if not terms_accepted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You must review and explicitly accept the loan agreement terms before applying.",
            )

        # Check eligibility
        eligibility = await LoanService.check_user_eligibility(db, user_id)
        if not eligibility["is_eligible"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=eligibility["reason"],
            )

        # Retrieve product
        prod_res = await db.execute(select(LoanProduct).filter(LoanProduct.id == product_id, LoanProduct.is_active == True))
        product = prod_res.scalars().first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan product not found or inactive.")

        if amount < product.min_amount or amount > product.max_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Amount must be between {product.min_amount} and {product.max_amount} {product.currency}.",
            )

        if duration_months < 1 or duration_months > product.duration_months:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Duration must be between 1 and {product.duration_months} months for this product.",
            )

        # Find most recent completed qualifying investment
        inv_res = await db.execute(
            select(Investment)
            .filter(Investment.user_id == user_id, Investment.status.in_(["matured", "completed"]))
            .order_by(Investment.end_date.desc())
        )
        qualifying_inv = inv_res.scalars().first()

        # Simple Interest Calculation:
        # Interest = Principal * (monthly_rate / 100) * duration_months
        rate_monthly = product.monthly_interest_rate
        total_interest = amount * (rate_monthly / Decimal("100.0")) * Decimal(str(duration_months))
        total_repayment = amount + total_interest
        monthly_installment = total_repayment / Decimal(str(duration_months))

        ref = f"LOAN-{uuid.uuid4().hex[:8].upper()}"

        new_loan = LoanApplication(
            reference=ref,
            user_id=user_id,
            product_id=product.id,
            qualifying_investment_id=qualifying_inv.id if qualifying_inv else None,
            principal_amount=amount,
            currency=product.currency,
            monthly_interest_rate=rate_monthly,
            duration_months=duration_months,
            total_interest=total_interest,
            total_repayment=total_repayment,
            monthly_installment=monthly_installment,
            outstanding_balance=total_repayment,
            total_repaid=Decimal("0.0"),
            status="submitted",
            terms_accepted=True,
            terms_accepted_at=datetime.utcnow(),
        )

        db.add(new_loan)

        # Audit log
        audit = AuditLog(
            user_id=user_id,
            action="loan_application_submitted",
            entity_type="loan_application",
            new_values={
                "reference": ref,
                "amount": float(amount),
                "total_repayment": float(total_repayment),
                "duration_months": duration_months,
            },
        )
        db.add(audit)

        # Notify user
        await notification_service.create_notification(
            db,
            user_id=user_id,
            type="system",
            title="Loan Application Received",
            message=f"Your loan application for {amount} {product.currency} ({ref}) has been submitted for administrative review.",
        )

        await db.commit()
        await db.refresh(new_loan)
        return new_loan

    @staticmethod
    async def get_user_loans(db: AsyncSession, user_id: uuid.UUID) -> List[Dict[str, Any]]:
        """Retrieve user's loan applications and active loans."""
        result = await db.execute(
            select(LoanApplication, LoanProduct)
            .join(LoanProduct, LoanApplication.product_id == LoanProduct.id)
            .filter(LoanApplication.user_id == user_id)
            .order_by(LoanApplication.created_at.desc())
        )
        loans_data = []
        for loan, prod in result.all():
            loans_data.append({
                "id": loan.id,
                "reference": loan.reference,
                "user_id": loan.user_id,
                "product_id": loan.product_id,
                "product_name": prod.name,
                "principal_amount": float(loan.principal_amount),
                "currency": loan.currency,
                "monthly_interest_rate": float(loan.monthly_interest_rate),
                "duration_months": loan.duration_months,
                "total_interest": float(loan.total_interest),
                "total_repayment": float(loan.total_repayment),
                "monthly_installment": float(loan.monthly_installment),
                "outstanding_balance": float(loan.outstanding_balance),
                "total_repaid": float(loan.total_repaid or 0.0),
                "status": loan.status,
                "decline_reason": loan.decline_reason,
                "terms_accepted": loan.terms_accepted,
                "terms_accepted_at": loan.terms_accepted_at,
                "disbursed_at": loan.disbursed_at,
                "due_date": loan.due_date,
                "created_at": loan.created_at,
            })
        return loans_data

    @staticmethod
    async def repay_loan(
        db: AsyncSession,
        user_id: uuid.UUID,
        loan_id: uuid.UUID,
        amount: Decimal,
    ) -> Dict[str, Any]:
        """Repay loan installment from user's available wallet balance."""
        loan_res = await db.execute(
            select(LoanApplication).filter(LoanApplication.id == loan_id, LoanApplication.user_id == user_id)
        )
        loan = loan_res.scalars().first()
        if not loan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan record not found.")

        if loan.status not in ["active", "repayment_due", "overdue"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Loan cannot be repaid in current status '{loan.status}'.",
            )

        if amount <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Repayment amount must be positive.")

        # Cap repayment at outstanding balance
        actual_repay_amt = min(amount, loan.outstanding_balance)

        # Check user wallet balance
        wallet_res = await db.execute(
            select(Wallet).filter(Wallet.user_id == user_id, Wallet.currency == loan.currency)
        )
        wallet = wallet_res.scalars().first()
        if not wallet or wallet.balance < actual_repay_amt:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Inadequate available {loan.currency} balance for repayment. Current balance: {wallet.balance if wallet else 0}.",
            )

        # Deduct wallet balance
        wallet.balance -= actual_repay_amt
        db.add(wallet)

        # Update loan balance
        loan.outstanding_balance -= actual_repay_amt
        loan.total_repaid += actual_repay_amt
        if loan.outstanding_balance <= Decimal("0.00"):
            loan.status = "fully_repaid"
        db.add(loan)

        # Log repayment record
        repay_ref = f"REPAY-{uuid.uuid4().hex[:8].upper()}"
        repayment = LoanRepayment(
            loan_id=loan.id,
            user_id=user_id,
            amount=actual_repay_amt,
            currency=loan.currency,
            principal_portion=actual_repay_amt,
            interest_portion=Decimal("0.0"),
            reference=repay_ref,
            status="completed",
        )
        db.add(repayment)

        # Log transaction
        await transaction_service.create_transaction(
            db,
            user_id=user_id,
            type="loan_repayment",
            amount=-actual_repay_amt,
            currency=loan.currency,
            status="completed",
            reference=repay_ref,
            description=f"Repayment for loan {loan.reference}",
        )

        # Send notification
        await notification_service.create_notification(
            db,
            user_id=user_id,
            type="system",
            title="Loan Repayment Processed",
            message=f"Repayment of {actual_repay_amt} {loan.currency} processed. Remaining balance: {loan.outstanding_balance} {loan.currency}.",
        )

        await db.commit()
        return {
            "status": "success",
            "repaid_amount": float(actual_repay_amt),
            "remaining_balance": float(loan.outstanding_balance),
            "loan_status": loan.status,
            "reference": repay_ref,
        }

    # ========================================================
    # ADMIN LOAN CAPABILITIES
    # ========================================================

    @staticmethod
    async def admin_list_loans(db: AsyncSession, status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """Admin query of all loan applications across the platform."""
        query = (
            select(LoanApplication, User, LoanProduct)
            .join(User, LoanApplication.user_id == User.id)
            .join(LoanProduct, LoanApplication.product_id == LoanProduct.id)
        )
        if status_filter:
            query = query.filter(LoanApplication.status == status_filter.lower().strip())

        result = await db.execute(query.order_by(LoanApplication.created_at.desc()))
        loans_list = []
        for loan, user, prod in result.all():
            loans_list.append({
                "id": str(loan.id),
                "reference": loan.reference,
                "user_id": str(user.id),
                "user_name": user.full_name,
                "user_email": user.email,
                "product_name": prod.name,
                "principal_amount": float(loan.principal_amount),
                "currency": loan.currency,
                "monthly_interest_rate": float(loan.monthly_interest_rate),
                "duration_months": loan.duration_months,
                "total_interest": float(loan.total_interest),
                "total_repayment": float(loan.total_repayment),
                "monthly_installment": float(loan.monthly_installment),
                "outstanding_balance": float(loan.outstanding_balance),
                "total_repaid": float(loan.total_repaid or 0.0),
                "status": loan.status,
                "decline_reason": loan.decline_reason,
                "disbursed_at": loan.disbursed_at.isoformat() if loan.disbursed_at else None,
                "created_at": loan.created_at.isoformat() if loan.created_at else None,
            })
        return loans_list

    @staticmethod
    async def admin_review_loan(
        db: AsyncSession,
        loan_id: uuid.UUID,
        new_status: str,
        admin_id: uuid.UUID,
        decline_reason: Optional[str] = None,
    ) -> LoanApplication:
        """Approve or decline a loan application with recorded reason."""
        result = await db.execute(select(LoanApplication).filter(LoanApplication.id == loan_id))
        loan = result.scalars().first()
        if not loan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan application not found.")

        clean_status = new_status.lower().strip()
        if clean_status not in ["approved", "declined", "requires_info"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid review decision.")

        loan.status = clean_status
        loan.reviewed_by = admin_id
        loan.reviewed_at = datetime.utcnow()
        if clean_status in ["declined", "requires_info"]:
            loan.decline_reason = decline_reason or "Application did not meet underwriting criteria."

        # Audit log
        audit = AuditLog(
            user_id=loan.user_id,
            admin_id=admin_id,
            action="loan_application_reviewed",
            entity_type="loan_application",
            entity_id=loan.id,
            new_values={"status": clean_status, "reason": loan.decline_reason},
        )
        db.add(audit)

        # Notify user
        msg = f"Your loan application ({loan.reference}) has been {clean_status}."
        if loan.decline_reason:
            msg += f" Note: {loan.decline_reason}"
        await notification_service.create_notification(
            db,
            user_id=loan.user_id,
            type="system",
            title=f"Loan Application {clean_status.capitalize()}",
            message=msg,
        )

        await db.commit()
        await db.refresh(loan)
        return loan

    @staticmethod
    async def admin_disburse_loan(db: AsyncSession, loan_id: uuid.UUID, admin_id: uuid.UUID) -> LoanApplication:
        """Disburse funds for an approved loan, crediting user's USDT wallet balance."""
        result = await db.execute(select(LoanApplication).filter(LoanApplication.id == loan_id))
        loan = result.scalars().first()
        if not loan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan application not found.")

        if loan.status != "approved":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only approved loans can be disbursed. Current status is '{loan.status}'.",
            )

        # Credit user's wallet
        wallet_res = await db.execute(
            select(Wallet).filter(Wallet.user_id == loan.user_id, Wallet.currency == loan.currency)
        )
        wallet = wallet_res.scalars().first()
        if not wallet:
            wallet = Wallet(user_id=loan.user_id, currency=loan.currency, balance=Decimal("0.0"))
            db.add(wallet)

        wallet.balance += loan.principal_amount
        db.add(wallet)

        # Activate loan
        now = datetime.utcnow()
        loan.status = "active"
        loan.disbursed_at = now
        loan.due_date = now + timedelta(days=loan.duration_months * 30)
        db.add(loan)

        # Log transaction
        tx_ref = f"DISB-{loan.id.hex[:8].upper()}"
        await transaction_service.create_transaction(
            db,
            user_id=loan.user_id,
            type="loan_disbursement",
            amount=loan.principal_amount,
            currency=loan.currency,
            status="completed",
            reference=tx_ref,
            description=f"Disbursement for approved loan {loan.reference}",
        )

        # Audit log
        audit = AuditLog(
            user_id=loan.user_id,
            admin_id=admin_id,
            action="loan_disbursed",
            entity_type="loan_application",
            entity_id=loan.id,
            new_values={"amount": float(loan.principal_amount), "currency": loan.currency},
        )
        db.add(audit)

        # Notify user
        await notification_service.create_notification(
            db,
            user_id=loan.user_id,
            type="system",
            title="Loan Disbursed",
            message=f"Your loan of {loan.principal_amount} {loan.currency} ({loan.reference}) has been disbursed to your wallet!",
        )

        await db.commit()
        await db.refresh(loan)
        return loan


loan_service = LoanService()
