# ============================================
# HORIZON EQUITY - KYC VERIFICATION SCHEMAS
# ============================================

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class KycSubmissionRequest(BaseModel):
    document_type: str = Field(..., description="Passport, National ID, Driver's License")
    document_number: str = Field(..., min_length=4, max_length=50)
    full_legal_name: str = Field(..., min_length=2, max_length=150)
    date_of_birth: str = Field(..., description="YYYY-MM-DD")
    nationality: Optional[str] = None
    front_document: Optional[str] = Field(None, description="Document image or upload reference")
    back_document: Optional[str] = Field(None, description="Back image if applicable")
    selfie_proof: Optional[str] = Field(None, description="Selfie holding document or proof")


class KycStatusResponse(BaseModel):
    status: str  # not_started, pending, under_review, verified, rejected, requires_info
    submitted_at: Optional[datetime] = None
    verified_at: Optional[datetime] = None
    submission_data: Optional[Dict[str, Any]] = None
    rejection_reason: Optional[str] = None
    instructions: str
