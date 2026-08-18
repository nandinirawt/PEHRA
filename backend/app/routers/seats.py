from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.models.models import Seat
from app.schemas.schemas import SeatSchema

router = APIRouter(prefix="/api/exams/{exam_id}/seats", tags=["Seats"])

@router.get("", response_model=List[SeatSchema])
def get_seats(exam_id: str, db: Session = Depends(get_db)):
    return db.query(Seat).filter(Seat.exam_id == exam_id).all()

@router.put("", response_model=List[SeatSchema])
def update_seats(exam_id: str, seats_in: List[SeatSchema], db: Session = Depends(get_db)):
    db.query(Seat).filter(Seat.exam_id == exam_id).delete()
    for s in seats_in:
        seat_data = s.model_dump()
        seat_data["exam_id"] = exam_id
        db.add(Seat(**seat_data))
    db.commit()
    return db.query(Seat).filter(Seat.exam_id == exam_id).all()