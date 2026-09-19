from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.models.models import BehaviorEventRecord
from app.schemas.schemas import BehaviorEventSchema
from app.ws.manager import ws_manager

router = APIRouter(tags=["Events"])

@router.post("/api/events")
async def ingest_event(event: BehaviorEventSchema, db: Session = Depends(get_db)):
    record = BehaviorEventRecord(**event.model_dump())
    db.add(record)
    db.commit()
    # Broadcast event in real-time to front-end Live Monitor
    await ws_manager.broadcast_to_exam(
        event.exam_id,
        {"type": "BEHAVIOR_EVENT", "data": event.model_dump()}
    )
    return {"status": "ok", "event_id": event.event_id}

@router.get("/api/exams/{exam_id}/events", response_model=List[BehaviorEventSchema])
def get_exam_events(exam_id: str, db: Session = Depends(get_db)):
    return db.query(BehaviorEventRecord).filter(BehaviorEventRecord.exam_id == exam_id).all()