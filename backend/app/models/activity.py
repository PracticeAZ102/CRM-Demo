from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text
from datetime import datetime, timezone
from app.core.database import Base

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    city = Column(String(100), nullable=False)
    venue = Column(String(200), nullable=False)
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    budget = Column(Float, default=0.0)
    target_leads = Column(Integer, default=50)
    leads_generated = Column(Integer, default=0)
    status = Column(String(50), default="ACTIVE")  # ACTIVE, COMPLETED, UPCOMING
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_name = Column(String(200), nullable=False)
    contact_person = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=False)
    city = Column(String(100), default="Delhi/NCR")
    visit_date = Column(String(50), nullable=False)
    visit_time = Column(String(50), default="11:00 AM")
    purpose = Column(String(200), default="Air Audit & Compressor Sizing")
    status = Column(String(50), default="SCHEDULED")  # SCHEDULED, COMPLETED, CANCELLED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class SalesTarget(Base):
    __tablename__ = "sales_targets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    financial_year = Column(String(50), default="2026-27")
    month = Column(String(50), nullable=False)
    target_units = Column(Integer, default=10)
    achieved_units = Column(Integer, default=0)
    target_revenue = Column(Float, default=5000000.0)
    achieved_revenue = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
