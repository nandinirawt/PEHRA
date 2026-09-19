from dataclasses import dataclass, asdict
from typing import List, Dict, Any


@dataclass
class CameraZone:
    camera_id: str
    zone_id: str
    seat_ids: List[str]
    bbox: List[float]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class CalibrationRecord:
    camera_id: str
    zone: CameraZone
    coverage: bool
    status: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "camera_id": self.camera_id,
            "zone": self.zone.to_dict(),
            "coverage": self.coverage,
            "status": self.status,
        }