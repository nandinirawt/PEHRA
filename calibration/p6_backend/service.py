from typing import Dict, List

from calibration.p6_backend.models import (
    StartCalibrationRequest,
    SeatMapping,
    CalibrationResult,
)

from calibration.zone_mapping.mapper import generate_seats


class CalibrationService:

    def __init__(self):
        # Temporary in-memory storage.
        # Person 4 can replace this with SQLite later.
        self.sessions: Dict[str, dict] = {}

    @staticmethod
    def seat_id_from_position(
        row: int,
        column: int,
    ) -> str:
        """
        Convert a 1-based row/column position into
        the canonical PEHRA seat ID format.

        Example:
            row=1, column=1 -> A01
            row=1, column=2 -> A02
            row=2, column=1 -> B01
        """

        if row <= 0:
            raise ValueError(
                "Row must be greater than 0."
            )

        if column <= 0:
            raise ValueError(
                "Column must be greater than 0."
            )

        row_letter = chr(
            ord("A") + row - 1
        )

        return f"{row_letter}{column:02d}"

    def start(
        self,
        request: StartCalibrationRequest,
    ) -> dict:

        expected_seats = (
            request.rows
            * request.columns
        )

        expected_layout = generate_seats(
            request.rows,
            request.columns,
        )

        session = {
            "exam_id": request.exam_id,
            "camera_id": request.camera_id,
            "rows": request.rows,
            "columns": request.columns,
            "expected_seats": expected_seats,
            "expected_layout": expected_layout,
            "seats": [],
            "status": "in_progress",
        }

        self.sessions[
            request.exam_id
        ] = session

        return {
            "exam_id": request.exam_id,
            "camera_id": request.camera_id,
            "status": "in_progress",
            "rows": request.rows,
            "columns": request.columns,
            "expected_seats": expected_seats,
            "seat_ids": expected_layout,
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

        session = self.sessions[
            exam_id
        ]

        session["seats"] = seats

        return self.validate(
            exam_id
        )

    def validate(
        self,
        exam_id: str,
    ) -> CalibrationResult:

        if exam_id not in self.sessions:
            raise ValueError(
                "Calibration session not found."
            )

        session = self.sessions[
            exam_id
        ]

        rows = session["rows"]
        columns = session["columns"]

        expected_seats = (
            rows * columns
        )

        expected_labels = set(
            session["expected_layout"]
        )

        seats = session["seats"]

        mapped_labels = [
            self.seat_id_from_position(
                seat.row,
                seat.column,
            )
            for seat in seats
        ]

        duplicate_seats = sorted(
            {
                seat_id
                for seat_id in mapped_labels
                if mapped_labels.count(
                    seat_id
                ) > 1
            }
        )

        mapped_set = set(
            mapped_labels
        )

        missing_seats = sorted(
            expected_labels - mapped_set
        )

        unexpected_seats = sorted(
            mapped_set - expected_labels
        )

        mapped_seats = len(
            expected_labels.intersection(
                mapped_set
            )
        )

        coverage = (
            mapped_seats
            / expected_seats
            * 100
            if expected_seats
            else 0
        )

        is_valid = (
            mapped_seats
            == expected_seats
            and not missing_seats
            and not unexpected_seats
            and not duplicate_seats
        )

        status = (
            "calibrated"
            if is_valid
            else "attention_required"
        )

        session["status"] = status
        session["mapped_seat_ids"] = sorted(
            mapped_set
        )

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
            missing_seats=missing_seats,
            unexpected_seats=unexpected_seats,
            duplicate_seats=duplicate_seats,
        )

    def get(
        self,
        exam_id: str,
    ) -> dict:

        if exam_id not in self.sessions:
            raise ValueError(
                "Calibration session not found."
            )

        return self.sessions[
            exam_id
        ]
