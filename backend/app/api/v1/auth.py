# ============================================
# HORIZON EQUITY - AUTHENTICATION ENDPOINTS
# ============================================

from fastapi import APIRouter, Depends, Request, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import (
    UserLogin,
    Token,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    RefreshTokenRequest,
    VerifyEmailRequest,
)
from app.services.auth_service import auth_service
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: Request,
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user and initialize their cryptocurrency wallets."""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    user = await auth_service.register_user(db, user_in, ip_address, user_agent)
    return user


@router.post("/login", response_model=Token)
async def login(
    request: Request,
    login_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """Login user credentials and return access and refresh JWT tokens."""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    user = await auth_service.authenticate_user(
        db, email=login_data.email, password=login_data.password, ip_address=ip_address, user_agent=user_agent
    )
    return await auth_service.create_session(db, user.id)


@router.post("/refresh", response_model=Token)
async def refresh(
    body: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """Validate a refresh token and return a new rotated token pair."""
    return await auth_service.refresh_session(db, body.refresh_token)


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    body: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """Revoke user's refresh token and end the active session."""
    revoked = await auth_service.revoke_session(db, body.refresh_token)
    if not revoked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session already revoked or invalid token."
        )
    return {"detail": "Successfully logged out."}


@router.post("/verify-email", status_code=status.HTTP_200_OK)
async def verify_email(
    body: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db)
):
    """Verify a user's email address using their verification token."""
    await auth_service.verify_email_token(db, body.token)
    return {"detail": "Email verified successfully."}


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(
    body: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Request a password reset email."""
    await auth_service.request_password_reset(db, body.email)
    return {"detail": "If the email exists, a password reset link has been sent."}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(
    body: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Reset user's password using password reset token."""
    await auth_service.reset_password_with_token(db, body.token, body.new_password)
    return {"detail": "Password has been reset successfully."}


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    """Retrieve details of the currently logged-in user."""
    return current_user
