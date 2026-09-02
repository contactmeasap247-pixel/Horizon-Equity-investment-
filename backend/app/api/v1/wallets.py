# ============================================
# HORIZON EQUITY - WALLET API ENDPOINTS
# ============================================

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.wallet import (
    WalletResponse,
    DepositRequestCreate,
    DepositRequestResponse,
    WithdrawalRequestCreate,
    WithdrawalRequestResponse,
    AdminWalletResponse,
)
from app.services.wallet_service import wallet_service
from app.models.user import User

router = APIRouter()


@router.get("", response_model=List[WalletResponse])
async def get_wallets(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all cryptocurrency wallet balances of the logged-in user."""
    return await wallet_service.get_user_wallets(db, current_user.id)


@router.get("/addresses", response_model=List[AdminWalletResponse])
async def get_deposit_addresses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve active system wallet addresses where users can send deposits."""
    return await wallet_service.get_admin_wallets(db, only_active=True)


@router.get("/{currency}", response_model=WalletResponse)
async def get_wallet_by_currency(
    currency: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve the balance of a specific cryptocurrency wallet."""
    wallet = await wallet_service.get_user_wallet_by_currency(db, current_user.id, currency)
    if wallet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"You do not possess a wallet for {currency.upper()}."
        )
    return wallet


@router.post("/deposit", response_model=DepositRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_deposit(
    body: DepositRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Submit a manual deposit request for verification after performing a blockchain transaction."""
    return await wallet_service.create_deposit_request(
        db,
        user_id=current_user.id,
        amount=body.amount,
        currency=body.currency,
        transaction_hash=body.transaction_hash,
        sender_address=body.sender_address,
    )


@router.post("/withdraw", response_model=WithdrawalRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_withdrawal(
    body: WithdrawalRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Submit a withdrawal request. Funds will be frozen until approved by an administrator."""
    return await wallet_service.create_withdrawal_request(db, current_user.id, body)


@router.get("/history/deposits", response_model=List[DepositRequestResponse])
async def get_deposits_history(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve the history of deposit requests made by the user, optionally filtered by status."""
    return await wallet_service.get_user_deposit_requests(db, current_user.id, status)


@router.get("/history/withdrawals", response_model=List[WithdrawalRequestResponse])
async def get_withdrawals_history(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve the history of withdrawal requests submitted by the user, optionally filtered by status."""
    return await wallet_service.get_user_withdrawal_requests(db, current_user.id, status)
