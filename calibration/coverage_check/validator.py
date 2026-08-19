from typing import List, Dict, Any, Set


def validate_calibration(
    expected_seats: List[str],
    mapped_seats: List[str],
) -> Dict[str, Any]:
    """
    Validate whether the calibrated camera mapping
    covers the expected seating structure.
    """

    expected_set: Set[str] = set(expected_seats)
    mapped_set: Set[str] = set(mapped_seats)

    uncovered_seats = sorted(
        expected_set - mapped_set
    )

    unexpected_seats = sorted(
        mapped_set - expected_set
    )

    duplicate_seats = sorted(
        seat
        for seat in set(mapped_seats)
        if mapped_seats.count(seat) > 1
    )

    mapped_count = len(expected_set.intersection(mapped_set))

    total_expected = len(expected_set)

    coverage_percentage = (
        (mapped_count / total_expected) * 100
        if total_expected
        else 0
    )

    is_valid = (
        len(uncovered_seats) == 0
        and len(unexpected_seats) == 0
        and len(duplicate_seats) == 0
    )

    return {
        "status": "calibrated" if is_valid else "attention_required",
        "total_expected": total_expected,
        "total_mapped": mapped_count,
        "coverage_percentage": round(
            coverage_percentage,
            2
        ),
        "uncovered_seats": uncovered_seats,
        "unexpected_seats": unexpected_seats,
        "duplicate_seats": duplicate_seats,
    }


if __name__ == "__main__":

    expected = [
        "A01",
        "A02",
        "A03",
        "A04",
        "B01",
        "B02",
        "B03",
        "B04",
    ]

    mapped = [
        "A01",
        "A02",
        "A03",
        "A04",
        "B01",
        "B02",
        "B03",
    ]

    result = validate_calibration(
        expected,
        mapped
    )

    print(result)