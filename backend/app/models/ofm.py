from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class OFMRecord(Base):
    """
    Order Finalization Memorandum (OFM)
    Serves as the commercial & technical binding handoff between Sales/Dealer and the Factory floor (PPC).
    Editable through multiple revisions (Rev-01, Rev-02) during dealer negotiations,
    and permanently frozen once Customer PO Scrutiny is approved.
    """
    __tablename__ = "ofm_records"

    id = Column(String(100), primary_key=True, index=True)             # e.g. "OFM-43382-R01"
    ofm_number = Column(String(100), nullable=False, index=True)     # e.g. "ATCORP/OFM/2026-27/43382"
    enquiry_id = Column(String(50), ForeignKey("enquiries.id"), nullable=False, index=True)
    quotation_id = Column(String(100), ForeignKey("quotations.id"), nullable=False, index=True)
    revision_no = Column(Integer, default=1, nullable=False)

    # Customer Purchase Order (PO) Details
    customer_po_number = Column(String(100), nullable=True)          # e.g. "PO/SHANTI/2026/894"
    customer_po_date = Column(String(50), nullable=True)             # e.g. "2026-10-28"
    customer_po_value = Column(Float, nullable=True)                 # e.g. 543071.0

    # Verification Checklist Gates
    po_value_verified = Column(Boolean, default=False)
    tech_specs_verified = Column(Boolean, default=False)
    payment_terms_verified = Column(Boolean, default=False)
    ga_drawing_cleared = Column(Boolean, default=False)

    # Production Floor Engineering Customizations
    committed_dispatch_date = Column(String(50), nullable=True)      # e.g. "2026-11-20"
    paint_shade = Column(String(100), default="OEM Industrial Blue (RAL 5015)")
    electrical_supply = Column(String(100), default="415V, 3 Phase, 50Hz AC")
    air_discharge_nozzle = Column(String(100), default="1.5 inch BSP Female")
    special_factory_instructions = Column(Text, nullable=True)

    # Lifecycle Status
    # PENDING_DEALER_REVIEW -> AWAITING_PO_SCRUTINY -> FROZEN_FACTORY_RELEASE
    status = Column(String(50), default="PENDING_DEALER_REVIEW", index=True)
    is_frozen = Column(Boolean, default=False)
    frozen_at = Column(DateTime, nullable=True)
    frozen_by = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    enquiry = relationship("Enquiry")
    quotation = relationship("Quotation")

