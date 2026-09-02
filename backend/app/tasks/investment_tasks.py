# ============================================
# HORIZON EQUITY - INVESTMENT CONTRACT TASKS
# ============================================

import asyncio
from functools import wraps
from datetime import datetime, timedelta
from decimal import Decimal
from celery import shared_task
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import async_session
from app.models.investment import Investment
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.models.referral_commission import ReferralCommission
from app.models.user import User
from app.services.notification_service import notification_service

def async_task(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        return loop.run_until_complete(f(*args, **kwargs))
    return wrapper

@shared_task(name="app.tasks.investment_tasks.check_matured_investments")
@async_task
async def check_matured_investments():
    """Find all active investments past their maturity date, process return payouts, referral bonuses, and update status."""
    now = datetime.utcnow()
    async with async_session() as db:
        # Find all active investments that have matured
        query = (
            select(Investment)
            .filter(Investment.status == "active")
            .filter(Investment.maturity_date <= now)
            .options(selectinload(Investment.plan), selectinload(Investment.user))
        )
        result = await db.execute(query)
        matured_investments = result.scalars().all()
        
        if not matured_investments:
            return f"No matured investments found at {now}"

        processed_count = 0
        for inv in matured_investments:
            try:
                # 1. Update investment status
                inv.status = "matured"
                inv.actual_return = inv.expected_return
                inv.end_date = now
                db.add(inv)
                
                # 2. Credit user wallet
                user_wallet_query = (
                    select(Wallet)
                    .filter(Wallet.user_id == inv.user_id)
                    .filter(Wallet.currency == inv.currency)
                )
                wallet_res = await db.execute(user_wallet_query)
                wallet = wallet_res.scalars().first()
                if wallet:
                    wallet.balance += inv.expected_return
                    db.add(wallet)
                    
                # 3. Record return payout transaction
                payout_tx = Transaction(
                    user_id=inv.user_id,
                    type="return",
                    subtype="payout",
                    amount=inv.expected_return,
                    fee=Decimal("0.0"),
                    currency=inv.currency,
                    status="completed",
                    reference=f"RET-{inv.id.hex[:12].upper()}",
                    description=f"Payout return for {inv.plan.name} Plan maturity",
                )
                db.add(payout_tx)

                # 4. Notify user about maturity
                await notification_service.create_notification(
                    db,
                    user_id=inv.user_id,
                    type="investment_maturity",
                    title="Investment Matured! 🎉",
                    message=f"Your investment of {inv.amount} {inv.currency} in the {inv.plan.name} Tier has matured! A total return of {inv.expected_return} {inv.currency} was credited to your wallet.",
                )

                # 5. Process pending referral commissions
                commission_query = (
                    select(ReferralCommission)
                    .filter(ReferralCommission.investment_id == inv.id)
                    .filter(ReferralCommission.status == "pending")
                )
                comm_res = await db.execute(commission_query)
                commissions = comm_res.scalars().all()
                
                for comm in commissions:
                    # Credit referrer's wallet
                    ref_wallet_query = (
                        select(Wallet)
                        .filter(Wallet.user_id == comm.referrer_id)
                        .filter(Wallet.currency == comm.currency)
                    )
                    ref_wallet_res = await db.execute(ref_wallet_query)
                    ref_wallet = ref_wallet_res.scalars().first()
                    if ref_wallet:
                        ref_wallet.balance += comm.commission_amount
                        db.add(ref_wallet)
                        
                    # Update commission record
                    comm.status = "paid"
                    comm.paid_at = now
                    db.add(comm)
                    
                    # Record referral bonus transaction
                    ref_tx = Transaction(
                        user_id=comm.referrer_id,
                        type="referral_bonus",
                        subtype="commission",
                        amount=comm.commission_amount,
                        fee=Decimal("0.0"),
                        currency=comm.currency,
                        status="completed",
                        reference=f"REF-{comm.id.hex[:12].upper()}",
                        description=f"Referral commission from {inv.user.full_name}'s {inv.plan.name} investment maturity",
                    )
                    db.add(ref_tx)

                    # Notify referrer
                    await notification_service.create_notification(
                        db,
                        user_id=comm.referrer_id,
                        type="referral_commission",
                        title="Referral Commission Paid! 💸",
                        message=f"You received a referral bonus of {comm.commission_amount} {comm.currency} from {inv.user.full_name}'s matured investment.",
                    )

                # 6. Auto-renewal handling
                if inv.is_auto_renew:
                    if wallet and wallet.balance >= inv.amount:
                        wallet.balance -= inv.amount
                        db.add(wallet)
                        
                        new_maturity = now + timedelta(days=inv.plan.duration_days)
                        renewed_inv = Investment(
                            user_id=inv.user_id,
                            plan_id=inv.plan_id,
                            amount=inv.amount,
                            currency=inv.currency,
                            expected_return=inv.amount * (Decimal("1.0") + (inv.plan.return_percentage / Decimal("100.0"))),
                            status="active",
                            start_date=now,
                            maturity_date=new_maturity,
                            is_auto_renew=True,
                        )
                        db.add(renewed_inv)
                        await db.flush()
                        
                        renew_tx = Transaction(
                            user_id=inv.user_id,
                            type="investment",
                            subtype="purchase",
                            amount=inv.amount,
                            fee=Decimal("0.0"),
                            currency=inv.currency,
                            status="completed",
                            reference=f"INV-{renewed_inv.id.hex[:12].upper()}",
                            description=f"Auto-renewed {inv.plan.name} Plan",
                        )
                        db.add(renew_tx)

                        await notification_service.create_notification(
                            db,
                            user_id=inv.user_id,
                            type="investment_renewal",
                            title="Investment Auto-Renewed 🔄",
                            message=f"Your {inv.plan.name} Tier investment of {inv.amount} {inv.currency} was automatically renewed for another {inv.plan.duration_days} days.",
                        )
                
                processed_count += 1
            except Exception as e:
                print(f"Error processing maturity for investment {inv.id}: {e}")
                
        await db.commit()
        return f"Successfully processed {processed_count} matured investments"
