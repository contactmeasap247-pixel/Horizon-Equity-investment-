# ========================================================
# HORIZON EQUITY - COMPREHENSIVE REFERRAL SYSTEM TESTS
# ========================================================

import pytest
import uuid
from decimal import Decimal
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException

from app.models.user import User
from app.models.wallet import Wallet
from app.models.investment_plan import InvestmentPlan
from app.models.investment import Investment
from app.models.deposit_request import DepositRequest
from app.models.referral_commission import ReferralCommission
from app.models.transaction import Transaction
from app.schemas.user import UserCreate
from app.services.auth_service import auth_service
from app.services.referral_service import ReferralService
from app.services.admin_service import AdminService
from sqlalchemy.future import select


@pytest.mark.asyncio
async def test_validate_referral_code(test_db):
    """Test referral code validation with case-insensitivity."""
    # Create referrer
    referrer = User(
        id=uuid.uuid4(),
        email="alex.referrer@horizon.com",
        full_name="Alex Morpheus",
        password_hash="hash",
        referral_code="HORIZON999",
        is_active=True,
    )
    test_db.add(referrer)
    await test_db.commit()

    # Test exact match
    res1 = await ReferralService.validate_referral_code(test_db, "HORIZON999")
    assert res1["valid"] is True
    assert res1["referral_code"] == "HORIZON999"
    assert res1["referrer_name"] == "Alex Morpheus"

    # Test case-insensitivity and trim
    res2 = await ReferralService.validate_referral_code(test_db, "  horizon999  ")
    assert res2["valid"] is True
    assert res2["referral_code"] == "HORIZON999"
    assert res2["referrer_name"] == "Alex Morpheus"

    # Test non-existent code
    res3 = await ReferralService.validate_referral_code(test_db, "NONEXISTENT")
    assert res3["valid"] is False
    assert res3.get("referrer_name") is None


@pytest.mark.asyncio
async def test_registration_referral_attribution_and_validation(test_db):
    """Test attribution during signup, self-referral rejection, and invalid code rejection."""
    referrer = User(
        id=uuid.uuid4(),
        email="patron@horizon.com",
        full_name="Patron Investor",
        password_hash="hash",
        referral_code="PATRON77",
        referral_count=0,
        referral_earnings=Decimal("0.0"),
        is_active=True,
    )
    test_db.add(referrer)
    await test_db.commit()

    # 1. Successful referral signup with lowercase code
    new_user_in = UserCreate(
        email="newcomer@horizon.com",
        password="SecurePassword123!",
        full_name="New Investor",
        referred_by_code="patron77",  # lowercase
    )
    new_user = await auth_service.register_user(test_db, new_user_in)
    assert new_user.referred_by == referrer.id

    # Verify referrer's referral_count incremented
    await test_db.refresh(referrer)
    assert referrer.referral_count == 1

    # 2. Rejection of self-referral (using own referral code)
    self_ref_in = UserCreate(
        email="patron@horizon.com",
        password="SecurePassword123!",
        full_name="Patron Investor Duplicate",
        referred_by_code="PATRON77",
    )
    with pytest.raises(HTTPException) as exc_info:
        await auth_service.register_user(test_db, self_ref_in)
    assert exc_info.value.status_code == 400
    assert "self-referrals are prohibited" in exc_info.value.detail.lower()

    # 3. Rejection of invalid referral code
    invalid_code_in = UserCreate(
        email="someone@horizon.com",
        password="SecurePassword123!",
        full_name="Someone Else",
        referred_by_code="BOGUSCODE123",
    )
    with pytest.raises(HTTPException) as exc_info:
        await auth_service.register_user(test_db, invalid_code_in)
    assert exc_info.value.status_code == 400
    assert "invalid" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_investment_commission_creation_and_idempotency(test_db):
    """Test commission creation on investment purchase and idempotency protection."""
    referrer = User(
        id=uuid.uuid4(),
        email="ref_inv@horizon.com",
        full_name="Referrer One",
        password_hash="hash",
        referral_code="REFINV1",
        is_active=True,
    )
    referred = User(
        id=uuid.uuid4(),
        email="referee_inv@horizon.com",
        full_name="Referee One",
        password_hash="hash",
        referral_code="REFEREE1",
        referred_by=referrer.id,
        is_active=True,
    )
    plan = InvestmentPlan(
        id=uuid.uuid4(),
        name="Apex Alpha",
        min_amount=Decimal("1000.0"),
        max_amount=Decimal("50000.0"),
        return_percentage=Decimal("15.0"),
        duration_days=30,
        referral_bonus_percentage=Decimal("5.0"),  # 5%
    )
    test_db.add_all([referrer, referred, plan])
    await test_db.commit()

    inv = Investment(
        id=uuid.uuid4(),
        user_id=referred.id,
        plan_id=plan.id,
        amount=Decimal("10000.0"),
        currency="USDT",
        expected_return=Decimal("11500.0"),
        status="active",
        start_date=datetime.now(timezone.utc),
        maturity_date=datetime.now(timezone.utc) + timedelta(days=30),
    )
    test_db.add(inv)
    await test_db.commit()

    # 1. Create commission
    comm = await ReferralService.create_investment_referral_commission(
        test_db,
        investment=inv,
        plan=plan,
        referrer_id=referrer.id,
        referred_user=referred,
    )
    assert comm is not None
    assert comm.referrer_id == referrer.id
    assert comm.referred_user_id == referred.id
    assert comm.source_type == "investment"
    assert comm.currency == "USDT"
    # 5% of 10000 = 500
    assert Decimal(str(comm.commission_amount)) == Decimal("500.0")
    assert comm.status == "pending"

    # 2. Idempotency: calling again for same investment returns None to prevent duplicate
    comm_dup = await ReferralService.create_investment_referral_commission(
        test_db,
        investment=inv,
        plan=plan,
        referrer_id=referrer.id,
        referred_user=referred,
    )
    assert comm_dup is None

    # Verify only 1 commission exists in DB
    result = await test_db.execute(
        select(ReferralCommission).filter(ReferralCommission.investment_id == inv.id)
    )
    commissions = result.scalars().all()
    assert len(commissions) == 1


@pytest.mark.asyncio
async def test_commission_settlement_and_earnings_sync(test_db):
    """Test commission settlement crediting wallet, setting status to paid, and updating referral_earnings."""
    referrer = User(
        id=uuid.uuid4(),
        email="settle_ref@horizon.com",
        full_name="Settle Referrer",
        password_hash="hash",
        referral_code="SETTLEREF",
        referral_earnings=Decimal("0.0"),
        is_active=True,
    )
    referred = User(
        id=uuid.uuid4(),
        email="settle_referred@horizon.com",
        full_name="Settle Referee",
        password_hash="hash",
        referral_code="SETTLEREF2",
        referred_by=referrer.id,
        is_active=True,
    )
    # Give referrer a wallet
    wallet = Wallet(
        id=uuid.uuid4(),
        user_id=referrer.id,
        currency="USDT",
        balance=Decimal("100.000000"),
    )
    comm = ReferralCommission(
        id=uuid.uuid4(),
        referrer_id=referrer.id,
        referred_user_id=referred.id,
        commission_amount=Decimal("250.0"),
        currency="USDT",
        status="pending",
        source_type="investment",
    )
    test_db.add_all([referrer, referred, wallet, comm])
    await test_db.commit()

    # Settle commission
    settled = await ReferralService.settle_referral_commission(test_db, comm.id)
    assert settled is not None

    await test_db.refresh(comm)
    await test_db.refresh(wallet)
    await test_db.refresh(referrer)

    assert comm.status == "paid"
    # Wallet balance was 100 + 250 = 350
    assert wallet.balance == Decimal("350.000000")
    # Referrer total earnings updated to 250
    assert Decimal(str(referrer.referral_earnings)) == Decimal("250.0")

    # Calling settle again is a no-op (idempotent, returns comm without double-crediting)
    settled_again = await ReferralService.settle_referral_commission(test_db, comm.id)
    assert settled_again.id == comm.id
    await test_db.refresh(wallet)
    assert wallet.balance == Decimal("350.000000")


@pytest.mark.asyncio
async def test_referral_reconciliation_audit(test_db):
    """Test reconcile_referrals repairs affiliate counts and settled earnings accurately."""
    referrer = User(
        id=uuid.uuid4(),
        email="reconcile@horizon.com",
        full_name="Reconcile Lead",
        password_hash="hash",
        referral_code="RECON99",
        referral_count=999,  # Corrupt out-of-sync count
        referral_earnings=Decimal("0.0"),  # Corrupt 0 earnings
        is_active=True,
    )
    referee1 = User(
        id=uuid.uuid4(),
        email="r1@horizon.com",
        full_name="Referee One",
        password_hash="hash",
        referral_code="REF1",
        referred_by=referrer.id,
        is_active=True,
    )
    referee2 = User(
        id=uuid.uuid4(),
        email="r2@horizon.com",
        full_name="Referee Two",
        password_hash="hash",
        referral_code="REF2",
        referred_by=referrer.id,
        is_active=True,
    )
    # Two completed commissions of 150 USDT each
    c1 = ReferralCommission(
        id=uuid.uuid4(),
        referrer_id=referrer.id,
        referred_user_id=referee1.id,
        commission_amount=Decimal("150.0"),
        currency="USDT",
        status="paid",
        source_type="investment",
    )
    c2 = ReferralCommission(
        id=uuid.uuid4(),
        referrer_id=referrer.id,
        referred_user_id=referee2.id,
        commission_amount=Decimal("150.0"),
        currency="USDT",
        status="paid",
        source_type="deposit",
    )
    test_db.add_all([referrer, referee1, referee2, c1, c2])
    await test_db.commit()

    # Run reconciliation
    audit_summary = await ReferralService.reconcile_referrals(test_db)
    assert audit_summary["reconciled_referrers"] == 1
    assert "reconciled" in audit_summary["message"].lower()

    await test_db.refresh(referrer)
    # Corrupt count 999 corrected to 2
    assert referrer.referral_count == 2
    # Corrupt 0.0 earnings corrected to 300.0
    assert Decimal(str(referrer.referral_earnings)) == Decimal("300.0")


@pytest.mark.asyncio
async def test_admin_delete_user_cascade(test_db):
    """Test admin permanent user deletion cascading records and updating analytics."""
    referrer = User(
        id=uuid.uuid4(),
        email="boss@horizon.com",
        full_name="Boss Lead",
        password_hash="hash",
        referral_code="BOSS77",
        referral_count=1,
        is_active=True,
    )
    target_user = User(
        id=uuid.uuid4(),
        email="test_to_delete@horizon.com",
        full_name="Test Investor",
        password_hash="hash",
        referral_code="TARGETDEL",
        referred_by=referrer.id,
        is_active=True,
    )
    target_wallet = Wallet(
        id=uuid.uuid4(),
        user_id=target_user.id,
        currency="USDT",
        balance=Decimal("50.0"),
    )
    sub_user = User(
        id=uuid.uuid4(),
        email="sub_user@horizon.com",
        full_name="Sub Referee",
        password_hash="hash",
        referral_code="SUBREF",
        referred_by=target_user.id,
        is_active=True,
    )
    admin_actor = User(
        id=uuid.uuid4(),
        email="admin@horizon.com",
        full_name="Admin Security",
        password_hash="hash",
        referral_code="ADMINSEC",
        is_admin=True,
        is_active=True,
    )
    test_db.add_all([referrer, target_user, target_wallet, sub_user, admin_actor])
    await test_db.commit()

    # Execute admin delete_user
    result = await AdminService.delete_user(test_db, user_id=target_user.id, admin_id=admin_actor.id)
    assert result["status"] == "success"
    assert "permanently deleted" in result["message"]

    # 1. Target user is deleted
    deleted_check = await test_db.get(User, target_user.id)
    assert deleted_check is None

    # 2. Target user's wallet is deleted
    wallet_check = await test_db.get(Wallet, target_wallet.id)
    assert wallet_check is None

    # 3. Referrer's count decremented from 1 to 0
    await test_db.refresh(referrer)
    assert referrer.referral_count == 0

    # 4. Referee who was referred by target_user now has referred_by set to None
    await test_db.refresh(sub_user)
    assert sub_user.referred_by is None
