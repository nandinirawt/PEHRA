import time

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.models import PoseRecord, RiskStateRecord
from app.schemas.schemas import PoseDataSchema
from app.ws.manager import ws_manager
from app.services.risk_engine_service import risk_engine_service


router = APIRouter(prefix="/api/pose", tags=["Pose"])


# ---------------------------------------------------------
# Edge AI person ID -> Exam seat ID
# ---------------------------------------------------------

SEAT_ID_MAP = {
    "PERSON-1": "A-01",
    "PERSON-2": "A-02",
    "PERSON-3": "A-03",
}


@router.post("")
async def ingest_pose(
    data: PoseDataSchema,
    db: Session = Depends(get_db),
):
    # ---------------------------------------------------------
    # Map Edge AI person ID to actual exam seat ID
    # ---------------------------------------------------------

    mapped_seat_id = SEAT_ID_MAP.get(
        data.seat_id,
        data.seat_id,
    )

    # ---------------------------------------------------------
    # Normalize timestamp
    # ---------------------------------------------------------

    try:
        timestamp = float(data.timestamp)
    except (TypeError, ValueError):
        timestamp = time.time()

    # ---------------------------------------------------------
    # Prepare payload for Risk Engine
    # ---------------------------------------------------------

    pose_payload = {
        "seat_id": mapped_seat_id,
        "timestamp": timestamp,
        "presence": data.presence,
        "confidence": data.confidence,
        "pose_features": data.pose_features or {},
    }

    # ---------------------------------------------------------
    # Store raw pose data
    # ---------------------------------------------------------

    record = PoseRecord(
        seat_id=mapped_seat_id,
        timestamp=str(timestamp),
        presence=data.presence,
        confidence=data.confidence,
        pose_features=data.pose_features or {},
    )

    db.add(record)

    # ---------------------------------------------------------
    # Run teammate's Risk Engine
    # ---------------------------------------------------------

    result = risk_engine_service.process_pose(
        pose_payload
    )

    risk = result["risk"]
    signals = result["signals"]
    activity = result["activity"]
    benign = result["benign"]

    # ---------------------------------------------------------
    # Store / update latest risk state
    # ---------------------------------------------------------

    risk_record = (
        db.query(RiskStateRecord)
        .filter(
            RiskStateRecord.seat_id == mapped_seat_id
        )
        .first()
    )

    if not risk_record:
        risk_record = RiskStateRecord(
            seat_id=mapped_seat_id,
            exam_id="EXAM-01",
        )
        db.add(risk_record)

    risk_record.risk_score = risk["risk_score"]
    risk_record.confidence = risk["confidence"]
    risk_record.status = risk["status"]
    risk_record.updated_at = str(time.time())
    risk_record.contributions = risk.get(
        "contributions",
        [],
    )

    db.commit()

    # ---------------------------------------------------------
    # Broadcast real-time risk update to Live Monitor
    # ---------------------------------------------------------

    await ws_manager.broadcast_to_exam(
        "EXAM-01",
        {
            "type": "RISK_STATE_UPDATE",
            "seat_id": mapped_seat_id,
            "data": {
                **risk,
                "exam_id": "EXAM-01",
                "activity": activity,
                "benign": benign,
            },
        },
    )

    # ---------------------------------------------------------
    # HTTP response
    # ---------------------------------------------------------

    return {
        "status": "ok",
        "seat_id": mapped_seat_id,
        "risk": risk,
        "signals": signals,
        "activity": activity,
        "benign": benign,
    }