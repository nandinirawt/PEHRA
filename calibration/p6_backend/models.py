from typing import List, Optional
from pydantic import BaseModel, Field


class SeatMapping(BaseModel):
    row: int = Field(gt=0)
    column: int = Field(gt=0)
    x: float
    y: float
    bbox: Optional[List[float]] = None


class StartCalibrationRequest(BaseModel):
    exam_id: str
    camera_id: str
    rows: int = Field(gt=0)
    columns: int = Field(gt=0)


class UpdateCalibrationRequest(BaseModel):
    seats: List[SeatMapping]


class CalibrationResult(BaseModel):
    exam_id: str
    camera_id: str
    status: str
    expected_rows: int
    expected_columns: int
    expected_seats: int
    mapped_seats: int
    coverage_percentage: float
    missing_seats: List[str]
    duplicate_seats: List[str]