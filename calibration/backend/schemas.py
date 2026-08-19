from pydantic import BaseModel, Field
from typing import List


class LayoutRequest(BaseModel):
    rows: int = Field(gt=0, le=26)
    columns: int = Field(gt=0, le=100)


class LayoutResponse(BaseModel):
    rows: int
    columns: int
    total_seats: int
    seat_ids: List[str]


class CalibrationMappingRequest(BaseModel):
    camera_id: str
    zone_id: str
    seat_ids: List[str]
    bbox: List[float]


class ValidateCalibrationRequest(BaseModel):
    rows: int = Field(gt=0)
    columns: int = Field(gt=0)
    mapped_seats: List[str]


class CalibrationResult(BaseModel):
    status: str
    total_expected: int
    total_mapped: int
    coverage_percentage: float
    uncovered_seats: List[str]
    unexpected_seats: List[str]
    duplicate_seats: List[str]