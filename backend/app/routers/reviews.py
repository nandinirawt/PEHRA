from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.models import Seat, RiskStateRecord
from app.schemas.schemas import ReviewActionSchema
from app.ws.manager import ws_manager

router = APIRouter(prefix="/api/exams/{exam_id}/reviews", tags=["Reviews"])

@router.patch("/{seat_id}")
async def handle_review_action(exam_id: str, seat_id: str, action_data: ReviewActionSchema, db: Session = Depends(get_db)):
    seat = db.query(Seat).filter(Seat.exam_id == exam_id, Seat.seat_id == seat_id).first()
    risk = db.query(RiskStateRecord).filter(RiskStateRecord.exam_id == exam_id, RiskStateRecord.seat_id == seat_id).first()
    if not seat:
        raise HTTPException(status_code=404, detail="Seat not found")

    if action_data.action == "false_alarm":
        seat.status = "normal"
        if risk:
            risk.status = "normal"
            risk.risk_score = 0
    elif action_data.action == "confirm_incident":
        seat.status = "high_risk"
        if risk:
            risk.status = "high_risk"
    elif action_data.action == "keep_under_review":
        seat.status = "under_review"
        if risk:
            risk.status = "under_review"

    db.commit()

    await ws_manager.broadcast_to_exam(
        exam_id,
        {
            "type": "REVIEW_ACTION",
            "seat_id": seat_id,
            "action": action_data.action,
            "new_status": seat.status
        }
    )
    return {"status": "ok", "action": action_data.action, "seat_status": seat.status}