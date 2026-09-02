# ============================================
# HORIZON EQUITY - WALLET SERVICE
# ============================================

import uuid
from typing import List, Optional
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.wallet import Wallet
from app.models.admin_wallet import AdminWallet
from app.models.deposit_request import DepositRequest
from app.models.withdrawal_request import WithdrawalRequest
from app.schemas.wallet import AdminWalletCreate, AdminWalletUpdate, WithdrawalRequestCreate


class WalletService:
    """Business logic for user wallets, admin deposit wallets, deposits, and withdrawal requests."""

    @staticmethod
    async def get_user_wallets(db: AsyncSession, user_id: uuid.UUID) -> List[Wallet]:
        """Fetch all cryptocurrency wallets for a specific user."""
        result = await db.execute(select(Wallet).filter(Wallet.user_id == user_id))
        return list(result.scalars().all())

    @staticmethod
    async def get_user_wallet_by_currency(db: AsyncSession, user_id: uuid.UUID, currency: str) -> Optional[Wallet]:
        """Fetch a specific cryptocurrency wallet for a user."""
        result = await db.execute(
            select(Wallet).filter(Wallet.user_id == user_id, Wallet.currency == currency.upper())
        )
        return result.scalars().first()

    # --- Admin Wallets Operations ---

    @staticmethod
    async def get_admin_wallets(db: AsyncSession, only_active: bool = False) -> List[AdminWallet]:
        """Fetch all system deposit wallets managed by the administrator."""
        query = select(AdminWallet)
        if only_active:
            query = query.filter(AdminWallet.is_active == True)
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_admin_wallet_by_id(db: AsyncSession, wallet_id: uuid.UUID) -> Optional[AdminWallet]:
        """Fetch a specific admin wallet by ID."""
        result = await db.execute(select(AdminWallet).filter(AdminWallet.id == wallet_id))
        return result.scalars().first()

    async def create_admin_wallet(
        self, db: AsyncSession, wallet_in: AdminWalletCreate, admin_id: uuid.UUID
    ) -> AdminWallet:
        """Create a new system wallet address, ensuring currency uniqueness rules for primary addresses."""
        currency = wallet_in.currency.upper()
        
        # If set to primary, clear existing primary flags for this currency
        if wallet_in.is_primary:
            await db.execute(
                select(AdminWallet)
                .filter(AdminWallet.currency == currency, AdminWallet.is_primary == True)
            )
            # We will handle unsetting in update/save logic
            existing_primaries_result = await db.execute(
                select(AdminWallet).filter(AdminWallet.currency == currency, AdminWallet.is_primary == True)
            )
            for w in existing_primaries_result.scalars().all():
                w.is_primary = False
                db.add(w)

        new_wallet = AdminWallet(
            currency=currency,
            wallet_address=wallet_in.wallet_address.strip(),
            label=wallet_in.label,
            is_active=wallet_in.is_active,
            is_primary=wallet_in.is_primary,
            created_by=admin_id,
        )
        db.add(new_wallet)
        await db.commit()
        await db.refresh(new_wallet)
        return new_wallet

    async def update_admin_wallet(
        self, db: AsyncSession, wallet_id: uuid.UUID, wallet_in: AdminWalletUpdate
    ) -> Optional[AdminWallet]:
        """Update an existing system wallet address."""
        wallet = await self.get_admin_wallet_by_id(db, wallet_id)
        if wallet is None:
            return None

        # Update fields if provided
        if wallet_in.wallet_address is not None:
            wallet.wallet_address = wallet_in.wallet_address.strip()
        if wallet_in.label is not None:
            wallet.label = wallet_in.label
        if wallet_in.is_active is not None:
            wallet.is_active = wallet_in.is_active

        if wallet_in.is_primary is True:
            # Clear existing primary flag of same currency
            existing_primaries_result = await db.execute(
                select(AdminWallet)
                .filter(AdminWallet.currency == wallet.currency, AdminWallet.is_primary == True, AdminWallet.id != wallet.id)
            )
            for w in existing_primaries_result.scalars().all():
                w.is_primary = False
                db.add(w)
            wallet.is_primary = True
        elif wallet_in.is_primary is False:
            wallet.is_primary = False

        db.add(wallet)
        await db.commit()
        await db.refresh(wallet)
        return wallet

    @staticmethod
    async def delete_admin_wallet(db: AsyncSession, wallet_id: uuid.UUID) -> bool:
        """Delete an admin wallet address."""
        result = await db.execute(select(AdminWallet).filter(AdminWallet.id == wallet_id))
        wallet = result.scalars().first()
        if wallet:
            await db.delete(wallet)
            await db.commit()
            return True
        return False

    # --- Deposit Requests ---

    @staticmethod
    async def get_deposit_request_by_id(db: AsyncSession, request_id: uuid.UUID) -> Optional[DepositRequest]:
        """Fetch a specific deposit request by ID."""
        result = await db.execute(select(DepositRequest).filter(DepositRequest.id == request_id))
        return result.scalars().first()

    @staticmethod
    async def get_user_deposit_requests(
        db: AsyncSession, user_id: uuid.UUID, status_filter: Optional[str] = None
    ) -> List[DepositRequest]:
        """Fetch deposit requests made by a specific user."""
        query = select(DepositRequest).filter(DepositRequest.user_id == user_id)
        if status_filter:
            query = query.filter(DepositRequest.status == status_filter.lower())
        result = await db.execute(query.order_by(DepositRequest.created_at.desc()))
        return list(result.scalars().all())

    async def create_deposit_request(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        amount: Decimal,
        currency: str,
        transaction_hash: str,
        sender_address: Optional[str] = None,
    ) -> DepositRequest:
        """Create a new manual deposit request by assigning the user a system wallet receiver address."""
        currency = currency.upper()

        # Find active admin wallet for receiving deposit
        # Try primary first
        admin_wallet_result = await db.execute(
            select(AdminWallet).filter(
                AdminWallet.currency == currency,
                AdminWallet.is_active == True,
                AdminWallet.is_primary == True,
            )
        )
        receiver_wallet = admin_wallet_result.scalars().first()

        # Fallback to any active wallet of same currency
        if receiver_wallet is None:
            admin_wallet_result = await db.execute(
                select(AdminWallet).filter(AdminWallet.currency == currency, AdminWallet.is_active == True)
            )
            receiver_wallet = admin_wallet_result.scalars().first()

        if receiver_wallet is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Deposits for {currency} are currently disabled. No deposit address configured.",
            )

        # Check for transaction hash duplicates
        dup_check_result = await db.execute(
            select(DepositRequest).filter(DepositRequest.transaction_hash == transaction_hash)
        )
        if dup_check_result.scalars().first() is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A deposit request with this transaction hash already exists.",
            )

        new_request = DepositRequest(
            user_id=user_id,
            amount=amount,
            currency=currency,
            wallet_address=receiver_wallet.wallet_address,
            transaction_hash=transaction_hash.strip(),
            sender_address=sender_address.strip() if sender_address else None,
            status="pending",
        )
        db.add(new_request)
        await db.commit()
        await db.refresh(new_request)
        return new_request

    # --- Withdrawal Requests ---

    @staticmethod
    async def get_withdrawal_request_by_id(db: AsyncSession, request_id: uuid.UUID) -> Optional[WithdrawalRequest]:
        """Fetch a specific withdrawal request by ID."""
        result = await db.execute(select(WithdrawalRequest).filter(WithdrawalRequest.id == request_id))
        return result.scalars().first()

    @staticmethod
    async def get_user_withdrawal_requests(
        db: AsyncSession, user_id: uuid.UUID, status_filter: Optional[str] = None
    ) -> List[WithdrawalRequest]:
        """Fetch withdrawal requests submitted by a user."""
        query = select(WithdrawalRequest).filter(WithdrawalRequest.user_id == user_id)
        if status_filter:
            query = query.filter(WithdrawalRequest.status == status_filter.lower())
        result = await db.execute(query.order_by(WithdrawalRequest.created_at.desc()))
        return list(result.scalars().all())

    async def create_withdrawal_request(
        self, db: AsyncSession, user_id: uuid.UUID, withdraw_in: WithdrawalRequestCreate
    ) -> WithdrawalRequest:
        """Submit a user withdrawal request and freeze the requested amount to prevent double spending."""
        currency = withdraw_in.currency.upper()
        amount = withdraw_in.amount

        wallet = await self.get_user_wallet_by_currency(db, user_id, currency)
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

        # Freeze the withdrawal funds
        wallet.balance -= amount
        wallet.frozen_balance += amount
        db.add(wallet)

        new_request = WithdrawalRequest(
            user_id=user_id,
            amount=amount,
            currency=currency,
            wallet_address=withdraw_in.wallet_address.strip(),
            wallet_type=withdraw_in.wallet_type.strip(),
            status="pending",
        )
        db.add(new_request)
        await db.commit()
        await db.refresh(new_request)
        return new_request


wallet_service = WalletService()
