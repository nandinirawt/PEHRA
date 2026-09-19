from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.models import PoseRecord
from app.schemas.schemas import PoseDataSchema

router = APIRouter(prefix="/api/pose", tags=["Pose"])

@router.post("")
def ingest_pose(data: PoseDataSchema, db: Session = Depends(get_db)):
    record = PoseRecord(
        seat_id=data.seat_id,
        timestamp=data.timestamp,
        presence=data.presence,
        confidence=data.confidence,
        pose_features=data.pose_features
    )
    db.add(record)
    db.commit()
    return {"status": "ok", "seat_id": data.seat_id}