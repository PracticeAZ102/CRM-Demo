from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CampaignCreate(BaseModel):
    name: str
    city: str
    venue: str
    start_date: str
    end_date: str
    budget: float = 0.0
    target_leads: int = 50
    status: str = "ACTIVE"

class CampaignResponse(BaseModel):
    id: int
    name: str
    city: str
    venue: str
    start_date: str
    end_date: str
    budget: float
    target_leads: int
    leads_generated: int
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AppointmentCreate(BaseModel):
    company_name: str
    contact_person: str
    phone: str
    city: Optional[str] = "Delhi/NCR"
    visit_date: str
    visit_time: Optional[str] = "11:00 AM"
    purpose: Optional[str] = "Air Audit & Compressor Sizing"
    notes: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: int
    company_name: str
    contact_person: str
    phone: str
    city: str
    visit_date: str
    visit_time: str
    purpose: str
    status: str
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SalesTargetResponse(BaseModel):
    id: int
    financial_year: str
    month: str
    target_units: int
    achieved_units: int
    target_revenue: float
    achieved_revenue: float

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_enquiries: int
    active_quotes: int
    pending_ofm_count: int
    released_ofm_count: int
    total_models: int
    upcoming_appointments: int
    active_campaigns: int
    mtd_target_units: int
    mtd_achieved_units: int
