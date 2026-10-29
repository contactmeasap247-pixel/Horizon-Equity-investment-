# ============================================
# HORIZON EQUITY - INVESTMENT SERVICE
# ============================================

import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.user import User
from app.models.wallet import Wallet
from app.models.investment_plan import InvestmentPlan
from app.models.investment import Investment
from app.models.transaction import Transaction
from app.models.referral_commission import ReferralCommission
from app.schemas.investment import InvestmentPlanCreate, InvestmentPlanUpdate, InvestmentCreate
from app.services.wallet_service import wallet_service


class InvestmentService:
    """Business logic for managing investment tiers and executing user investment plans."""

    # --- Investment Plan Tier CRUD (Admin) ---

    @staticmethod
    async def get_active_investment_plans(db: AsyncSession) -> List[InvestmentPlan]:
        """Fetch all active investment plans visible to users, sorted by sort_order."""
        result = await db.execute(
            select(InvestmentPlan)
            .filter(InvestmentPlan.is_active == True)
            .order_by(InvestmentPlan.sort_order.asc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_all_investment_plans(db: AsyncSession) -> List[InvestmentPlan]:
        """Fetch all investment plans (active and inactive) for admin CRUD."""
        result = await db.execute(
            select(InvestmentPlan).order_by(InvestmentPlan.sort_order.asc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_investment_plan_by_id(db: AsyncSession, plan_id: uuid.UUID) -> Optional[InvestmentPlan]:
        """Fetch an investment plan by ID."""
        result = await db.execute(select(InvestmentPlan).filter(InvestmentPlan.id == plan_id))
        return result.scalars().first()

    async def create_investment_plan(self, db: AsyncSession, plan_in: InvestmentPlanCreate) -> InvestmentPlan:
        """Create a new investment plan tier."""
        new_plan = InvestmentPlan(
            name=plan_in.name,
            description=plan_in.description,
            min_amount=plan_in.min_amount,
            max_amount=plan_in.max_amount,
            return_percentage=plan_in.return_percentage,
            duration_days=plan_in.duration_days,
            referral_bonus_percentage=plan_in.referral_bonus_percentage,
            is_active=plan_in.is_active,
            is_featured=plan_in.is_featured,
            sort_order=plan_in.sort_order,
        )
        db.add(new_plan)
        await db.commit()
        await db.refresh(new_plan)
        return new_plan

    async def update_investment_plan(
        self, db: AsyncSession, plan_id: uuid.UUID, plan_in: InvestmentPlanUpdate
    ) -> Optional[InvestmentPlan]:
        """Update an existing investment plan tier."""
        plan = await self.get_investment_plan_by_id(db, plan_id)
        if plan is None:
            return None

        # Update fields if provided
        for field, value in plan_in.model_dump(exclude_unset=True).items():
            setattr(plan, field, value)

        db.add(plan)
        await db.commit()
        await db.refresh(plan)
        return plan

    @staticmethod
    async def delete_investment_plan(db: AsyncSession, plan_id: uuid.UUID) -> bool:
        """Delete an investment plan tier."""
        result = await db.execute(select(InvestmentPlan).filter(InvestmentPlan.id == plan_id))
        plan = result.scalars().first()
        if plan:
            await db.delete(plan)
            await db.commit()
            return True
        return False

    # --- User Investments ---

    @staticmethod
    async def get_investment_by_id(db: AsyncSession, investment_id: uuid.UUID) -> Optional[Investment]:
        """Fetch a specific investment by ID, loading its plan relationship."""
        result = await db.execute(
            select(Investment)
            .filter(Investment.id == investment_id)
            .options(selectinload(Investment.plan))
        )
        return result.scalars().first()

    @staticmethod
    async def get_user_investments(
        db: AsyncSession, user_id: uuid.UUID, status_filter: Optional[str] = None
    ) -> List[Investment]:
        """Fetch all investments of a specific user with loaded plans, ordered by start date."""
        query = select(Investment).filter(Investment.user_id == user_id).options(selectinload(Investment.plan))
        if status_filter:
            query = query.filter(Investment.status == status_filter.lower())
        result = await db.execute(query.order_by(Investment.start_date.desc()))
        return list(result.scalars().all())

    async def create_investment(
        self, db: AsyncSession, user_id: uuid.UUID, invest_in: InvestmentCreate
    ) -> Investment:
        """Purchase an investment plan tier, validating funds and creating transaction/referral commissions."""
        currency = invest_in.currency.upper()
        amount = invest_in.amount

        # 1. Fetch and validate investment plan
        plan = await self.get_investment_plan_by_id(db, invest_in.plan_id)
        if plan is None or not plan.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Investment plan is not available or inactive.",
            )

        # 2. Check plan min/max limits
        if amount < plan.min_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Investment amount is below the plan minimum of {plan.min_amount} USD.",
            )
        if plan.max_amount is not None and amount > plan.max_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Investment amount is above the plan maximum of {plan.max_amount} USD.",
            )

        # 3. Check user wallet balance
        wallet = await wallet_service.get_user_wallet_by_currency(db, user_id, currency)
        if wallet is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"You do not possess a wallet for {currency}.",
            )
        if wallet.balance < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Inadequate available balance. Your balance is {wallet.balance} {currency}.",
            )

        # 4. Deduct balance from wallet
        wallet.balance -= amount
        db.add(wallet)

        # 5. Create investment record
        # Expected return calculation: amount * (1 + return_percentage / 100)
        expected_return = amount * (Decimal("1.0") + (plan.return_percentage / Decimal("100.0")))
        start_date = datetime.utcnow()
        maturity_date = start_date + timedelta(days=plan.duration_days)

        new_investment = Investment(
            user_id=user_id,
            plan_id=plan.id,
            amount=amount,
            currency=currency,
            expected_return=expected_return,
            status="active",
            start_date=start_date,
            maturity_date=maturity_date,
            is_auto_renew=invest_in.is_auto_renew,
        )
        db.add(new_investment)
        # Flush to get the ID for relationships
        await db.flush()

        # 6. Record transaction history
        transaction = Transaction(
            user_id=user_id,
            type="investment",
            subtype="purchase",
            amount=amount,
            fee=Decimal("0.0"),
            currency=currency,
            status="completed",
            reference=f"INV-{new_investment.id.hex[:12].upper()}",
            description=f"Purchased {plan.name} Plan",
        )
        db.add(transaction)

        # 7. Referral Commission Processing
        user_result = await db.execute(select(User).filter(User.id == user_id))
        user = user_result.scalars().first()
        if user and user.referred_by:
            # Calculate referral bonus
            commission_amount = amount * (plan.referral_bonus_percentage / Decimal("100.0"))
            commission = ReferralCommission(
                referrer_id=user.referred_by,
                referred_user_id=user.id,
                investment_id=new_investment.id,
                commission_amount=commission_amount,
                currency=currency,
                level=1,
                status="pending",
            )
            db.add(commission)

        await db.commit()
        await db.refresh(new_investment)

        # Dispatch automated email via Brevo
        if user:
            from app.services.email_service import email_service
            email_service.send_investment_activated_email(
                user.email,
                user.full_name,
                plan.name,
                str(amount),
                currency,
                maturity_date.strftime("%Y-%m-%d"),
                str(expected_return),
            )
        
        # Reload investment with its plan
        reloaded_investment = await self.get_investment_by_id(db, new_investment.id)
        return reloaded_investment


investment_service = InvestmentService()
