# ============================================
# HORIZON EQUITY - AUTHENTICATION SCHEMAS
# ============================================

from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserLogin(BaseModel):
    """Schema for user login request."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for authentication token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Schema for parsed JWT token payload."""
    sub: Optional[str] = None
    type: Optional[str] = None
    exp: Optional[int] = None


class ForgotPasswordRequest(BaseModel):
    """Schema for requesting a password reset email."""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Schema for submitting a password reset."""
    token: str
    new_password: str = Field(..., min_length=6, description="New password, minimum 6 characters")


class RefreshTokenRequest(BaseModel):
    """Schema for refreshing access tokens using a refresh token."""
    refresh_token: str


class VerifyEmailRequest(BaseModel):
    """Schema for verifying email address with token."""
    token: str


class ResendVerificationRequest(BaseModel):
    """Schema for resending verification email."""
    email: EmailStr
