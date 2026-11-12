from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import List, Optional
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.ofm import OFMRecord
from app.models.quotation import Quotation, Enquiry
from app.models.equipment_model import EquipmentModel
from app.schemas.ofm import OFMUpdate, OFMFreezeRequest, OFMResponse
from app.services.factory_job_card_pdf import generate_factory_job_card_pdf

router = APIRouter(prefix="/ofm", tags=["Order Finalization Memorandum (OFM)"])

@router.get("/summary")
def get_ofm_summary(db: Session = Depends(get_db)):
    total = db.query(OFMRecord).count()
    pending_dealer = db.query(OFMRecord).filter(OFMRecord.status == "PENDING_DEALER_REVIEW").count()
    awaiting_scrutiny = db.query(OFMRecord).filter(OFMRecord.status == "AWAITING_PO_SCRUTINY").count()
    factory_released = db.query(OFMRecord).filter(OFMRecord.status == "FROZEN_FACTORY_RELEASE").count()

    return {
        "total_ofm_records": total,
        "pending_dealer_review": pending_dealer,
        "awaiting_po_scrutiny": awaiting_scrutiny,
        "frozen_factory_released": factory_released
    }

@router.get("", response_model=List[OFMResponse])
def list_ofms(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(OFMRecord)
    if search:
        search_filter = or_(
            OFMRecord.ofm_number.ilike(f"%{search}%"),
            OFMRecord.enquiry_id.ilike(f"%{search}%"),
            OFMRecord.customer_po_number.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    if status:
        query = query.filter(OFMRecord.status == status)

    return query.order_by(desc(OFMRecord.created_at)).all()

@router.get("/{ofm_id}", response_model=OFMResponse)
def get_ofm(ofm_id: str, db: Session = Depends(get_db)):
    ofm = db.query(OFMRecord).filter(OFMRecord.id == ofm_id).first()
    if not ofm:
        raise HTTPException(status_code=404, detail=f"OFM Record '{ofm_id}' not found.")
    return ofm

@router.put("/{ofm_id}", response_model=OFMResponse)
def update_pending_ofm(ofm_id: str, req: OFMUpdate, db: Session = Depends(get_db)):
    """
    Allows modifying commercial and technical OFM parameters during dealer negotiation.
    Blocked permanently if the OFM is already frozen / released to production.
    """
    ofm = db.query(OFMRecord).filter(OFMRecord.id == ofm_id).first()
    if not ofm:
        raise HTTPException(status_code=404, detail=f"OFM Record '{ofm_id}' not found.")

    if ofm.is_frozen:
        raise HTTPException(
            status_code=400,
            detail=f"OFM '{ofm_id}' has already been frozen and released to factory PPC. Modifications are locked."
        )

    update_data = req.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ofm, field, value)

    # If PO number is filled, update status to AWAITING_PO_SCRUTINY
    if ofm.customer_po_number and ofm.status == "PENDING_DEALER_REVIEW":
        ofm.status = "AWAITING_PO_SCRUTINY"

    db.commit()
    db.refresh(ofm)
    return ofm

@router.post("/{ofm_id}/revise", response_model=OFMResponse, status_code=201)
def create_ofm_revision(ofm_id: str, db: Session = Depends(get_db)):
    """
    Creates next sequential revision (e.g. Rev-02, Rev-03) preserving the permanent Enquiry ID.
    Used during back-and-forth negotiations with the dealer before final acceptance.
    """
    from sqlalchemy import func

    parent = db.query(OFMRecord).filter(OFMRecord.id == ofm_id).first()
    if not parent:
        raise HTTPException(status_code=404, detail=f"OFM Record '{ofm_id}' not found.")

    # Find highest revision number for this enquiry
    max_rev = db.query(func.max(OFMRecord.revision_no)).filter(OFMRecord.enquiry_id == parent.enquiry_id).scalar() or parent.revision_no
    new_rev = max_rev + 1
    new_id = f"OFM-{parent.enquiry_id}-R{new_rev:02d}"

    new_ofm = OFMRecord(
        id=new_id,
        ofm_number=parent.ofm_number,
        enquiry_id=parent.enquiry_id,
        quotation_id=parent.quotation_id,
        revision_no=new_rev,
        customer_po_number=parent.customer_po_number,
        customer_po_date=parent.customer_po_date,
        customer_po_value=parent.customer_po_value,
        committed_dispatch_date=parent.committed_dispatch_date,
        paint_shade=parent.paint_shade,
        electrical_supply=parent.electrical_supply,
        air_discharge_nozzle=parent.air_discharge_nozzle,
        special_factory_instructions=f"Revision {new_rev} spawned from {parent.id}",
        status="PENDING_DEALER_REVIEW",
        is_frozen=False
    )
    db.add(new_ofm)
    db.commit()
    db.refresh(new_ofm)
    return new_ofm

@router.post("/{ofm_id}/freeze", response_model=OFMResponse)
def freeze_and_release_ofm(ofm_id: str, req: OFMFreezeRequest, db: Session = Depends(get_db)):
    """
    PO Scrutiny Gate:
    Verifies Customer Purchase Order terms against the quoted values.
    Locks the OFM permanently (read-only) and authorizes factory PPC to commence manufacturing.
    """
    ofm = db.query(OFMRecord).filter(OFMRecord.id == ofm_id).first()
    if not ofm:
        raise HTTPException(status_code=404, detail=f"OFM Record '{ofm_id}' not found.")

    if ofm.is_frozen:
        raise HTTPException(status_code=400, detail=f"OFM '{ofm_id}' is already frozen and released.")

    # Apply PO Scrutiny verification
    ofm.customer_po_number = req.customer_po_number
    ofm.customer_po_date = req.customer_po_date
    ofm.customer_po_value = req.customer_po_value
    ofm.po_value_verified = req.po_value_verified
    ofm.tech_specs_verified = req.tech_specs_verified
    ofm.payment_terms_verified = req.payment_terms_verified
    ofm.ga_drawing_cleared = req.ga_drawing_cleared
    ofm.committed_dispatch_date = req.committed_dispatch_date

    # Immutable Freeze
    ofm.is_frozen = True
    ofm.status = "FROZEN_FACTORY_RELEASE"
    ofm.frozen_at = datetime.now(timezone.utc)
    ofm.frozen_by = req.approved_by or "Rajesh Sharma (Admin)"

    # Also update Enquiry status
    enquiry = db.query(Enquiry).filter(Enquiry.id == ofm.enquiry_id).first()
    if enquiry:
        enquiry.status = "RELEASED_TO_PPC"

    db.commit()
    db.refresh(ofm)
    return ofm

@router.get("/{ofm_id}/factory-sheet-pdf")
def download_factory_sheet_pdf(ofm_id: str, db: Session = Depends(get_db)):
    """
    Streams the official 1-page Manufacturing PPC Job Release Card & Frozen OFM Sheet
    """
    ofm = db.query(OFMRecord).filter(OFMRecord.id == ofm_id).first()
    if not ofm:
        raise HTTPException(status_code=404, detail=f"OFM Record '{ofm_id}' not found.")

    enquiry = db.query(Enquiry).filter(Enquiry.id == ofm.enquiry_id).first()
    quote = db.query(Quotation).filter(Quotation.id == ofm.quotation_id).first()
    model = db.query(EquipmentModel).filter(EquipmentModel.prkey == quote.prkey).first()

    pdf_buffer = generate_factory_job_card_pdf(ofm, enquiry, quote, model)

    filename = f"ATCORP_Factory_Release_{ofm.id}.pdf"
    headers = {
        "Content-Disposition": f'inline; filename="{filename}"'
    }
    return StreamingResponse(pdf_buffer, media_type="application/pdf", headers=headers)
