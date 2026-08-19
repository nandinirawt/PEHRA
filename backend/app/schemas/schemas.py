from pydantic import BaseModel
from typing import List, Optional, Any, Dict

class ExamBase(BaseModel):
    exam_id: str
    name: str
    subject: str
    hall_id: str
    date: str
    start_time: str
    end_time: str
    total_seats: int
    status: str = "draft"

class ExamCreate(ExamBase):
    pass

class ExamResponse(ExamBase):
    class Config:
        from_attributes = True

class SeatSchema(BaseModel):
    seat_id: str
    exam_id: Optional[str] = None
    row: int
    column: int
    status: str = "normal"

    class Config:
        from_attributes = True

# --- P5 Pose Schema ---
class PoseFeatures(BaseModel):
    head_direction: Optional[str] = "center"
    body_orientation: Optional[str] = "forward"
    hand_state: Optional[str] = "normal"

class PoseDataSchema(BaseModel):
    seat_id: str
    timestamp: str
    presence: bool = True
    confidence: float = 1.0
    pose_features: Optional[Dict[str, Any]] = {
        "head_direction": "center",
        "body_orientation": "forward",
        "hand_state": "normal"
    }

class BehaviorEventSchema(BaseModel):
    event_id: str
    exam_id: str
    seat_id: str
    event_type: str
    severity: str
    confidence: float
    timestamp: str
    duration: float

    class Config:
        from_attributes = True

class SignalContribution(BaseModel):
    signal: str
    points: int

class RiskStateSchema(BaseModel):
    seat_id: str
    exam_id: Optional[str] = None
    risk_score: int
    confidence: float
    status: str
    updated_at: str
    contributions: Optional[List[SignalContribution]] = []

    class Config:
        from_attributes = True

class CalibrationSchema(BaseModel):
    camera_id: str
    exam_id: str
    zone: str
    seat_ids: List[str]
    coverage: float
    status: str

    class Config:
        from_attributes = True

class ReviewActionSchema(BaseModel):
    action: str
    notes: Optional[str] = None