# ============================================
# HORIZON EQUITY - RECEIPT SYSTEM UNIT TESTS
# ============================================

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import uuid
from datetime import datetime
from decimal import Decimal

from app.models.transaction import Transaction
from app.models.user import User
from app.services.transaction_service import (
    mask_name,
    mask_email,
    generate_receipt_number,
    generate_verification_hash,
    build_breakdown_and_context,
)
from app.schemas.receipt import ReceiptDetailResponse, ReceiptPublicVerificationResponse


def test_masking_functions():
    assert mask_name("John Doe") == "J*** D***"
    assert mask_name("Alice Robert Smith") == "A*** R*** S***"
    assert mask_name(None) == "Verified Client"
    
    assert mask_email("alex@example.com") == "al***@e***.com"
    assert mask_email("j@test.co.uk") == "j***@t***.co.uk"
    assert mask_email(None) == "c***@horizon-equity.net"
    print("Masking functions: PASS")


def test_receipt_number_generation():
    tx = Transaction(
        id=uuid.UUID("12345678-1234-5678-1234-567812345678"),
        user_id=uuid.uuid4(),
        type="deposit",
        amount=Decimal("1500.00"),
        currency="USDT",
        created_at=datetime(2026, 11, 1, 12, 0, 0),
    )
    rcp_num = generate_receipt_number(tx)
    assert rcp_num == "HE-RCP-202611-12345678"
    print("Receipt number generation: PASS")


def test_verification_hash_generation():
    user_id = uuid.uuid4()
    tx = Transaction(
        id=uuid.uuid4(),
        user_id=user_id,
        type="investment",
        amount=Decimal("5000.00"),
        currency="USD",
        created_at=datetime(2026, 11, 1, 14, 30, 0),
    )
    rcp_num = generate_receipt_number(tx)
    v_hash = generate_verification_hash(rcp_num, tx, user_id)
    assert v_hash.startswith("HE-VRF-")
    assert len(v_hash.split("-")) == 6
    print("Verification hash generation: PASS")


def test_all_10_transaction_types():
    types_to_test = [
        "deposit",
        "withdrawal",
        "investment",
        "return",
        "investment_mature",
        "referral_bonus",
        "registration_bonus",
        "adjustment",
        "fee",
        "loan_disbursement",
    ]
    user = User(
        id=uuid.uuid4(),
        email="client@example.com",
        full_name="Investor Test",
        country="United Kingdom",
    )
    for t_type in types_to_test:
        tx = Transaction(
            id=uuid.uuid4(),
            user_id=user.id,
            type=t_type,
            amount=Decimal("250.00"),
            currency="USD",
            status="completed",
            created_at=datetime.utcnow(),
            metadata_={"plan_name": "Digital Alpha", "wallet_address": "0x123...456"},
        )
        title, subtitle, breakdown = build_breakdown_and_context(tx, user)
        assert len(title) > 0
        assert len(subtitle) > 0
        assert len(breakdown) >= 2
        print(f"Transaction category [{t_type}]: {title} ({len(breakdown)} breakdown items) -> PASS")


if __name__ == "__main__":
    test_masking_functions()
    test_receipt_number_generation()
    test_verification_hash_generation()
    test_all_10_transaction_types()
    print("ALL RECEIPT BACKEND UNIT TESTS PASSED!")
