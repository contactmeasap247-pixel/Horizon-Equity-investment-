# ============================================
# HORIZON EQUITY - ADMIN WALLETS API ENDPOINTS
# ============================================

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import get_admin_user
from app.schemas.wallet import AdminWalletCreate, AdminWalletUpdate, AdminWalletResponse
from app.services.wallet_service import wallet_service
from app.models.user import User

router = APIRouter()


@router.post("", response_model=AdminWalletResponse, status_code=status.HTTP_201_CREATED)
async def create_system_wallet(
    body: AdminWalletCreate,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Register a new admin-controlled deposit address for system payments."""
    return await wallet_service.create_admin_wallet(db, body, current_admin.id)


@router.get("", response_model=List[AdminWalletResponse])
async def list_system_wallets(
    only_active: bool = False,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all admin-controlled deposit wallets, optionally filtering for active ones."""
    return await wallet_service.get_admin_wallets(db, only_active=only_active)


@router.get("/{wallet_id}", response_model=AdminWalletResponse)
async def get_system_wallet_details(
    wallet_id: UUID,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve details of a specific admin deposit wallet."""
    wallet = await wallet_service.get_admin_wallet_by_id(db, wallet_id)
    if wallet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System wallet not found."
        )
    return wallet


@router.put("/{wallet_id}", response_model=AdminWalletResponse)
async def update_system_wallet(
    wallet_id: UUID,
    body: AdminWalletUpdate,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Update details (address, label, active state) of an admin deposit wallet."""
    wallet = await wallet_service.update_admin_wallet(db, wallet_id, body)
    if wallet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System wallet not found."
        )
    return wallet


@router.delete("/{wallet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_system_wallet(
    wallet_id: UUID,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete an admin deposit wallet address."""
    success = await wallet_service.delete_admin_wallet(db, wallet_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System wallet not found."
        )
    return None
