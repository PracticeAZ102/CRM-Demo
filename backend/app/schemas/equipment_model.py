from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class EquipmentModelBase(BaseModel):
    prkey: str = Field(..., description="Primary Product Code SKU e.g. CP-CPM-15-FS-8")
    idesc: str = Field(..., description="Full Item Description")
    motor: str = Field(..., description="Motor rating in kW / HP")
    type: str = Field(..., description="Equipment Category e.g. Screw Compressor, Air Dryer, Process Chiller")
    brand: str = Field(..., description="Brand name e.g. Chicago Pneumatic, Gem Equipments, ATCORP Prime")
    vsd_fs: str = Field(..., description="Drive configuration: VSD, FS, or N/A")
    maximum_pressure: str = Field(..., description="Working pressure e.g. 8.0 bar, 10.0 bar")
    fad_cfm: str = Field(..., description="Free Air Delivery flow e.g. 78.4 cfm")
    dimension: str = Field(..., description="Physical footprint L x W x H in mm")
    clp: float = Field(..., ge=0, description="Company List Price in ₹ INR (exclusive of taxes)")

class EquipmentModelCreate(EquipmentModelBase):
    pass

class EquipmentModelUpdate(BaseModel):
    idesc: Optional[str] = None
    motor: Optional[str] = None
    type: Optional[str] = None
    brand: Optional[str] = None
    vsd_fs: Optional[str] = None
    maximum_pressure: Optional[str] = None
    fad_cfm: Optional[str] = None
    dimension: Optional[str] = None
    clp: Optional[float] = Field(None, ge=0)
    is_active: Optional[bool] = None

class EquipmentModelResponse(EquipmentModelBase):
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ModelFilterParams(BaseModel):
    search: Optional[str] = None
    brand: Optional[str] = None
    type: Optional[str] = None
    vsd_fs: Optional[str] = None
    min_clp: Optional[float] = None
    max_clp: Optional[float] = None

