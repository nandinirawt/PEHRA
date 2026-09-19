import sys
import time
import traceback
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.models import PoseRecord
from app.schemas.schemas import PoseDataSchema
from app.ws.manager import ws_manager

BASE_DIR = Path(__file__).resolve().parents[3]
ENGINE_DIR = BASE_DIR / "behavior-engine"

if str(ENGINE_DIR) not in sys.path:
    sys.path.insert(0, str(ENGINE_DIR))

from main import BehaviorEnginePipeline

router = APIRouter(prefix="/api/pose", tags=["Pose"])
risk_engine = BehaviorEnginePipeline()

def parse_to_epoch(ts_val) -> float:
    if isinstance(ts_val, (int, float)):
        return float(ts_val)
    if isinstance(ts_val, str):
        try:
            return datetime.fromisoformat(ts_val.replace("Z", "+00:00")).timestamp()
        except Exception:
            try:
                return float(ts_val)
            except Exception:
                return time.time()
    return time.time()

@router.post("")
async def ingest_pose(data: PoseDataSchema, db: Session = Depends(get_db)):
    try:
        record = PoseRecord(
            seat_id=data.seat_id,
            timestamp=datetime.fromtimestamp(parse_to_epoch(data.timestamp)),
            presence=data.presence,
            confidence=data.confidence,
            pose_features=str(data.pose_features) if isinstance(data.pose_features, dict) else data.pose_features
        )
        db.add(record)
        db.commit()
    except Exception as db_err:
        db.rollback()

    try:
        numeric_ts = parse_to_epoch(data.timestamp)
        pose_payload = {
            "seat_id": data.seat_id,
            "timestamp": numeric_ts,
            "presence": data.presence,
            "confidence": data.confidence,
            "pose_features": data.pose_features or {}
        }

        exam_id = "EXAM-101"
        risk_result = risk_engine.process_pose_frame(pose_payload, exam_id=exam_id)
        risk_result["exam_id"] = exam_id

        # Broadcast directly to EXAM-101
        await ws_manager.broadcast(exam_id, {
            "type": "RISK_UPDATE",
            "data": risk_result
        })

        return {
            "status": "ok",
            "seat_id": data.seat_id,
            "risk": risk_result
        }
    except Exception as eng_err:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(eng_err))
