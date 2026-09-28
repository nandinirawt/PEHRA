from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.models.models import CalibrationRecord
from app.schemas.schemas import CalibrationSchema

router = APIRouter(prefix="/api/exams/{exam_id}/calibration", tags=["Calibration"])

@router.get("", response_model=List[CalibrationSchema])
def get_calibration(exam_id: str, db: Session = Depends(get_db)):
    return db.query(CalibrationRecord).filter(CalibrationRecord.exam_id == exam_id).all()

@router.post("", response_model=CalibrationSchema)
def store_calibration(exam_id: str, cal: CalibrationSchema, db: Session = Depends(get_db)):
    record = db.query(CalibrationRecord).filter(
        CalibrationRecord.camera_id == cal.camera_id,
        CalibrationRecord.exam_id == exam_id
    ).first()
    if not record:
        record = CalibrationRecord(camera_id=cal.camera_id, exam_id=exam_id)
        db.add(record)
    record.zone = cal.zone
    record.seat_ids = cal.seat_ids
    record.coverage = cal.coverage
    record.status = cal.status
    db.commit()
    db.refresh(record)
    return record