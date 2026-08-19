from typing import Dict, List

from calibration.p6_backend.models import (
    StartCalibrationRequest,
    SeatMapping,
    CalibrationResult,
)


class CalibrationService:

    def __init__(self):
        # Temporary in-memory storage.
        # Person 4 can replace this with SQLite later.
        self.sessions: Dict[str, dict] = {}

    def start(
        self,
        request: StartCalibrationRequest,
    ) -> dict:

        expected_seats = (
            request.rows *
            request.columns
        )

        session = {
            "exam_id": request.exam_id,
            "camera_id": request.camera_id,
            "rows": request.rows,
            "columns": request.columns,
            "expected_seats": expected_seats,
            "seats": [],
            "status": "in_progress",
        }

        self.sessions[request.exam_id] = session

        return {
            "exam_id": request.exam_id,
            "camera_id": request.camera_id,
            "status": "in_progress",
            "rows": request.rows,
            "columns": request.columns,
            "expected_seats": expected_seats,
        }

    def update(
        self,
        exam_id: str,
        seats: List[SeatMapping],
    ) -> CalibrationResult:

        if exam_id not in self.sessions:
            raise ValueError(
                "Calibration session not found."
            )

        session = self.sessions[exam_id]

        session["seats"] = seats

        return self.validate(exam_id)

    def validate(
        self,
        exam_id: str,
    ) -> CalibrationResult:

        if exam_id not in self.sessions:
            raise ValueError(
                "Calibration session not found."
            )

        session = self.sessions[exam_id]

        rows = session["rows"]
        columns = session["columns"]

        expected_seats = (
            rows * columns
        )

        seats = session["seats"]

        # Expected logical seat labels.
        expected_labels = {
            f"{row}-{column}"
            for row in range(1, rows + 1)
            for column in range(1, columns + 1)
        }

        seen = []
        duplicates = []

        for seat in seats:

            label = (
                f"{seat.row}-{seat.column}"
            )

            if label in seen:
                duplicates.append(label)
            else:
                seen.append(label)

        seen_set = set(seen)

        missing = sorted(
            expected_labels - seen_set
        )

        mapped_seats = len(seen_set)

        coverage = (
            mapped_seats /
            expected_seats *
            100
            if expected_seats
            else 0
        )

        is_valid = (
            mapped_seats == expected_seats
            and not missing
            and not duplicates
        )

        status = (
            "calibrated"
            if is_valid
            else "attention_required"
        )

        session["status"] = status

        return CalibrationResult(
            exam_id=exam_id,
            camera_id=session["camera_id"],
            status=status,
            expected_rows=rows,
            expected_columns=columns,
            expected_seats=expected_seats,
            mapped_seats=mapped_seats,
            coverage_percentage=round(
                coverage,
                2,
            ),
            missing_seats=sorted(
                missing
            ),
            duplicate_seats=sorted(
                duplicates
            ),
        )

    def get(
        self,
        exam_id: str,
    ) -> dict:

        if exam_id not in self.sessions:
            raise ValueError(
                "Calibration session not found."
            )

        return self.sessions[exam_id]