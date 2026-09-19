from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.models import RiskStateRecord, Seat
from app.schemas.schemas import RiskStateSchema
from app.ws.manager import ws_manager

router = APIRouter(tags=["Risk"])

@router.put("/api/exams/{exam_id}/risk/{seat_id}")
async def update_risk_state(exam_id: str, seat_id: str, risk: RiskStateSchema, db: Session = Depends(get_db)):
    record = db.query(RiskStateRecord).filter(
        RiskStateRecord.seat_id == seat_id,
        RiskStateRecord.exam_id == exam_id
    ).first()
    
    if not record:
        record = RiskStateRecord(seat_id=seat_id, exam_id=exam_id)
        db.add(record)

    record.risk_score = risk.risk_score
    record.confidence = risk.confidence
    record.status = risk.status
    record.updated_at = risk.updated_at
    record.contributions = [c.model_dump() for c in risk.contributions] if risk.contributions else []

    # Keep Seat status in sync with Risk State
    seat = db.query(Seat).filter(Seat.exam_id == exam_id, Seat.seat_id == seat_id).first()
    if seat:
        seat.status = risk.status

    db.commit()

    # WebSocket Broadcast to Live Monitor
    await ws_manager.broadcast_to_exam(
        exam_id,
        {
            "type": "RISK_STATE_UPDATE",
            "seat_id": seat_id,
            "data": risk.model_dump()
        }
    )
    return {"status": "ok", "seat_id": seat_id}

@router.get("/api/exams/{exam_id}/risk/{seat_id}", response_model=RiskStateSchema)
def get_seat_risk(exam_id: str, seat_id: str, db: Session = Depends(get_db)):
    record = db.query(RiskStateRecord).filter(
        RiskStateRecord.seat_id == seat_id,
        RiskStateRecord.exam_id == exam_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Risk state not found for seat")
    return record