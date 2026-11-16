# ============================================
# HORIZON EQUITY - FINANCIAL ADMIN WORKFLOWS TEST SUITE
# Audit & Verification for Reference Generator, Silent Balance Adjustment,
# Silent Price Adjustment, and Configurable 14-Day Flat Loan Management
# ============================================

import pytest
import uuid
from decimal import Decimal
from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy.future import select

from app.models.user import User
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.models.audit_log import AuditLog
from app.models.investment_plan import InvestmentPlan
from app.models.investment import Investment
from app.models.notification import Notification
from app.models.loan import LoanProduct, LoanApplication
from app.models.withdrawal_request import WithdrawalRequest

from app.services.admin_service import admin_service
from app.services.investment_service import investment_service
from app.services.loan_service import loan_service
from app.schemas.investment import InvestmentPlanUpdate


@pytest.mark.asyncio
async def test_reference_generator_uniqueness_and_format():
    """Verify cryptographic transaction reference generator produces structured, unique references."""
    ref1 = admin_service.generate_transaction_reference(prefix="WDR")
    ref2 = admin_service.generate_transaction_reference(prefix="WDR")
    ref_adj = admin_service.generate_transaction_reference(prefix="ADJ-SILENT")

    assert ref1.startswith("HE-WDR-")
    assert ref2.startswith("HE-WDR-")
    assert ref_adj.startswith("HE-ADJ-SILENT-")
    assert ref1 != ref2
    assert len(ref1) >= 15


@pytest.mark.asyncio
async def test_standard_vs_silent_balance_adjustment(test_db):
    """
    Test standard balance adjustment notifies investor,
    while silent balance adjustment completely suppresses notifications and mandates internal audit reason.
    """
    # Create test user and admin
    admin = User(
        id=uuid.uuid4(),
        email="compliance_admin@horizonequity.com",
        password_hash="hash",
        full_name="Compliance Admin",
        referral_code="REF-ADMIN1",
        is_admin=True,
        is_active=True,
    )
    user = User(
        id=uuid.uuid4(),
        email="investor_test@gmail.com",
        password_hash="hash",
        full_name="Alice Investor",
        referral_code="REF-ALICE1",
        is_active=True,
    )
    test_db.add_all([admin, user])
    await test_db.commit()

    # 1. Standard Credit: Should generate in-app notification
    wallet_standard = await admin_service.manual_adjust_balance(
        test_db,
        user_id=user.id,
        currency="USDT",
        amount=Decimal("500.00"),
        adjustment_type="credit",
        admin_id=admin.id,
        description="Performance incentive credit",
        is_silent=False,
    )
    assert wallet_standard.balance == Decimal("500.00")

    # Verify notification created
    notifs_res = await test_db.execute(select(Notification).filter(Notification.user_id == user.id))
    notifs = notifs_res.scalars().all()
    assert len(notifs) == 1
    assert "credited with 500.00 USDT" in notifs[0].message

    # 2. Silent Adjustment missing internal reason: Must raise HTTP 400
    with pytest.raises(HTTPException) as exc_info:
        await admin_service.manual_adjust_balance(
            test_db,
            user_id=user.id,
            currency="USDT",
            amount=Decimal("100.00"),
            adjustment_type="credit",
            admin_id=admin.id,
            is_silent=True,
            internal_reason="",  # empty
        )
    assert exc_info.value.status_code == 400

    # 3. Silent Credit with valid reason: Balance credited, but NO notification sent
    custom_ref = admin_service.generate_transaction_reference(prefix="ADJ-SILENT")
    wallet_silent = await admin_service.manual_adjust_balance(
        test_db,
        user_id=user.id,
        currency="USDT",
        amount=Decimal("250.00"),
        adjustment_type="credit",
        admin_id=admin.id,
        is_silent=True,
        internal_reason="Custodial ledger alignment for discrepancy ticket #8841",
        reference=custom_ref,
    )
    assert wallet_silent.balance == Decimal("750.00")

    # Notification count must NOT have increased!
    notifs_res2 = await test_db.execute(select(Notification).filter(Notification.user_id == user.id))
    notifs2 = notifs_res2.scalars().all()
    assert len(notifs2) == 1  # Still 1, no notification added

    # Verify AuditLog recorded with action='silent_balance_adjustment'
    audit_res = await test_db.execute(
        select(AuditLog).filter(
            AuditLog.user_id == user.id,
            AuditLog.action == "silent_balance_adjustment"
        )
    )
    audit = audit_res.scalars().first()
    assert audit is not None
    assert audit.new_values["is_silent"] is True
    assert audit.new_values["internal_reason"] == "Custodial ledger alignment for discrepancy ticket #8841"
    assert audit.new_values["reference"] == custom_ref

    # Verify Transaction created with subtype='silent_adjustment' and reference
    tx_res = await test_db.execute(
        select(Transaction).filter(
            Transaction.user_id == user.id,
            Transaction.reference == custom_ref
        )
    )
    tx = tx_res.scalars().first()
    assert tx is not None
    assert tx.subtype == "silent_adjustment"
    assert tx.amount == Decimal("250.00")


@pytest.mark.asyncio
async def test_withdrawal_dispatch_with_reference_and_txid(test_db):
    """Verify withdrawal completion preserves both blockchain TXID and platform internal reference."""
    admin = User(
        id=uuid.uuid4(),
        email="wdr_admin@horizonequity.com",
        password_hash="hash",
        full_name="Withdrawal Dispatcher",
        referral_code="REF-WDRADM",
        is_admin=True,
        is_active=True,
    )
    user = User(
        id=uuid.uuid4(),
        email="bob_withdraw@gmail.com",
        password_hash="hash",
        full_name="Bob Withdraw",
        referral_code="REF-BOB1",
        is_active=True,
    )
    wallet = Wallet(
        user_id=user.id,
        currency="USDT",
        balance=Decimal("1000.00"),
        frozen_balance=Decimal("200.00"),
    )
    withdrawal = WithdrawalRequest(
        id=uuid.uuid4(),
        user_id=user.id,
        amount=Decimal("200.00"),
        currency="USDT",
        wallet_address="0x1234567890abcdef1234567890abcdef12345678",
        wallet_type="crypto",
        status="pending",
    )
    test_db.add_all([admin, user, wallet, withdrawal])
    await test_db.commit()

    genuine_txid = "0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a109876543210abcdef1234567890"
    internal_ref = admin_service.generate_transaction_reference(prefix="WDR")

    completed_wdr = await admin_service.process_user_withdrawal(
        test_db,
        withdrawal_id=withdrawal.id,
        status_val="completed",
        admin_id=admin.id,
        transaction_hash=genuine_txid,
        reference=internal_ref,
    )

    assert completed_wdr.status == "completed"
    assert completed_wdr.transaction_hash == genuine_txid
    assert wallet.frozen_balance == Decimal("0.00")

    # Check transaction ledger entry
    tx_res = await test_db.execute(
        select(Transaction).filter(Transaction.user_id == user.id, Transaction.reference == internal_ref)
    )
    tx = tx_res.scalars().first()
    assert tx is not None
    assert tx.type == "withdrawal"
    assert tx.amount == Decimal("200.00")
    assert genuine_txid in tx.description


@pytest.mark.asyncio
async def test_silent_price_adjustment_vs_broadcast(test_db):
    """Verify updating investment plans silently writes to audit log without broadcasting notifications."""
    plan = InvestmentPlan(
        id=uuid.uuid4(),
        name="Silver Yield Tier",
        min_amount=Decimal("100.00"),
        max_amount=Decimal("1000.00"),
        return_percentage=Decimal("12.00"),
        duration_days=7,
        is_active=True,
    )
    test_db.add(plan)
    await test_db.commit()

    # 1. Silent Price Adjustment (broadcast_announcement=False)
    updated_plan = await investment_service.update_investment_plan(
        test_db,
        plan_id=plan.id,
        plan_in=InvestmentPlanUpdate(
            return_percentage=Decimal("14.00"),
            broadcast_announcement=False,
        )
    )
    assert updated_plan.return_percentage == Decimal("14.00")

    # Check audit log for silent_price_adjustment
    audit_res = await test_db.execute(
        select(AuditLog).filter(
            AuditLog.entity_id == plan.id,
            AuditLog.action == "silent_price_adjustment"
        )
    )
    audit = audit_res.scalars().first()
    assert audit is not None
    assert audit.new_values["return_percentage"] == 14.0


@pytest.mark.asyncio
async def test_loan_facility_flat_rate_and_14_day_validation(test_db):
    """
    Verify:
    1. Loan durations > 14 days are strictly rejected with HTTP 400.
    2. Loan calculation uses flat rate (e.g. 15% on $1,000 = $150 interest, total repayment $1,150).
    3. Admin can configure loan products with <= 14 days duration.
    """
    user = User(
        id=uuid.uuid4(),
        email="loan_borrower@gmail.com",
        password_hash="hash",
        full_name="Loan Borrower",
        referral_code="REF-BORROW1",
        is_active=True,
    )
    # User must have completed qualifying investment to be eligible
    plan = InvestmentPlan(
        id=uuid.uuid4(),
        name="Silver Plan",
        min_amount=Decimal("100"),
        return_percentage=Decimal("10"),
        duration_days=7,
    )
    inv = Investment(
        id=uuid.uuid4(),
        user_id=user.id,
        plan_id=plan.id,
        amount=Decimal("500.00"),
        currency="USDT",
        expected_return=Decimal("550.00"),
        start_date=datetime.utcnow() - timedelta(days=10),
        end_date=datetime.utcnow() - timedelta(days=3),
        maturity_date=datetime.utcnow() - timedelta(days=3),
        status="completed",
    )
    test_db.add_all([user, plan, inv])
    await test_db.commit()

    # Admin creates loan product with 15% flat interest and 14 days duration
    admin_id = uuid.uuid4()
    product = await loan_service.admin_create_product(
        test_db,
        name="Platinum Liquidity Advance",
        currency="USDT",
        min_amount=Decimal("500.00"),
        max_amount=Decimal("2000.00"),
        interest_rate=Decimal("15.00"),
        duration_days=14,
        description="15% flat rate credit advance for up to 14 days.",
        is_active=True,
        admin_id=admin_id,
    )
    assert product.monthly_interest_rate == Decimal("15.00")
    assert product.duration_months == 14

    # Reject loan application with duration > 14 days
    with pytest.raises(HTTPException) as exc_info:
        await loan_service.apply_for_loan(
            test_db,
            user_id=user.id,
            product_id=product.id,
            amount=Decimal("1000.00"),
            duration_days=15,  # Exceeds 14 days!
            terms_accepted=True,
        )
    assert exc_info.value.status_code == 400
    assert "14 days" in exc_info.value.detail

    # Apply with 14 days duration: Flat rate interest calculation
    # 15% on $1,000.00 = $150.00 interest, $1,150.00 total repayment
    loan_app = await loan_service.apply_for_loan(
        test_db,
        user_id=user.id,
        product_id=product.id,
        amount=Decimal("1000.00"),
        duration_days=14,
        terms_accepted=True,
    )

    assert loan_app.principal_amount == Decimal("1000.00")
    assert loan_app.total_interest == Decimal("150.00")
    assert loan_app.total_repayment == Decimal("1150.00")
    assert loan_app.duration_months == 14  # Exact snapshot preserved
    assert loan_app.status == "submitted"

    # Admin disburse loan: User USDT wallet credited with principal $1,000.00
    loan_app.status = "approved"
    await test_db.commit()

    disbursed_loan = await loan_service.admin_disburse_loan(
        test_db,
        loan_id=loan_app.id,
        admin_id=admin_id,
    )
    assert disbursed_loan.status == "active"
    assert disbursed_loan.due_date is not None
    # Due date should be ~14 days from disbursement
    time_diff = (disbursed_loan.due_date - disbursed_loan.disbursed_at).days
    assert time_diff == 14

    # Verify user wallet credited
    wallet_res = await test_db.execute(select(Wallet).filter(Wallet.user_id == user.id, Wallet.currency == "USDT"))
    borrower_wallet = wallet_res.scalars().first()
    assert borrower_wallet is not None
    assert borrower_wallet.balance == Decimal("1000.00")
