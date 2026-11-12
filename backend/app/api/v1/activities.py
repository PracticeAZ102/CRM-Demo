from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from app.core.database import get_db
from app.models.activity import Campaign, Appointment, SalesTarget
from app.models.quotation import Enquiry, Quotation
from app.models.ofm import OFMRecord
from app.models.equipment_model import EquipmentModel
from app.schemas.activity import (
    CampaignCreate,
    CampaignResponse,
    AppointmentCreate,
    AppointmentResponse,
    SalesTargetResponse,
    DashboardStats,
)

router = APIRouter(tags=["Activities & Analytics"])

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_enquiries = db.query(Enquiry).count()
    active_quotes = db.query(Quotation).count()
    pending_ofm = db.query(OFMRecord).filter(OFMRecord.is_frozen == False).count()
    released_ofm = db.query(OFMRecord).filter(OFMRecord.is_frozen == True).count()
    total_models = db.query(EquipmentModel).filter(EquipmentModel.is_active == True).count()
    upcoming_appointments = db.query(Appointment).filter(Appointment.status == "SCHEDULED").count()
    active_campaigns = db.query(Campaign).filter(Campaign.status == "ACTIVE").count()

    # Targets for current month
    oct_target = db.query(SalesTarget).filter(SalesTarget.month == "October 2026").first()
    mtd_target = oct_target.target_units if oct_target else 15
    mtd_achieved = oct_target.achieved_units if oct_target else 11

    return DashboardStats(
        total_enquiries=total_enquiries,
        active_quotes=active_quotes,
        pending_ofm_count=pending_ofm,
        released_ofm_count=released_ofm,
        total_models=total_models,
        upcoming_appointments=upcoming_appointments,
        active_campaigns=active_campaigns,
        mtd_target_units=mtd_target,
        mtd_achieved_units=mtd_achieved,
    )

# Campaigns
@router.get("/campaigns", response_model=List[CampaignResponse])
def list_campaigns(db: Session = Depends(get_db)):
    return db.query(Campaign).order_by(desc(Campaign.id)).all()

@router.post("/campaigns", response_model=CampaignResponse, status_code=201)
def create_campaign(req: CampaignCreate, db: Session = Depends(get_db)):
    campaign = Campaign(**req.dict())
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign

# Appointments
@router.get("/appointments", response_model=List[AppointmentResponse])
def list_appointments(db: Session = Depends(get_db)):
    return db.query(Appointment).order_by(desc(Appointment.id)).all()

@router.post("/appointments", response_model=AppointmentResponse, status_code=201)
def create_appointment(req: AppointmentCreate, db: Session = Depends(get_db)):
    appt = Appointment(**req.dict(), status="SCHEDULED")
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt

# Sales Targets
@router.get("/targets", response_model=List[SalesTargetResponse])
def list_targets(db: Session = Depends(get_db)):
    return db.query(SalesTarget).order_by(SalesTarget.id.asc()).all()
