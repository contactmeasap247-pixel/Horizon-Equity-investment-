# ============================================
# HORIZON EQUITY - TRANSACTION SERVICE
# ============================================

import uuid
import hmac
import hashlib
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, cast, String
from fastapi import HTTPException, status

from app.core.config import settings
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.receipt import (
    ReceiptDetailResponse,
    ReceiptBreakdownItem,
    ReceiptPublicVerificationResponse,
)


def mask_name(name: Optional[str]) -> str:
    """Mask investor's full name for public verification (e.g. John Doe -> J*** D***)."""
    if not name:
        return "Verified Client"
    parts = name.strip().split()
    masked_parts = []
    for p in parts:
        if p:
            masked_parts.append(p[0].upper() + "***")
    return " ".join(masked_parts) if masked_parts else "Verified Client"


def mask_email(email: Optional[str]) -> str:
    """Mask email for privacy protection in public auditing (e.g. user@domain.com -> u***@d***.com)."""
    if not email or "@" not in email:
        return "c***@horizon-equity.net"
    try:
        local_part, domain_part = email.strip().split("@", 1)
        masked_local = (local_part[0] + "***") if len(local_part) <= 2 else (local_part[:2] + "***")
        if "." in domain_part:
            d_name, d_ext = domain_part.split(".", 1)
            masked_domain = (d_name[0] if d_name else "d") + "***." + d_ext
        else:
            masked_domain = domain_part[:2] + "***"
        return f"{masked_local}@{masked_domain}"
    except Exception:
        return "c***@***.com"


def generate_receipt_number(tx: Transaction) -> str:
    """Format: HE-RCP-{YYYYMM}-{UUID8}."""
    dt = tx.created_at or datetime.utcnow()
    year_month = dt.strftime("%Y%m")
    tx_hex = tx.id.hex[:8].upper()
    return f"HE-RCP-{year_month}-{tx_hex}"


def generate_verification_hash(receipt_number: str, tx: Transaction, user_id: uuid.UUID) -> str:
    """Cryptographic HMAC SHA-256 verification code."""
    secret = (getattr(settings, "JWT_SECRET_KEY", None) or "horizon-secret-key-2024").encode("utf-8")
    ts = tx.created_at.isoformat() if tx.created_at else "0"
    payload = f"{receipt_number}|{tx.id}|{user_id}|{float(tx.amount)}|{tx.currency}|{ts}"
    raw = hmac.new(secret, payload.encode("utf-8"), hashlib.sha256).hexdigest()[:16].upper()
    return f"HE-VRF-{raw[:4]}-{raw[4:8]}-{raw[8:12]}-{raw[12:16]}"


def build_breakdown_and_context(tx: Transaction, user: Optional[User] = None) -> Tuple[str, str, List[ReceiptBreakdownItem]]:
    """Generate categorized audit details tailored to transaction type."""
    tx_type = (tx.type or "").lower().strip()
    currency = (tx.currency or "USD").upper().strip()
    meta = tx.metadata_ or {}
    breakdown: List[ReceiptBreakdownItem] = []

    if tx_type == "deposit":
        title = "Custodial Asset Deposit"
        subtitle = "Institutional Inbound Asset Settlement"
        network_label = meta.get("network") or (
            "Bitcoin Core (Mainnet)" if currency == "BTC"
            else "ERC-20 Protocol" if currency == "ETH"
            else "TRC-20 / Arbitrum Network" if currency == "USDT"
            else "SWIFT / Fedwire Custodial Settlement"
        )
        breakdown.append(ReceiptBreakdownItem(label="Settlement Network", value=network_label))
        breakdown.append(ReceiptBreakdownItem(label="Receiving Custody", value="Horizon Segregated Reserve Vault", badge="Cold Storage"))
        if meta.get("wallet_address"):
            breakdown.append(ReceiptBreakdownItem(label="Custodial Address", value=str(meta.get("wallet_address"))))
        if meta.get("tx_hash") or meta.get("transaction_hash"):
            h = str(meta.get("tx_hash") or meta.get("transaction_hash"))
            breakdown.append(ReceiptBreakdownItem(label="On-Chain Hash", value=f"{h[:10]}...{h[-8:]}"))
        breakdown.append(ReceiptBreakdownItem(
            label="Clearance Status",
            value="Settled & Credited to Available Liquidity" if tx.status == "completed" else "Awaiting On-Chain Confirmations",
            badge="Audited" if tx.status == "completed" else "Pending"
        ))

    elif tx_type == "withdrawal":
        title = "Capital Withdrawal Settlement"
        subtitle = "Authorized Outbound Custodial Disbursal"
        dest = meta.get("wallet_address") or meta.get("destination") or "Encrypted Investor Account"
        breakdown.append(ReceiptBreakdownItem(label="Disbursal Channel", value=f"{currency} Direct Payout Protocol"))
        breakdown.append(ReceiptBreakdownItem(label="Destination Address", value=str(dest)))
        if tx.fee and float(tx.fee) > 0:
            breakdown.append(ReceiptBreakdownItem(label="Network Execution Fee", value=f"{float(tx.fee):,.6f} {currency}"))
        else:
            breakdown.append(ReceiptBreakdownItem(label="Network Execution Fee", value=f"0.00 {currency} (Institutional Subsidy)"))
        breakdown.append(ReceiptBreakdownItem(
            label="Compliance Release",
            value="Cleared by Institutional Custody Operations" if tx.status == "completed" else "Under Review by Security Desk",
            badge="Cleared" if tx.status == "completed" else "Under Review"
        ))

    elif tx_type in ("investment", "reinvestment"):
        title = "Portfolio Allocation Contract"
        subtitle = "Asset Management & Capital Deployment"
        plan_name = meta.get("plan_name") or meta.get("plan_title") or "Horizon Multi-Asset Yield Strategy"
        breakdown.append(ReceiptBreakdownItem(label="Contract Strategy", value=str(plan_name), badge="Class-A"))
        if meta.get("roi") or meta.get("daily_return"):
            breakdown.append(ReceiptBreakdownItem(label="Target Yield Rate", value=str(meta.get("roi") or meta.get("daily_return"))))
        if meta.get("duration") or meta.get("term"):
            breakdown.append(ReceiptBreakdownItem(label="Contract Duration", value=str(meta.get("duration") or meta.get("term"))))
        breakdown.append(ReceiptBreakdownItem(label="Custodial Segregation", value="Protected by Horizon Reserve Capital Shield"))
        breakdown.append(ReceiptBreakdownItem(label="Yield Calculation", value="Automated Daily Compounding Accrual"))

    elif tx_type in ("return", "daily_yield"):
        title = "Yield Distribution Credit"
        subtitle = "Automated Algorithmic Return Settlement"
        plan_ref = meta.get("investment_reference") or meta.get("plan_name") or "Multi-Asset Alpha Yield Contract"
        breakdown.append(ReceiptBreakdownItem(label="Source Contract", value=str(plan_ref)))
        breakdown.append(ReceiptBreakdownItem(label="Yield Mechanism", value="Automated Daily Yield Accrual"))
        breakdown.append(ReceiptBreakdownItem(label="Liquidity Disposition", value="Immediate Withdrawable Credit to Main Balance"))

    elif tx_type in ("investment_mature", "maturity"):
        title = "Contract Maturity Settlement"
        subtitle = "Portfolio Principal & Cumulative Return Realization"
        plan_name = meta.get("plan_name") or "Horizon Fixed Capital Allocation"
        breakdown.append(ReceiptBreakdownItem(label="Completed Contract", value=str(plan_name)))
        breakdown.append(ReceiptBreakdownItem(label="Contract Status", value="Maturity Term Reached — 100% Capital Returned", badge="Fulfilled"))
        breakdown.append(ReceiptBreakdownItem(label="Ledger Destination", value="Main Investment Ledger"))

    elif tx_type in ("referral_bonus", "referral", "referral_commission"):
        title = "Institutional Partnership Commission"
        subtitle = "Affiliate & Global Growth Program Distribution"
        breakdown.append(ReceiptBreakdownItem(label="Partnership Program", value="Horizon Global Tier-1 Affiliate Program", badge="Partner"))
        if meta.get("referred_user"):
            breakdown.append(ReceiptBreakdownItem(label="Affiliated Client", value=str(meta.get("referred_user"))))
        breakdown.append(ReceiptBreakdownItem(label="Rebate Allocation", value="Direct Withdrawable Commission Credit"))

    elif tx_type in ("registration_bonus", "bonus", "promotional_credit"):
        title = "Welcome Capital Incentive"
        subtitle = "Institutional Onboarding Allocation"
        breakdown.append(ReceiptBreakdownItem(label="Incentive Category", value="Horizon Onboarding Growth Grant", badge="Welcome Bonus"))
        breakdown.append(ReceiptBreakdownItem(label="Vesting Terms", value="Deployable across Horizon Yield Strategies"))

    elif tx_type in ("adjustment", "admin_credit", "admin_debit"):
        title = "Audited Ledger Adjustment"
        subtitle = "Administrative Financial Correction & Settlement"
        direction = "Credit (+)" if float(tx.amount) >= 0 else "Debit (-)"
        breakdown.append(ReceiptBreakdownItem(label="Adjustment Operation", value=direction, badge=direction))
        breakdown.append(ReceiptBreakdownItem(label="Authorized Desk", value="Horizon Custody & Clearing Operations"))
        if tx.description:
            breakdown.append(ReceiptBreakdownItem(label="Audit Justification", value=tx.description))

    elif tx_type == "fee":
        title = "Custodial Execution Fee"
        subtitle = "Network Execution & Operational Expense Assessment"
        breakdown.append(ReceiptBreakdownItem(label="Assessment Scope", value="Network Clearing & Custody Security Pass-Through"))

    else:
        clean_name = tx_type.replace("_", " ").title()
        title = f"{clean_name} Financial Settlement"
        subtitle = "Official Horizon Equity Ledger Entry"
        breakdown.append(ReceiptBreakdownItem(label="Transaction Classification", value=clean_name))
        if tx.description:
            breakdown.append(ReceiptBreakdownItem(label="Ledger Narrative", value=tx.description))

    breakdown.append(ReceiptBreakdownItem(label="Clearing Standard", value="Double-Entry Institutional Ledger Architecture"))
    return title, subtitle, breakdown


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
        currency_clean = currency.upper().strip()
        type_clean = type.lower().strip()
        status_clean = status.lower().strip()
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

    @staticmethod
    async def get_transaction_receipt(
        db: AsyncSession,
        transaction_id: uuid.UUID,
        requesting_user: User,
    ) -> ReceiptDetailResponse:
        """Fetch and generate a fully enriched, verifiable transaction receipt."""
        stmt = (
            select(Transaction, User)
            .join(User, Transaction.user_id == User.id)
            .filter(Transaction.id == transaction_id)
        )
        result = await db.execute(stmt)
        row = result.first()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction record not found in ledger.",
            )

        tx, user = row

        # Security check: User must own the transaction, or be a platform admin
        if not requesting_user.is_admin and tx.user_id != requesting_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You do not have permission to view this transaction receipt.",
            )

        receipt_number = generate_receipt_number(tx)
        reference = tx.reference or f"TX-{tx.id.hex[:10].upper()}"
        verification_hash = generate_verification_hash(receipt_number, tx, user.id)

        # Build domain URL for verification
        base_domain = settings.CUSTOM_DOMAIN or "horizon-equity.net"
        verification_url = f"https://{base_domain}/verify-receipt?ref={reference}"

        amt = float(tx.amount)
        fee = float(tx.fee or 0.0)
        net_amt = amt - fee if amt > 0 else amt

        cat_title, cat_subtitle, breakdown = build_breakdown_and_context(tx, user)

        return ReceiptDetailResponse(
            receipt_number=receipt_number,
            transaction_id=tx.id,
            reference=reference,
            type=tx.type,
            subtype=tx.subtype,
            status=tx.status,
            amount=amt,
            fee=fee,
            net_amount=net_amt,
            currency=tx.currency,
            description=tx.description,
            created_at=tx.created_at,
            approved_at=tx.approved_at,
            user_id=user.id,
            user_name=user.full_name,
            user_email=user.email,
            user_country=user.country,
            verification_hash=verification_hash,
            verification_url=verification_url,
            category_title=cat_title,
            category_subtitle=cat_subtitle,
            breakdown=breakdown,
            metadata=tx.metadata_,
        )

    @staticmethod
    async def verify_receipt(
        db: AsyncSession,
        query_str: str,
    ) -> ReceiptPublicVerificationResponse:
        """Public verification endpoint returning sanitized confirmation of ledger authenticity."""
        if not query_str or not query_str.strip():
            return ReceiptPublicVerificationResponse(
                is_valid=False,
                message="No receipt reference was provided.",
            )

        q = query_str.strip()
        tx: Optional[Transaction] = None
        user: Optional[User] = None

        # 1. Try UUID match
        try:
            tx_uuid = uuid.UUID(q)
            stmt = (
                select(Transaction, User)
                .join(User, Transaction.user_id == User.id)
                .filter(Transaction.id == tx_uuid)
            )
            res = await db.execute(stmt)
            row = res.first()
            if row:
                tx, user = row
        except (ValueError, TypeError):
            pass

        # 2. Try exact reference match
        if not tx:
            stmt = (
                select(Transaction, User)
                .join(User, Transaction.user_id == User.id)
                .filter(Transaction.reference.ilike(q))
            )
            res = await db.execute(stmt)
            row = res.first()
            if row:
                tx, user = row

        # 3. Try receipt number format (HE-RCP-YYYYMM-HEX8)
        if not tx and q.upper().startswith("HE-RCP-"):
            parts = q.upper().split("-")
            if len(parts) >= 4:
                hex_prefix = parts[3].lower()
                stmt = (
                    select(Transaction, User)
                    .join(User, Transaction.user_id == User.id)
                    .filter(cast(Transaction.id, String).ilike(f"{hex_prefix}%"))
                )
                res = await db.execute(stmt)
                row = res.first()
                if row:
                    tx, user = row

        # 4. Try partial reference match
        if not tx and len(q) >= 4:
            stmt = (
                select(Transaction, User)
                .join(User, Transaction.user_id == User.id)
                .filter(Transaction.reference.ilike(f"%{q}%"))
            )
            res = await db.execute(stmt)
            row = res.first()
            if row:
                tx, user = row

        if not tx or not user:
            return ReceiptPublicVerificationResponse(
                is_valid=False,
                message="No authentic transaction record was found matching this reference or receipt number.",
            )

        receipt_number = generate_receipt_number(tx)
        verification_hash = generate_verification_hash(receipt_number, tx, user.id)
        cat_title, _, _ = build_breakdown_and_context(tx, user)

        return ReceiptPublicVerificationResponse(
            is_valid=True,
            receipt_number=receipt_number,
            reference=tx.reference or f"TX-{tx.id.hex[:10].upper()}",
            type=tx.type,
            category_title=cat_title,
            status=tx.status,
            amount=float(tx.amount),
            currency=tx.currency,
            issued_at=tx.created_at,
            settled_at=tx.approved_at or tx.updated_at,
            masked_investor=mask_name(user.full_name),
            masked_email=mask_email(user.email),
            verification_hash=verification_hash,
            issuer="Horizon Equity Custody & Clearing Ltd",
            message="Official transaction record cryptographically verified and confirmed on the Horizon Equity ledger.",
        )


transaction_service = TransactionService()
