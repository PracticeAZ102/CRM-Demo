from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class QuotationCalculateRequest(BaseModel):
    prkey: str
    quantity: int = Field(default=1, ge=1)
    discount_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    packaging_pct: float = Field(default=2.0, ge=0.0)
    freight_terms: str = Field(default="Ex-Works")  # Ex-Works or FOR Destination
    freight_amount: float = Field(default=0.0, ge=0.0)
    installation_charges: float = Field(default=15000.0, ge=0.0)
    gst_type: str = Field(default="IGST")  # IGST or CGST_SGST

class QuotationCalculateResponse(BaseModel):
    base_clp: float
    unit_discount_amount: float
    net_unit_price: float
    total_base: float
    total_discount: float
    discount_approval_status: str  # APPROVED or PENDING_APPROVAL
    packaging_amount: float
    freight_amount: float
    installation_charges: float
    taxable_value: float
    gst_rate: float
    gst_amount: float
    total_value: float
    win_probability_pct: int

class QuotationCreate(BaseModel):
    enquiry_id: str
    prkey: str
    quantity: int = Field(default=1, ge=1)
    discount_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    packaging_pct: float = Field(default=2.0, ge=0.0)
    freight_terms: str = Field(default="Ex-Works")
    freight_amount: float = Field(default=0.0, ge=0.0)
    installation_charges: float = Field(default=15000.0, ge=0.0)
    gst_type: str = Field(default="IGST")
    payment_terms: Optional[str] = "20% Advance with PO, balance 80% against Proforma Invoice prior to dispatch"
    delivery_weeks: Optional[str] = "2 to 3 Weeks from confirmed PO & GA clearance"
    notes: Optional[str] = None

class QuotationUpdate(BaseModel):
    quantity: Optional[int] = Field(None, ge=1)
    discount_pct: Optional[float] = Field(None, ge=0.0, le=100.0)
    packaging_pct: Optional[float] = Field(None, ge=0.0)
    freight_terms: Optional[str] = None
    freight_amount: Optional[float] = None
    installation_charges: Optional[float] = None
    gst_type: Optional[str] = None
    payment_terms: Optional[str] = None
    delivery_weeks: Optional[str] = None
    notes: Optional[str] = None

class EquipmentModelBrief(BaseModel):
    prkey: str
    idesc: str
    motor: str
    type: str
    brand: str
    vsd_fs: str
    maximum_pressure: str
    fad_cfm: str
    dimension: str
    clp: float

    class Config:
        from_attributes = True

class QuotationResponse(BaseModel):
    id: str
    quote_number: str
    enquiry_id: str
    revision_no: int
    prkey: str
    quantity: int
    base_clp: float
    discount_pct: float
    discount_amount: float
    discount_approval_status: str
    packaging_pct: float
    packaging_amount: float
    freight_terms: str
    freight_amount: float
    installation_charges: float
    taxable_value: float
    gst_type: str
    gst_rate: float
    gst_amount: float
    total_value: float
    payment_terms: str
    delivery_weeks: str
    warranty_months: int
    validity_days: int
    ga_drawing_id: str
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    equipment_model: Optional[EquipmentModelBrief] = None

    class Config:
        from_attributes = True

