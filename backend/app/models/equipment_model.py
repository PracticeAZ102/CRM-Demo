from sqlalchemy import Column, String, Float, Boolean, DateTime
from datetime import datetime, timezone
from app.core.database import Base

class EquipmentModel(Base):
    """
    Equipment Model Master Table strictly matching the 10-column schema from Models Input.jpg:
    PRKEY, IDESC, Motor, Type, Brand, VSD / FS, MaXimum Pressure, FAD (cfm), Dimension, CLP
    """
    __tablename__ = "equipment_models"

    prkey = Column(String(100), primary_key=True, index=True)         # Primary Product Key / Model SKU
    idesc = Column(String(500), nullable=False)                         # Item Description
    motor = Column(String(100), nullable=False)                         # Motor Rating (kW / HP)
    type = Column(String(100), nullable=False, index=True)              # Equipment Category
    brand = Column(String(100), nullable=False, index=True)             # OEM Brand (Chicago Pneumatic, Gem, ATCORP)
    vsd_fs = Column(String(50), nullable=False, index=True)             # Drive: VSD | FS | N/A
    maximum_pressure = Column(String(100), nullable=False)              # Maximum Working Pressure (bar / psi)
    fad_cfm = Column(String(100), nullable=False)                       # Free Air Delivery (cfm / flow)
    dimension = Column(String(200), nullable=False)                     # Physical Footprint L x W x H mm
    clp = Column(Float, nullable=False)                                 # Company List Price in ₹ INR

    # System governance fields
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<EquipmentModel {self.prkey} - {self.brand} - ₹{self.clp}>"

