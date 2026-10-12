# ============================================
# HORIZON EQUITY - SAVED WALLET SERVICE
# Cryptocurrency Destination Wallet Management
# ============================================

import re
import uuid
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from app.models.user_saved_wallet import UserSavedWallet
from app.models.audit_log import AuditLog
from app.schemas.user_saved_wallet import UserSavedWalletCreate, UserSavedWalletUpdate
from app.services.notification_service import notification_service


def validate_crypto_address(asset: str, network: str, address: str) -> None:
    """Validate destination cryptocurrency address according to asset and blockchain network."""
    asset_upper = asset.upper().strip()
    addr_clean = address.strip()

    if not addr_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wallet address cannot be empty.",
        )

    if asset_upper == "BTC":
        # Legacy (1), Script/SegWit (3), Native Segwit (bc1)
        if not re.match(r"^(1|3|bc1[a-zA-HJ-NP-Z0-9]{25,62})[a-km-zA-HJ-NP-Z1-9]{25,62}$", addr_clean):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Bitcoin address. Must start with '1', '3', or 'bc1' and match standard Bitcoin length.",
            )

    elif asset_upper == "ETH":
        if not re.match(r"^0x[a-fA-F0-9]{40}$", addr_clean):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Ethereum address. Must start with '0x' and contain exactly 40 hexadecimal characters.",
            )

    elif asset_upper == "SOL":
        if not re.match(r"^[1-9A-HJ-NP-Za-km-z]{32,44}$", addr_clean):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Solana address. Must be a valid Base58 encoded address between 32 and 44 characters.",
            )

    elif asset_upper == "USDT":
        net_lower = network.lower()
        if "trc" in net_lower or "tron" in net_lower:
            if not re.match(r"^T[a-km-zA-HJ-NP-Z1-9]{33}$", addr_clean):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid Tron (TRC-20) USDT address. Must start with 'T' and be 34 characters long.",
                )
        elif "erc" in net_lower or "eth" in net_lower or "bep" in net_lower or "bsc" in net_lower or "binance" in net_lower:
            if not re.match(r"^0x[a-fA-F0-9]{40}$", addr_clean):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid EVM (ERC-20 / BEP-20) USDT address. Must start with '0x' and contain 40 hex characters.",
                )
        elif "sol" in net_lower or "spl" in net_lower:
            if not re.match(r"^[1-9A-HJ-NP-Za-km-z]{32,44}$", addr_clean):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid Solana (SPL) USDT address. Must be a valid Base58 encoded address.",
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please specify a valid supported USDT network: Tron (TRC-20), Ethereum (ERC-20), BNB Smart Chain (BEP-20), or Solana (SPL).",
            )
    else:
        # Fallback for other configured assets: minimum check
        if len(addr_clean) < 20 or len(addr_clean) > 120:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid address format for {asset_upper}.",
            )


class SavedWalletService:
    """Manages saved destination wallets for user withdrawals with network verification."""

    @staticmethod
    async def get_user_saved_wallets(db: AsyncSession, user_id: uuid.UUID) -> List[UserSavedWallet]:
        """Fetch all saved destination wallets for a user."""
        result = await db.execute(
            select(UserSavedWallet)
            .filter(UserSavedWallet.user_id == user_id)
            .order_by(desc(UserSavedWallet.is_default), desc(UserSavedWallet.created_at))
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_saved_wallet_by_id(db: AsyncSession, user_id: uuid.UUID, wallet_id: uuid.UUID) -> Optional[UserSavedWallet]:
        """Fetch a specific user saved wallet."""
        result = await db.execute(
            select(UserSavedWallet).filter(UserSavedWallet.id == wallet_id, UserSavedWallet.user_id == user_id)
        )
        return result.scalars().first()

    @staticmethod
    async def add_saved_wallet(
        db: AsyncSession, user_id: uuid.UUID, wallet_in: UserSavedWalletCreate
    ) -> UserSavedWallet:
        """Validate and add a new destination wallet address."""
        asset_upper = wallet_in.asset.upper().strip()
        network_clean = wallet_in.network.strip()
        addr_clean = wallet_in.address.strip()

        # Enforce address validation
        validate_crypto_address(asset_upper, network_clean, addr_clean)

        # Check duplicate for this user
        dup = await db.execute(
            select(UserSavedWallet).filter(
                UserSavedWallet.user_id == user_id,
                UserSavedWallet.asset == asset_upper,
                UserSavedWallet.network == network_clean,
                UserSavedWallet.address == addr_clean,
            )
        )
        if dup.scalars().first() is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already saved this address for the specified asset and network.",
            )

        # If marked as default, unset other defaults for this asset
        if wallet_in.is_default:
            existing_defaults = await db.execute(
                select(UserSavedWallet).filter(
                    UserSavedWallet.user_id == user_id,
                    UserSavedWallet.asset == asset_upper,
                    UserSavedWallet.is_default == True,
                )
            )
            for w in existing_defaults.scalars().all():
                w.is_default = False
                db.add(w)

        new_wallet = UserSavedWallet(
            user_id=user_id,
            asset=asset_upper,
            network=network_clean,
            address=addr_clean,
            label=wallet_in.label.strip(),
            is_default=bool(wallet_in.is_default),
        )
        db.add(new_wallet)

        # Audit log
        audit = AuditLog(
            user_id=user_id,
            action="saved_wallet_added",
            entity_type="user_saved_wallet",
            new_values={
                "asset": asset_upper,
                "network": network_clean,
                "label": wallet_in.label,
                "address_prefix": addr_clean[:8] + "...",
            },
        )
        db.add(audit)

        # In-app notification
        await notification_service.create_notification(
            db,
            user_id=user_id,
            type="security",
            title="Destination Wallet Added",
            message=f"Added {wallet_in.label} ({asset_upper} on {network_clean}) as a destination wallet.",
        )

        await db.commit()
        await db.refresh(new_wallet)
        return new_wallet

    @staticmethod
    async def update_saved_wallet(
        db: AsyncSession, user_id: uuid.UUID, wallet_id: uuid.UUID, wallet_in: UserSavedWalletUpdate
    ) -> UserSavedWallet:
        """Update an existing saved wallet."""
        wallet = await SavedWalletService.get_saved_wallet_by_id(db, user_id, wallet_id)
        if not wallet:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved wallet not found.")

        if wallet_in.label is not None:
            wallet.label = wallet_in.label.strip()

        if wallet_in.address is not None:
            net = wallet_in.network or wallet.network
            validate_crypto_address(wallet.asset, net, wallet_in.address.strip())
            wallet.address = wallet_in.address.strip()

        if wallet_in.network is not None:
            validate_crypto_address(wallet.asset, wallet_in.network.strip(), wallet.address)
            wallet.network = wallet_in.network.strip()

        if wallet_in.is_default is True:
            existing_defaults = await db.execute(
                select(UserSavedWallet).filter(
                    UserSavedWallet.user_id == user_id,
                    UserSavedWallet.asset == wallet.asset,
                    UserSavedWallet.is_default == True,
                    UserSavedWallet.id != wallet.id,
                )
            )
            for w in existing_defaults.scalars().all():
                w.is_default = False
                db.add(w)
            wallet.is_default = True
        elif wallet_in.is_default is False:
            wallet.is_default = False

        db.add(wallet)

        audit = AuditLog(
            user_id=user_id,
            action="saved_wallet_updated",
            entity_type="user_saved_wallet",
            entity_id=wallet.id,
            new_values={"label": wallet.label, "is_default": wallet.is_default},
        )
        db.add(audit)

        await db.commit()
        await db.refresh(wallet)
        return wallet

    @staticmethod
    async def delete_saved_wallet(db: AsyncSession, user_id: uuid.UUID, wallet_id: uuid.UUID) -> bool:
        """Delete a saved destination wallet."""
        wallet = await SavedWalletService.get_saved_wallet_by_id(db, user_id, wallet_id)
        if not wallet:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved wallet not found.")

        await db.delete(wallet)

        audit = AuditLog(
            user_id=user_id,
            action="saved_wallet_removed",
            entity_type="user_saved_wallet",
            entity_id=wallet_id,
            new_values={"asset": wallet.asset, "label": wallet.label},
        )
        db.add(audit)

        await db.commit()
        return True


saved_wallet_service = SavedWalletService()
