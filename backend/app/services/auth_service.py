# ============================================
# HORIZON EQUITY - AUTHENTICATION SERVICE
# ============================================

import uuid
import logging
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from jose import jwt, JWTError

from app.core.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from decimal import Decimal
from app.models.user import User
from app.models.wallet import Wallet
from app.models.session_token import SessionToken
from app.models.audit_log import AuditLog
from app.models.registration_bonus import RegistrationBonus
from app.models.transaction import Transaction
from app.schemas.user import UserCreate
from app.schemas.auth import Token
from app.services.email_service import email_service
from app.services.notification_service import notification_service
from app.tasks.email_tasks import send_verification_email_task, send_password_reset_email_task


logger = logging.getLogger("horizon.auth")


class AuthService:
    """Business logic for authentication, registration, password resets, and session management."""

    @staticmethod
    def _generate_referral_code() -> str:
        """Generate a unique referral code format HE-XXXXXX."""
        return f"HE-{str(uuid.uuid4())[:8].upper()}"

    async def register_user(
        self, db: AsyncSession, user_in: UserCreate, ip_address: Optional[str] = None, user_agent: Optional[str] = None
    ) -> User:
        """Register a new user, auto-creating their crypto wallets and logging audit trails."""
        # 1. Normalize and check if user already exists
        email_clean = user_in.email.strip().lower()
        user_in.email = email_clean
        existing_user_result = await db.execute(select(User).filter(func.lower(User.email) == email_clean))
        if existing_user_result.scalars().first() is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists.",
            )

        # 2. Check referral code if provided
        referred_by_id = None
        referrer = None
        if user_in.referred_by_code:
            referrer_result = await db.execute(
                select(User).filter(User.referral_code == user_in.referred_by_code)
            )
            referrer = referrer_result.scalars().first()
            if referrer:
                referred_by_id = referrer.id
                referrer.referral_count += 1
                db.add(referrer)

        # 3. Create the user
        referral_code = self._generate_referral_code()
        hashed = hash_password(user_in.password)

        new_user = User(
            email=user_in.email,
            password_hash=hashed,
            full_name=user_in.full_name,
            phone=user_in.phone,
            country=user_in.country,
            city=user_in.city,
            address=user_in.address,
            btc_wallet=user_in.btc_wallet,
            usdt_wallet=user_in.usdt_wallet,
            eth_wallet=user_in.eth_wallet,
            sol_wallet=user_in.sol_wallet,
            referral_code=referral_code,
            referred_by=referred_by_id,
            email_verified=False,
            is_active=True,
            is_admin=False,
        )

        db.add(new_user)
        # Flush to generate new_user.id for wallets and audits
        await db.flush()

        # 4. Auto-create user cryptocurrency wallets (BTC, ETH, USDT, SOL)
        for currency in ["BTC", "ETH", "USDT", "SOL"]:
            initial_balance = Decimal("5.00") if currency == "USDT" else Decimal("0.0")
            wallet = Wallet(
                user_id=new_user.id,
                currency=currency,
                balance=initial_balance,
                frozen_balance=Decimal("0.0"),
                total_deposited=Decimal("0.0"),
                total_withdrawn=Decimal("0.0"),
            )
            db.add(wallet)

        # 5. Award $5 Promotional Registration Bonus (Locked until qualifying investment)
        bonus = RegistrationBonus(
            user_id=new_user.id,
            amount=Decimal("5.00"),
            currency="USDT",
            status="locked",
            awarded_at=datetime.utcnow(),
            notes="Awarded upon initial account registration. Requires qualifying investment (e.g. Silver Plan) to unlock.",
        )
        db.add(bonus)

        # 6. Log transaction ledger entry for the bonus
        bonus_tx = Transaction(
            user_id=new_user.id,
            type="registration_bonus",
            subtype="promotional_credit",
            amount=Decimal("5.00"),
            fee=Decimal("0.0"),
            currency="USDT",
            status="completed",
            reference=f"BONUS-{new_user.id.hex[:8].upper()}",
            description="Welcome promotional credit ($5.00 USDT). Locked until completing first qualifying investment.",
        )
        db.add(bonus_tx)

        # 7. Notify user
        await notification_service.create_notification(
            db,
            user_id=new_user.id,
            type="system",
            title="$5 Welcome Bonus Credited",
            message="You received a $5.00 USDT promotional welcome credit! Complete your first investment (e.g. Silver Plan) to unlock this bonus for withdrawal.",
        )

        # 8. Log audit trail

        audit = AuditLog(
            user_id=new_user.id,
            action="user_registered",
            entity_type="user",
            entity_id=new_user.id,
            ip_address=ip_address,
            user_agent=user_agent,
            new_values={
                "email": new_user.email,
                "full_name": new_user.full_name,
                "referred_by": str(referred_by_id) if referred_by_id else None,
            },
        )
        db.add(audit)

        # 6. Send verification email (mocked)
        verification_token = jwt.encode(
            {"exp": datetime.utcnow() + timedelta(hours=24), "sub": str(new_user.id), "type": "verify_email"},
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM,
        )
        try:
            send_verification_email_task.delay(new_user.email, verification_token)
        except Exception as e:
            logger.warning(f"Failed to queue verification email task: {e}")

        await db.commit()
        await db.refresh(new_user)
        return new_user

    async def authenticate_user(
        self, db: AsyncSession, email: str, password: str, ip_address: Optional[str] = None, user_agent: Optional[str] = None
    ) -> User:
        """Authenticate user credentials, managing failed attempts and account locks."""
        # 1. Fetch user (case-insensitive & stripped)
        email_clean = email.strip().lower()
        result = await db.execute(select(User).filter(func.lower(User.email) == email_clean))
        user = result.scalars().first()

        if user is None:
            # Prevent user enumeration timing attacks by doing a dummy check
            hash_password(password)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
            )

        # 2. Check if account is locked
        if user.locked_until and user.locked_until > datetime.utcnow():
            remaining_time = int((user.locked_until - datetime.utcnow()).total_seconds() / 60)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Account is temporarily locked. Try again in {remaining_time} minutes.",
            )

        # 3. Verify password
        if not verify_password(password, user.password_hash):
            # Increment failed attempts
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= settings.MAX_LOGIN_ATTEMPTS:
                user.locked_until = datetime.utcnow() + timedelta(minutes=settings.LOCKOUT_DURATION_MINUTES)
                logger.warning(f"Account locked: {user.email} from IP {ip_address}")

            db.add(user)
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
            )

        # 4. Check status
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated. Please contact support.",
            )

        if user.is_suspended:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Your account is suspended. Reason: {user.suspension_reason or 'No reason specified'}",
            )

        # 5. Reset login attempts & update last login
        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login = datetime.utcnow()
        user.login_ip = ip_address
        db.add(user)

        # Log audit trail
        audit = AuditLog(
            user_id=user.id,
            action="user_login",
            entity_type="user",
            entity_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        db.add(audit)

        await db.commit()
        await db.refresh(user)
        return user

    async def create_session(self, db: AsyncSession, user_id: uuid.UUID) -> Token:
        """Create access & refresh tokens and save refresh token session to the database."""
        access_token = create_access_token(subject=user_id)
        refresh_token = create_refresh_token(subject=user_id)

        # Calculate expires_at for refresh token
        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        # Save session token to DB
        session_token = SessionToken(
            user_id=user_id,
            token=refresh_token,
            expires_at=expires_at,
            revoked=False,
        )
        db.add(session_token)
        await db.commit()

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
        )

    async def refresh_session(self, db: AsyncSession, refresh_token: str) -> Token:
        """Validate refresh token and issue new access & refresh tokens (Refresh Token Rotation)."""
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

        payload = decode_token(refresh_token)
        if payload is None:
            raise credentials_exception

        user_id_str: str = payload.get("sub")
        token_type: str = payload.get("type")

        if user_id_str is None or token_type != "refresh":
            raise credentials_exception

        try:
            user_id = uuid.UUID(user_id_str)
        except ValueError:
            raise credentials_exception

        # Find session in database
        result = await db.execute(
            select(SessionToken).filter(
                SessionToken.user_id == user_id,
                SessionToken.token == refresh_token,
                SessionToken.revoked == False,
                SessionToken.expires_at > datetime.utcnow(),
            )
        )
        session = result.scalars().first()
        if session is None:
            raise credentials_exception

        # Revoke old session token
        session.revoked = True
        session.revoked_at = datetime.utcnow()
        db.add(session)

        # Generate new session tokens
        new_access_token = create_access_token(subject=user_id)
        new_refresh_token = create_refresh_token(subject=user_id)
        new_expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        new_session = SessionToken(
            user_id=user_id,
            token=new_refresh_token,
            expires_at=new_expires_at,
            revoked=False,
        )
        db.add(new_session)

        await db.commit()
        return Token(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
        )

    async def revoke_session(self, db: AsyncSession, refresh_token: str) -> bool:
        """Revoke a session (logout)."""
        result = await db.execute(
            select(SessionToken).filter(SessionToken.token == refresh_token, SessionToken.revoked == False)
        )
        session = result.scalars().first()
        if session:
            session.revoked = True
            session.revoked_at = datetime.utcnow()
            db.add(session)
            await db.commit()
            return True
        return False

    async def verify_email_token(self, db: AsyncSession, token: str) -> bool:
        """Verify user's email address using their verification token."""
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token.",
            )

        user_id_str = payload.get("sub")
        token_type = payload.get("type")

        if not user_id_str or token_type != "verify_email":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token payload.",
            )

        user_id = uuid.UUID(user_id_str)
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found.",
            )

        if user.email_verified:
            return True

        user.email_verified = True
        db.add(user)

        # Log audit
        audit = AuditLog(
            user_id=user.id,
            action="email_verified",
            entity_type="user",
            entity_id=user.id,
        )
        db.add(audit)

        await db.commit()
        return True

    async def request_password_reset(self, db: AsyncSession, email: str) -> bool:
        """Send password reset verification email (mocked) to a user."""
        result = await db.execute(select(User).filter(User.email == email))
        user = result.scalars().first()

        if user is None:
            # Return true to prevent email enumeration
            return True

        # Generate password reset token (valid for 1 hour)
        reset_token = jwt.encode(
            {"exp": datetime.utcnow() + timedelta(hours=1), "sub": str(user.id), "type": "reset_password"},
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM,
        )

        try:
            send_password_reset_email_task.delay(user.email, reset_token)
        except Exception as e:
            logger.warning(f"Failed to queue password reset email task: {e}")
        return True

    async def reset_password_with_token(self, db: AsyncSession, token: str, new_password: str) -> bool:
        """Validate reset token and set a new password for the user."""
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token.",
            )

        user_id_str = payload.get("sub")
        token_type = payload.get("type")

        if not user_id_str or token_type != "reset_password":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token payload.",
            )

        user_id = uuid.UUID(user_id_str)
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found.",
            )

        # Reset password
        user.password_hash = hash_password(new_password)
        user.failed_login_attempts = 0
        user.locked_until = None
        db.add(user)

        # Revoke all sessions on password reset for security
        sessions_result = await db.execute(
            select(SessionToken).filter(SessionToken.user_id == user.id, SessionToken.revoked == False)
        )
        for s in sessions_result.scalars().all():
            s.revoked = True
            s.revoked_at = datetime.utcnow()
            db.add(s)

        # Log audit
        audit = AuditLog(
            user_id=user.id,
            action="password_reset",
            entity_type="user",
            entity_id=user.id,
        )
        db.add(audit)

        await db.commit()
        return True


auth_service = AuthService()
