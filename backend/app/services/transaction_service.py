# ============================================
# HORIZON EQUITY - TRANSACTION SERVICE
# ============================================

import uuid
from typing import List, Optional
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.transaction import Transaction


class TransactionService:
    """Business logic for reading, writing, and filtering financial transactions."""

    @staticmethod
    async def get_user_transactions(
        db: AsyncSession,
        user_id: uuid.UUID,
        type_filter: Optional[str] = None,
        status_filter: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[Transaction]:
        """Fetch transaction logs for a user with pagination and optional filters."""
        query = select(Transaction).filter(Transaction.user_id == user_id)

        if type_filter:
            query = query.filter(Transaction.type == type_filter.lower())
        if status_filter:
            query = query.filter(Transaction.status == status_filter.lower())

        query = query.order_by(Transaction.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_all_transactions(
        db: AsyncSession,
        type_filter: Optional[str] = None,
        status_filter: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Transaction]:
        """Fetch all transaction logs in the system for administrative view."""
        query = select(Transaction)

        if type_filter:
            query = query.filter(Transaction.type == type_filter.lower())
        if status_filter:
            query = query.filter(Transaction.status == status_filter.lower())

        query = query.order_by(Transaction.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def create_transaction(
        db: AsyncSession,
        user_id: uuid.UUID,
        type: str,
        amount: Decimal,
        currency: str,
        fee: Decimal = Decimal("0.0"),
        status: str = "completed",
        description: Optional[str] = None,
        reference: Optional[str] = None,
    ) -> Transaction:
        """Create a new manual ledger transaction record."""
        # Clean inputs
        currency_clean = currency.upper().strip()
        type_clean = type.lower().strip()
        status_clean = status.lower().strip()
        
        # Generate reference if not provided
        ref = reference or f"TX-{str(uuid.uuid4())[:12].upper()}"

        transaction = Transaction(
            user_id=user_id,
            type=type_clean,
            amount=amount,
            fee=fee,
            currency=currency_clean,
            status=status_clean,
            reference=ref,
            description=description,
        )
        db.add(transaction)
        await db.commit()
        await db.refresh(transaction)
        return transaction


transaction_service = TransactionService()
