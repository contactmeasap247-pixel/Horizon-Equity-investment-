import pytest
import uuid
from decimal import Decimal
from datetime import datetime, timedelta
from pydantic import ValidationError

from app.schemas.investment import InvestmentPlanCreate, InvestmentPlanUpdate
from app.schemas.loan import LoanApplicationCreate
from app.schemas.admin import BalanceAdjustmentRequest
from app.models.user import User
from app.models.wallet import Wallet
from app.models.investment_plan import InvestmentPlan
from app.models.investment import Investment
from app.models.notification import Notification
from app.models.transaction import Transaction
from app.models.audit_log import AuditLog
from app.services.admin_service import admin_service
from app.services.investment_service import investment_service
from sqlalchemy.future import select


# ========================================================
# 1. TEST INVESTOR-FACING WALLET CREDIT & DEBIT NOTIFICATIONS
# ========================================================

@pytest.mark.asyncio
async def test_wallet_credit_notification_without_note(test_db):
    """Credit without note must produce clean title and message without admin attribution."""
    user = User(
        id=uuid.uuid4(),
        email="investor_credit1@example.com",
        password_hash="hashed_pw",
        full_name="Alice Investor",
        referral_code="REF-ALICE1",
        is_active=True,
    )
    admin_id = uuid.uuid4()
    test_db.add(user)
    await test_db.commit()

    wallet = await admin_service.manual_adjust_balance(
        db=test_db,
        user_id=user.id,
        currency="USDT",
        amount=Decimal("150.00"),
        adjustment_type="credit",
        admin_id=admin_id,
        description=None,
        note=None,
    )
    assert wallet.balance == Decimal("150.00")

    # Check Notification
    notif_res = await test_db.execute(select(Notification).filter(Notification.user_id == user.id))
    notif = notif_res.scalars().first()
    assert notif is not None
    assert notif.title == "Wallet Credited"
    assert notif.message == "Your wallet has been credited with 150.00 USDT."
    assert "admin" not in notif.message.lower()
    assert "admin" not in notif.title.lower()

    # Check Transaction
    tx_res = await test_db.execute(select(Transaction).filter(Transaction.user_id == user.id))
    tx = tx_res.scalars().first()
    assert tx is not None
    assert tx.type == "adjustment"
    assert tx.amount == Decimal("150.00")
    assert tx.currency == "USDT"
    assert tx.description == "Wallet Credited"
    assert "admin" not in tx.description.lower()
    # Initiating admin identity preserved in approved_by
    assert tx.approved_by == admin_id

    # Check AuditLog
    audit_res = await test_db.execute(select(AuditLog).filter(AuditLog.user_id == user.id))
    audit = audit_res.scalars().first()
    assert audit is not None
    assert audit.admin_id == admin_id
    assert audit.action == "manual_balance_adjustment"


@pytest.mark.asyncio
async def test_wallet_credit_notification_with_note(test_db):
    """Credit with note must append Note: {note} to message."""
    user = User(
        id=uuid.uuid4(),
        email="investor_credit2@example.com",
        password_hash="hashed_pw",
        full_name="Bob Investor",
        referral_code="REF-BOB2",
        is_active=True,
    )
    admin_id = uuid.uuid4()
    test_db.add(user)
    await test_db.commit()

    note_text = "Q3 Liquidity Incentive Bonus"
    wallet = await admin_service.manual_adjust_balance(
        db=test_db,
        user_id=user.id,
        currency="USDT",
        amount=Decimal("500.00"),
        adjustment_type="credit",
        admin_id=admin_id,
        description=note_text,
        note=note_text,
    )
    assert wallet.balance == Decimal("500.00")

    notif_res = await test_db.execute(select(Notification).filter(Notification.user_id == user.id))
    notif = notif_res.scalars().first()
    assert notif is not None
    assert notif.title == "Wallet Credited"
    expected_msg = f"Your wallet has been credited with 500.00 USDT.\n\nNote: {note_text}"
    assert notif.message == expected_msg

    tx_res = await test_db.execute(select(Transaction).filter(Transaction.user_id == user.id))
    tx = tx_res.scalars().first()
    assert tx.description == note_text
    assert tx.approved_by == admin_id


@pytest.mark.asyncio
async def test_wallet_debit_notification_without_and_with_note(test_db):
    """Debit without and with note must produce exact titles and messages."""
    user = User(
        id=uuid.uuid4(),
        email="investor_debit@example.com",
        password_hash="hashed_pw",
        full_name="Charlie Investor",
        referral_code="REF-CHARLIE",
        is_active=True,
    )
    admin_id = uuid.uuid4()
    test_db.add(user)
    await test_db.flush()

    # Pre-fund wallet
    wallet = Wallet(user_id=user.id, currency="USDT", balance=Decimal("1000.00"), frozen_balance=Decimal("0.0"))
    test_db.add(wallet)
    await test_db.commit()

    # 1. Debit without note
    await admin_service.manual_adjust_balance(
        db=test_db,
        user_id=user.id,
        currency="USDT",
        amount=Decimal("200.00"),
        adjustment_type="debit",
        admin_id=admin_id,
        description=None,
        note=None,
    )

    notif_res = await test_db.execute(
        select(Notification).filter(Notification.user_id == user.id).order_by(Notification.created_at.asc())
    )
    notif1 = notif_res.scalars().first()
    assert notif1 is not None
    assert notif1.title == "Wallet Debited"
    assert notif1.message == "Your wallet has been debited with 200.00 USDT."
    assert "admin" not in notif1.message.lower()

    # 2. Debit with note
    note_text = "Portfolio settlement reconciliation"
    await admin_service.manual_adjust_balance(
        db=test_db,
        user_id=user.id,
        currency="USDT",
        amount=Decimal("100.00"),
        adjustment_type="debit",
        admin_id=admin_id,
        description=note_text,
        note=note_text,
    )

    notif_res2 = await test_db.execute(
        select(Notification).filter(Notification.user_id == user.id).order_by(Notification.created_at.desc())
    )
    notif2 = notif_res2.scalars().first()
    assert notif2.title == "Wallet Debited"
    assert notif2.message == f"Your wallet has been debited with 100.00 USDT.\n\nNote: {note_text}"


# ========================================================
# 2. TEST DURATION CONFIGURATION AND STRICT 14-DAY MAXIMUM
# ========================================================

def test_investment_plan_create_valid_durations():
    """Durations <= 14 days (or <= 2 weeks) must validate successfully."""
    # 7 days
    p1 = InvestmentPlanCreate(
        name="7-Day Tier",
        min_amount=Decimal("100"),
        return_percentage=Decimal("15"),
        duration_days=7,
    )
    assert p1.duration_days == 7

    # 14 days (absolute maximum)
    p2 = InvestmentPlanCreate(
        name="14-Day Tier",
        min_amount=Decimal("100"),
        return_percentage=Decimal("25"),
        duration_days=14,
    )
    assert p2.duration_days == 14

    # 1 week -> 7 days
    p3 = InvestmentPlanCreate(
        name="1-Week Tier",
        min_amount=Decimal("100"),
        return_percentage=Decimal("15"),
        duration_days=7,
        duration_unit="weeks",
        duration_value=1,
    )
    assert p3.duration_days == 7

    # 2 weeks -> 14 days
    p4 = InvestmentPlanCreate(
        name="2-Week Tier",
        min_amount=Decimal("100"),
        return_percentage=Decimal("30"),
        duration_days=14,
        duration_unit="weeks",
        duration_value=2,
    )
    assert p4.duration_days == 14


def test_investment_plan_create_rejects_over_14_days():
    """Durations > 14 days (or > 2 weeks) must be rejected by validator."""
    # 15 days
    with pytest.raises(ValidationError) as exc:
        InvestmentPlanCreate(
            name="15-Day Tier",
            min_amount=Decimal("100"),
            return_percentage=Decimal("20"),
            duration_days=15,
        )
    assert "cannot exceed 14 days" in str(exc.value)

    # 3 weeks (21 days)
    with pytest.raises(ValidationError) as exc:
        InvestmentPlanCreate(
            name="3-Week Tier",
            min_amount=Decimal("100"),
            return_percentage=Decimal("20"),
            duration_days=21,
            duration_unit="weeks",
            duration_value=3,
        )
    assert "cannot exceed 14 days" in str(exc.value)

    # 30 days
    with pytest.raises(ValidationError) as exc:
        InvestmentPlanCreate(
            name="30-Day Tier",
            min_amount=Decimal("100"),
            return_percentage=Decimal("20"),
            duration_days=30,
        )
    assert "cannot exceed 14 days" in str(exc.value)

    # 0 days (must be >= 1)
    with pytest.raises(ValidationError):
        InvestmentPlanCreate(
            name="0-Day Tier",
            min_amount=Decimal("100"),
            return_percentage=Decimal("20"),
            duration_days=0,
        )


def test_investment_plan_update_validation():
    """Update schema must enforce <= 14 days."""
    # Valid update
    u1 = InvestmentPlanUpdate(duration_days=14)
    assert u1.duration_days == 14

    u2 = InvestmentPlanUpdate(duration_unit="weeks", duration_value=2)
    assert u2.duration_days == 14

    # Invalid update > 14 days
    with pytest.raises(ValidationError) as exc:
        InvestmentPlanUpdate(duration_days=20)
    assert "cannot exceed 14 days" in str(exc.value)

    with pytest.raises(ValidationError) as exc:
        InvestmentPlanUpdate(duration_unit="weeks", duration_value=3)
    assert "cannot exceed 14 days" in str(exc.value)


def test_loan_duration_limit_validation():
    """Loan application must reject durations exceeding 14 days."""
    # Valid: 14 days
    l1 = LoanApplicationCreate(
        product_id=uuid.uuid4(),
        amount=Decimal("500"),
        duration_days=14,
        terms_accepted=True,
    )
    assert l1.duration_days == 14

    # Invalid: 21 days
    with pytest.raises(ValidationError) as exc:
        LoanApplicationCreate(
            product_id=uuid.uuid4(),
            amount=Decimal("500"),
            duration_days=21,
            terms_accepted=True,
        )
    assert "cannot exceed 14 days" in str(exc.value)


@pytest.mark.asyncio
async def test_existing_contracts_terms_preserved(test_db):
    """Historical contracts and maturity dates must not be altered when plans are synced or updated."""
    # Create plan with 7 days
    plan = InvestmentPlan(
        id=uuid.uuid4(),
        name="Historical Plan",
        min_amount=Decimal("100"),
        return_percentage=Decimal("20"),
        duration_days=7,
        is_active=True,
    )
    user = User(
        id=uuid.uuid4(),
        email="historical_user@example.com",
        password_hash="hashed_pw",
        full_name="Historical Investor",
        referral_code="REF-HIST1",
        is_active=True,
    )
    test_db.add_all([plan, user])
    await test_db.flush()

    # Existing investment created 3 days ago with exact maturity date 7 days from start
    start_dt = datetime.utcnow() - timedelta(days=3)
    maturity_dt = start_dt + timedelta(days=7)
    inv = Investment(
        id=uuid.uuid4(),
        user_id=user.id,
        plan_id=plan.id,
        amount=Decimal("500.00"),
        currency="USDT",
        expected_return=Decimal("600.00"),
        status="active",
        start_date=start_dt,
        maturity_date=maturity_dt,
    )
    test_db.add(inv)
    await test_db.commit()

    # Now update plan duration to 14 days
    updated_plan = await investment_service.update_investment_plan(
        test_db, plan.id, InvestmentPlanUpdate(duration_days=14)
    )
    assert updated_plan.duration_days == 14

    # Verify existing investment contract is strictly preserved
    inv_check = await investment_service.get_investment_by_id(test_db, inv.id)
    assert inv_check.start_date == start_dt
    assert inv_check.maturity_date == maturity_dt
    assert inv_check.amount == Decimal("500.00")
    assert inv_check.status == "active"
