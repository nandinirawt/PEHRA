from typing import List, Dict, Any

from calibration.zone_mapping.mapper import generate_seats
from calibration.coverage_check.validator import validate_calibration


class CalibrationService:

    def create_expected_layout(
        self,
        rows: int,
        columns: int,
    ) -> Dict[str, Any]:

        seats = generate_seats(
            rows,
            columns,
        )

        return {
            "rows": rows,
            "columns": columns,
            "total_seats": len(seats),
            "seat_ids": seats,
        }


    def validate(
        self,
        rows: int,
        columns: int,
        mapped_seats: List[str],
    ) -> Dict[str, Any]:

        expected_seats = generate_seats(
            rows,
            columns,
        )

        return validate_calibration(
            expected_seats,
            mapped_seats,
        )