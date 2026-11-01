# ============================================
# HORIZON EQUITY - UNIFIED TRANSACTION LEDGER TESTS
# ============================================

import pytest
import uuid
from decimal import Decimal
from datetime import datetime

from app.models.transaction import Transaction
from app.schemas.transaction import TransactionResponse
from app.services.transaction_service import transaction_service


def test_transaction_response_serialization_with_orm_metadata():
    """Verify that TransactionResponse deserializes without colliding with SQLAlchemy Base.metadata."""
    tx = Transaction(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        type="deposit",
        subtype="crypto_transfer",
        amount=Decimal("1500.00000000"),
        fee=Decimal("0.0"),
        currency="USDT",
        status="completed",
        reference="DEP-12345678",
        description="Manual deposit",
        metadata_={"wallet_address": "0x123", "tx_hash": "0xabc"},
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    resp = TransactionResponse.model_validate(tx)
    assert resp.reference == "DEP-12345678"
    assert resp.amount == Decimal("1500.00000000")
    
    # Check serialization
    dump = resp.model_dump(by_alias=True)
    assert dump["reference"] == "DEP-12345678"
    assert dump["amount"] == 1500.0
    assert dump["metadata"] == {"wallet_address": "0x123", "tx_hash": "0xabc"}


def test_transaction_response_null_fee_and_null_metadata():
    """Verify serialization when optional fields are None."""
    tx = Transaction(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        type="registration_bonus",
        subtype=None,
        amount=Decimal("10.00000000"),
        fee=None,
        currency="USDT",
        status="completed",
        reference="BONUS-ABC",
        description="Welcome bonus",
        metadata_=None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    resp = TransactionResponse.model_validate(tx)
    dump = resp.model_dump(by_alias=True)
    assert dump["reference"] == "BONUS-ABC"
    assert dump["fee"] == 0.0
    assert dump["metadata"] is None
