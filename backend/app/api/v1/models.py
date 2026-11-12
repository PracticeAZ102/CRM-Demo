from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
import io
import openpyxl

from app.core.database import get_db
from app.models.equipment_model import EquipmentModel
from app.schemas.equipment_model import (
    EquipmentModelCreate,
    EquipmentModelUpdate,
    EquipmentModelResponse,
)

router = APIRouter(prefix="/models", tags=["Equipment Model Master"])

@router.get("", response_model=List[EquipmentModelResponse])
def list_models(
    search: Optional[str] = Query(None, description="Search by PRKEY or IDESC"),
    brand: Optional[str] = Query(None, description="Filter by Brand"),
    type: Optional[str] = Query(None, description="Filter by Type"),
    vsd_fs: Optional[str] = Query(None, description="Filter by VSD / FS"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(EquipmentModel).filter(EquipmentModel.is_active == True)
    
    if search:
        search_filter = or_(
            EquipmentModel.prkey.ilike(f"%{search}%"),
            EquipmentModel.idesc.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
        
    if brand:
        query = query.filter(EquipmentModel.brand == brand)
    if type:
        query = query.filter(EquipmentModel.type == type)
    if vsd_fs:
        query = query.filter(EquipmentModel.vsd_fs == vsd_fs)
        
    return query.order_by(EquipmentModel.prkey.asc()).offset(skip).limit(limit).all()

@router.get("/summary")
def get_catalog_summary(db: Session = Depends(get_db)):
    """Return dashboard KPI statistics for the Equipment Catalog"""
    total = db.query(EquipmentModel).filter(EquipmentModel.is_active == True).count()
    brands = db.query(EquipmentModel.brand).filter(EquipmentModel.is_active == True).distinct().count()
    vsd_count = db.query(EquipmentModel).filter(EquipmentModel.is_active == True, EquipmentModel.vsd_fs == "VSD").count()
    fs_count = db.query(EquipmentModel).filter(EquipmentModel.is_active == True, EquipmentModel.vsd_fs == "FS").count()
    min_clp = db.query(func.min(EquipmentModel.clp)).filter(EquipmentModel.is_active == True).scalar() or 0
    max_clp = db.query(func.max(EquipmentModel.clp)).filter(EquipmentModel.is_active == True).scalar() or 0
    avg_clp = db.query(func.avg(EquipmentModel.clp)).filter(EquipmentModel.is_active == True).scalar() or 0

    return {
        "total_active_models": total,
        "brands_count": brands,
        "vsd_count": vsd_count,
        "fs_count": fs_count,
        "min_clp": float(min_clp),
        "max_clp": float(max_clp),
        "avg_clp": round(float(avg_clp), 2)
    }

@router.get("/{prkey}", response_model=EquipmentModelResponse)
def get_model(prkey: str, db: Session = Depends(get_db)):
    model = db.query(EquipmentModel).filter(EquipmentModel.prkey == prkey, EquipmentModel.is_active == True).first()
    if not model:
        raise HTTPException(status_code=404, detail=f"Equipment Model '{prkey}' not found.")
    return model

@router.post("", response_model=EquipmentModelResponse, status_code=201)
def create_model(model_in: EquipmentModelCreate, db: Session = Depends(get_db)):
    existing = db.query(EquipmentModel).filter(EquipmentModel.prkey == model_in.prkey).first()
    if existing:
        if existing.is_active:
            raise HTTPException(status_code=400, detail=f"Model with PRKEY '{model_in.prkey}' already exists.")
        # Reactivate if previously deleted
        for field, value in model_in.dict().items():
            setattr(existing, field, value)
        existing.is_active = True
        db.commit()
        db.refresh(existing)
        return existing

    new_model = EquipmentModel(**model_in.dict())
    db.add(new_model)
    db.commit()
    db.refresh(new_model)
    return new_model

@router.put("/{prkey}", response_model=EquipmentModelResponse)
def update_model(prkey: str, model_in: EquipmentModelUpdate, db: Session = Depends(get_db)):
    model = db.query(EquipmentModel).filter(EquipmentModel.prkey == prkey, EquipmentModel.is_active == True).first()
    if not model:
        raise HTTPException(status_code=404, detail=f"Equipment Model '{prkey}' not found.")

    update_data = model_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(model, field, value)

    db.commit()
    db.refresh(model)
    return model

@router.delete("/{prkey}", status_code=200)
def delete_model(prkey: str, db: Session = Depends(get_db)):
    model = db.query(EquipmentModel).filter(EquipmentModel.prkey == prkey).first()
    if not model or not model.is_active:
        raise HTTPException(status_code=404, detail=f"Equipment Model '{prkey}' not found.")

    # Soft delete
    model.is_active = False
    db.commit()
    return {"message": f"Model '{prkey}' successfully deleted / deactivated."}

@router.post("/{prkey}/clone", response_model=EquipmentModelResponse, status_code=201)
def clone_model(prkey: str, db: Session = Depends(get_db)):
    model = db.query(EquipmentModel).filter(EquipmentModel.prkey == prkey, EquipmentModel.is_active == True).first()
    if not model:
        raise HTTPException(status_code=404, detail=f"Original Model '{prkey}' not found.")

    new_key = f"{prkey}-COPY"
    # Ensure unique key if copy already exists
    counter = 1
    while db.query(EquipmentModel).filter(EquipmentModel.prkey == new_key).first():
        new_key = f"{prkey}-COPY-{counter}"
        counter += 1

    cloned = EquipmentModel(
        prkey=new_key,
        idesc=f"{model.idesc} (Copy)",
        motor=model.motor,
        type=model.type,
        brand=model.brand,
        vsd_fs=model.vsd_fs,
        maximum_pressure=model.maximum_pressure,
        fad_cfm=model.fad_cfm,
        dimension=model.dimension,
        clp=model.clp,
        is_active=True
    )
    db.add(cloned)
    db.commit()
    db.refresh(cloned)
    return cloned

@router.get("/export/excel")
def export_excel(db: Session = Depends(get_db)):
    """Export the 10-column Equipment Model Master strictly matching Models Input.jpg"""
    models = db.query(EquipmentModel).filter(EquipmentModel.is_active == True).order_by(EquipmentModel.prkey.asc()).all()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Equipment Models"

    headers = [
        "PRKEY", "IDESC", "Motor", "Type", "Brand",
        "VSD / FS", "MaXimum Pressure", "FAD (cfm)", "Dimension", "CLP"
    ]
    ws.append(headers)

    # Style header row
    for col in range(1, 11):
        cell = ws.cell(row=1, column=col)
        cell.font = openpyxl.styles.Font(bold=True, color="FFFFFF")
        cell.fill = openpyxl.styles.PatternFill("solid", fgColor="2986CC")
        cell.alignment = openpyxl.styles.Alignment(horizontal="center", vertical="center")

    for m in models:
        ws.append([
            m.prkey, m.idesc, m.motor, m.type, m.brand,
            m.vsd_fs, m.maximum_pressure, m.fad_cfm, m.dimension, m.clp
        ])

    stream = io.BytesIO()
    wb.save(stream)
    stream.seek(0)

    headers = {
        'Content-Disposition': 'attachment; filename="ATCORP_Equipment_Model_Master.xlsx"'
    }
    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers
    )

