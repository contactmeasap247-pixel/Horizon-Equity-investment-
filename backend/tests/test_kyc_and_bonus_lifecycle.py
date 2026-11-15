import pytest
import uuid
from decimal import Decimal
from datetime import datetime, timedelta
from pydantic import ValidationError

from app.schemas.kyc import KycSubmissionRequest
from app.models.user import User
from app.models.wallet import Wallet
from app.models.investment import Investment
from app.models.withdrawal_request import WithdrawalRequest
from app.models.registration_bonus import RegistrationBonus
from app.models.transaction import Transaction
from app.api.v1.users import get_registration_bonus_status, dismiss_bonus_banner
from sqlalchemy.future import select


# ========================================================
# 1. TEST KYC SUBMISSION SCHEMA & VALIDATION (TASK 8)
# ========================================================

def test_kyc_submission_requires_front_and_back():
    """KYC requires front_document and back_document, while selfie_proof is optional."""
    # Valid submission without selfie
    valid_data = {
        "document_type": "passport",
        "document_number": "P12345678",
        "full_legal_name": "John Doe",
        "date_of_birth": "1990-01-01",
        "nationality": "United Kingdom",
        "front_document": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "back_document": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    }
    req = KycSubmissionRequest(**valid_data)
    assert req.front_document is not None
    assert req.back_document is not None
    assert req.selfie_proof is None


def test_kyc_submission_fails_when_front_or_back_missing():
    """KYC submission must fail if front or back document is missing."""
    # Missing back_document
    with pytest.raises(ValidationError):
        KycSubmissionRequest(
            document_type="passport",
            document_number="P12345678",
            full_legal_name="John Doe",
            date_of_birth="1990-01-01",
            nationality="United Kingdom",
            front_document="data:image/png;base64,sample_front",
            # back_document missing
        )

    # Missing front_document
    with pytest.raises(ValidationError):
        KycSubmissionRequest(
            document_type="national_id",
            document_number="ID987654",
            full_legal_name="Jane Doe",
            date_of_birth="1992-05-15",
            nationality="Germany",
            back_document="data:image/png;base64,sample_back",
            # front_document missing
        )


# ========================================================
# 2. TEST 5-STATE BONUS LIFECYCLE (TASK 9)
# ========================================================

@pytest.mark.asyncio
async def test_bonus_lifecycle_not_qualified(test_db):
    """New user with locked bonus and no active investment is in 'not_qualified' state."""
    user = User(
        id=uuid.uuid4(),
        email="bonus_not_qual@example.com",
        password_hash="hashed_pw",
        full_name="Bob Starter",
        referral_code="REF-BOB1",
        is_active=True,
    )
    test_db.add(user)
    await test_db.commit()

    res = await get_registration_bonus_status(current_user=user, db=test_db)
    assert res["lifecycle_state"] == "not_qualified"
    assert res["banner_visible"] is True
    assert res["status"] == "locked"
    assert res["is_withdrawable"] is False


@pytest.mark.asyncio
async def test_bonus_lifecycle_qualification_pending(test_db):
    """User with locked bonus and active investment is in 'qualification_pending' state."""
    user = User(
        id=uuid.uuid4(),
        email="bonus_active@example.com",
        password_hash="hashed_pw",
        full_name="Charlie Investor",
        referral_code="REF-CHARLIE",
        is_active=True,
    )
    test_db.add(user)
    await test_db.commit()

    # Create active investment
    active_inv = Investment(
        id=uuid.uuid4(),
        user_id=user.id,
        plan_id=uuid.uuid4(),
        amount=Decimal("200.00"),
        expected_return=Decimal("240.00"),
        currency="USDT",
        status="active",
        start_date=datetime.utcnow(),
        maturity_date=datetime.utcnow() + timedelta(days=2),
    )
    test_db.add(active_inv)
    await test_db.commit()

    res = await get_registration_bonus_status(current_user=user, db=test_db)
    assert res["lifecycle_state"] == "qualification_pending"
    assert res["banner_visible"] is True
    assert res["status"] == "locked"


@pytest.mark.asyncio
async def test_bonus_lifecycle_qualified_and_unlocked(test_db):
    """User with completed investment has bonus unlocked and state 'qualified_and_unlocked'."""
    user = User(
        id=uuid.uuid4(),
        email="bonus_unlocked@example.com",
        password_hash="hashed_pw",
        full_name="Diana Qualified",
        referral_code="REF-DIANA",
        is_active=True,
    )
    test_db.add(user)
    await test_db.commit()

    # Create completed investment
    completed_inv = Investment(
        id=uuid.uuid4(),
        user_id=user.id,
        plan_id=uuid.uuid4(),
        amount=Decimal("500.00"),
        expected_return=Decimal("600.00"),
        currency="USDT",
        status="completed",
        start_date=datetime.utcnow() - timedelta(days=5),
        maturity_date=datetime.utcnow() - timedelta(days=1),
    )
    test_db.add(completed_inv)
    await test_db.commit()

    res = await get_registration_bonus_status(current_user=user, db=test_db)
    assert res["lifecycle_state"] == "qualified_and_unlocked"
    assert res["banner_visible"] is True
    assert res["status"] == "unlocked"
    assert res["is_withdrawable"] is True


@pytest.mark.asyncio
async def test_bonus_lifecycle_acknowledged_or_dismissed(test_db):
    """User can dismiss the unlocked banner, persisting state 'acknowledged_or_dismissed'."""
    user = User(
        id=uuid.uuid4(),
        email="bonus_dismiss@example.com",
        password_hash="hashed_pw",
        full_name="Edward Dismiss",
        referral_code="REF-EDWARD",
        is_active=True,
    )
    test_db.add(user)
    await test_db.commit()

    # Pre-create completed investment so bonus is unlocked
    completed_inv = Investment(
        id=uuid.uuid4(),
        user_id=user.id,
        plan_id=uuid.uuid4(),
        amount=Decimal("500.00"),
        expected_return=Decimal("600.00"),
        currency="USDT",
        status="completed",
        start_date=datetime.utcnow() - timedelta(days=5),
        maturity_date=datetime.utcnow() - timedelta(days=1),
    )
    test_db.add(completed_inv)
    await test_db.commit()

    # First verify it is qualified and unlocked
    res = await get_registration_bonus_status(current_user=user, db=test_db)
    assert res["lifecycle_state"] == "qualified_and_unlocked"
    assert res["banner_visible"] is True

    # Now call dismiss endpoint
    dismiss_res = await dismiss_bonus_banner(current_user=user, db=test_db)
    assert dismiss_res["banner_visible"] is False
    assert dismiss_res["lifecycle_state"] == "acknowledged_or_dismissed"

    # Verify subsequent GET returns dismissed state and banner_visible is False
    res2 = await get_registration_bonus_status(current_user=user, db=test_db)
    assert res2["lifecycle_state"] == "acknowledged_or_dismissed"
    assert res2["banner_visible"] is False
    assert res2["is_dismissed"] is True
    # The bonus balance and unlocked status remain completely intact!
    assert res2["status"] == "unlocked"
    assert res2["amount"] == 10.0


@pytest.mark.asyncio
async def test_bonus_lifecycle_claimed_or_withdrawn(test_db):
    """When user submits or completes a withdrawal, state becomes 'claimed_or_withdrawn'."""
    user = User(
        id=uuid.uuid4(),
        email="bonus_claimed@example.com",
        password_hash="hashed_pw",
        full_name="Fiona Claimed",
        referral_code="REF-FIONA",
        is_active=True,
    )
    test_db.add(user)
    await test_db.commit()

    # Create completed investment
    completed_inv = Investment(
        id=uuid.uuid4(),
        user_id=user.id,
        plan_id=uuid.uuid4(),
        amount=Decimal("500.00"),
        expected_return=Decimal("600.00"),
        currency="USDT",
        status="completed",
        start_date=datetime.utcnow() - timedelta(days=5),
        maturity_date=datetime.utcnow() - timedelta(days=1),
    )
    test_db.add(completed_inv)

    # Create approved withdrawal request
    w_req = WithdrawalRequest(
        id=uuid.uuid4(),
        user_id=user.id,
        amount=Decimal("150.00"),
        currency="USDT",
        wallet_address="0x1234567890abcdef1234567890abcdef12345678",
        wallet_type="crypto",
        status="completed",
    )
    test_db.add(w_req)
    await test_db.commit()

    res = await get_registration_bonus_status(current_user=user, db=test_db)
    assert res["lifecycle_state"] == "claimed_or_withdrawn"
    assert res["banner_visible"] is False
    assert res["is_claimed"] is True
