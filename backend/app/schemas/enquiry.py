from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CardScanResponse(BaseModel):
    confidence_score: float = Field(..., description="Extraction confidence score (0-100%)")
    tier_used: str = Field(..., description="'Tier-1 Regex/Heuristics' or 'Tier-2 Vision LLM'")
    company_name: str
    contact_person: str
    designation: str
    email: str
    phone: str
    plant_location: str
    gstin: Optional[str] = None
    industry_sector: str
    raw_ocr_text: Optional[str] = None

class EnquiryCreate(BaseModel):
    id: Optional[str] = None  # auto-generated if omitted
    company_name: str
    contact_person: str
    designation: Optional[str] = "Purchase / Plant Head"
    email: str
    phone: str
    plant_location: str
    gstin: Optional[str] = None
    industry_sector: Optional[str] = "Manufacturing"
    branch_region: Optional[str] = "Noida HQ"
    assigned_engineer: Optional[str] = "Rajesh Sharma"
    status: Optional[str] = "ACTIVE_QUOTATION"

class EnquiryUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    designation: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    plant_location: Optional[str] = None
    gstin: Optional[str] = None
    industry_sector: Optional[str] = None
    branch_region: Optional[str] = None
    assigned_engineer: Optional[str] = None
    status: Optional[str] = None

class EnquiryResponse(BaseModel):
    id: str
    company_name: str
    contact_person: str
    designation: str
    email: str
    phone: str
    plant_location: str
    gstin: Optional[str] = None
    industry_sector: str
    branch_region: str
    assigned_engineer: str
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

