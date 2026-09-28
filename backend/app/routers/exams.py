from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.models.models import Exam, Seat, BehaviorEventRecord, RiskStateRecord
from app.schemas.schemas import ExamCreate, ExamResponse

router = APIRouter(prefix="/api/exams", tags=["Exams"])

@router.get("", response_model=List[ExamResponse])
def list_exams(db: Session = Depends(get_db)):
    return db.query(Exam).all()

@router.post("", response_model=ExamResponse)
def create_exam(exam_in: ExamCreate, db: Session = Depends(get_db)):
    existing = db.query(Exam).filter(Exam.exam_id == exam_in.exam_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Exam ID already exists")
    exam = Exam(**exam_in.model_dump())
    db.add(exam)
    db.commit()
    db.refresh(exam)
    return exam

@router.get("/{exam_id}", response_model=ExamResponse)
def get_exam(exam_id: str, db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.exam_id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam

@router.put("/{exam_id}", response_model=ExamResponse)
def update_exam(exam_id: str, exam_in: ExamCreate, db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.exam_id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    for key, val in exam_in.model_dump().items():
        setattr(exam, key, val)
    db.commit()
    db.refresh(exam)
    return exam

@router.post("/{exam_id}/start")
def start_exam(exam_id: str, db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.exam_id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    exam.status = "live"
    db.commit()
    return {"status": "live", "exam_id": exam_id}

@router.post("/{exam_id}/end")
def end_exam(exam_id: str, db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.exam_id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    exam.status = "completed"
    db.commit()
    return {"status": "completed", "exam_id": exam_id}

@router.get("/{exam_id}/summary")
def get_summary(exam_id: str, db: Session = Depends(get_db)):
    total_seats = db.query(Seat).filter(Seat.exam_id == exam_id).count()
    events_count = db.query(BehaviorEventRecord).filter(BehaviorEventRecord.exam_id == exam_id).count()
    risk_distribution = {
        "normal": db.query(Seat).filter(Seat.exam_id == exam_id, Seat.status == "normal").count(),
        "under_review": db.query(Seat).filter(Seat.exam_id == exam_id, Seat.status == "under_review").count(),
        "high_risk": db.query(Seat).filter(Seat.exam_id == exam_id, Seat.status == "high_risk").count(),
        "absent": db.query(Seat).filter(Seat.exam_id == exam_id, Seat.status == "absent").count()
    }
    return {
        "exam_id": exam_id,
        "total_seats": total_seats,
        "total_events": events_count,
        "risk_distribution": risk_distribution,
        "privacy_summary": "100% On-Device Inference, Zero Face Data Retained"
    }