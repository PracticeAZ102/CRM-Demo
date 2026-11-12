from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Enquiry(Base):
    """
    Lead / Customer Enquiry Entity representing the commercial project.
    Remains permanent across all revisions of proposals and OFMs.
    """
    __tablename__ = "enquiries"

    id = Column(String(50), primary_key=True, index=True)              # e.g. "43382"
    company_name = Column(String(200), nullable=False, index=True)
    contact_person = Column(String(100), nullable=False)
    designation = Column(String(100), default="Purchase / Utility Head")
    email = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=False)
    plant_location = Column(String(300), nullable=False)
    gstin = Column(String(50), nullable=True)
    industry_sector = Column(String(100), default="Automotive / Manufacturing")
    branch_region = Column(String(100), default="Noida HQ")
    assigned_engineer = Column(String(100), default="Rajesh Sharma")
    status = Column(String(50), default="ACTIVE_QUOTATION")             # ACTIVE_QUOTATION, OFM_PENDING, OFM_RELEASED

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    quotations = relationship("Quotation", back_populates="enquiry", cascade="all, delete-orphan")


class Quotation(Base):
    """
    CPQ Commercial Proposal Entity.
    Supports revisions (Rev-01, Rev-02...) while keeping the enquiry_id constant.
    """
    __tablename__ = "quotations"

    id = Column(String(100), primary_key=True, index=True)             # e.g. "QUO-43382-R01"
    quote_number = Column(String(100), nullable=False, index=True)     # e.g. "ATCORP/QUO/2026-27/43382"
    enquiry_id = Column(String(50), ForeignKey("enquiries.id"), nullable=False, index=True)
    revision_no = Column(Integer, default=1, nullable=False)

    # Equipment Model Link
    prkey = Column(String(100), ForeignKey("equipment_models.prkey"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)

    # Pricing Breakdown (INR)
    base_clp = Column(Float, nullable=False)                            # Unit CLP from Model Master
    discount_pct = Column(Float, default=0.0)                          # e.g. 10.0 %
    discount_amount = Column(Float, default=0.0)
    discount_approval_status = Column(String(50), default="APPROVED")  # APPROVED (<=15%) or PENDING_APPROVAL (>15%)

    packaging_pct = Column(Float, default=2.0)                         # Packaging & Forwarding %
    packaging_amount = Column(Float, default=0.0)

    freight_terms = Column(String(50), default="Ex-Works")             # "Ex-Works" or "FOR Destination"
    freight_amount = Column(Float, default=0.0)

    installation_charges = Column(Float, default=15000.0)               # Erection & Commissioning

    taxable_value = Column(Float, nullable=False)                      # Base after discount + P&F + Freight + I&C
    gst_type = Column(String(50), default="IGST")                      # "IGST" (Inter-state) or "CGST_SGST" (Intra-state)
    gst_rate = Column(Float, default=18.0)                             # Standard 18% GST for industrial machinery
    gst_amount = Column(Float, nullable=False)
    total_value = Column(Float, nullable=False)                        # Net proposal value including GST

    # Commercial Terms
    payment_terms = Column(String(300), default="20% Advance with PO, balance 80% against Proforma Invoice prior to dispatch")
    delivery_weeks = Column(String(100), default="2 to 3 Weeks from confirmed PO & GA clearance")
    warranty_months = Column(Integer, default=12)
    validity_days = Column(Integer, default=30)
    ga_drawing_id = Column(String(100), default="GAD-CP-CPM15")
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    enquiry = relationship("Enquiry", back_populates="quotations")
    equipment_model = relationship("EquipmentModel")

