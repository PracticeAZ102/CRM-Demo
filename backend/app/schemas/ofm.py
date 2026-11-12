from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.schemas.enquiry import EnquiryResponse
from app.schemas.quotation import QuotationResponse

class OFMUpdate(BaseModel):
    customer_po_number: Optional[str] = None
    customer_po_date: Optional[str] = None
    customer_po_value: Optional[float] = None
    committed_dispatch_date: Optional[str] = None
    paint_shade: Optional[str] = None
    electrical_supply: Optional[str] = None
    air_discharge_nozzle: Optional[str] = None
    special_factory_instructions: Optional[str] = None

class OFMFreezeRequest(BaseModel):
    customer_po_number: str
    customer_po_date: str
    customer_po_value: float
    po_value_verified: bool = True
    tech_specs_verified: bool = True
    payment_terms_verified: bool = True
    ga_drawing_cleared: bool = True
    committed_dispatch_date: str
    approved_by: Optional[str] = "Rajesh Sharma (Admin)"

class OFMResponse(BaseModel):
    id: str
    ofm_number: str
    enquiry_id: str
    quotation_id: str
    revision_no: int
    customer_po_number: Optional[str] = None
    customer_po_date: Optional[str] = None
    customer_po_value: Optional[float] = None
    po_value_verified: bool
    tech_specs_verified: bool
    payment_terms_verified: bool
    ga_drawing_cleared: bool
    committed_dispatch_date: Optional[str] = None
    paint_shade: str
    electrical_supply: str
    air_discharge_nozzle: str
    special_factory_instructions: Optional[str] = None
    status: str
    is_frozen: bool
    frozen_at: Optional[datetime] = None
    frozen_by: Optional[str] = None
    created_at: Optional[datetime] = None
    enquiry: Optional[EnquiryResponse] = None
    quotation: Optional[QuotationResponse] = None

    class Config:
        from_attributes = True

