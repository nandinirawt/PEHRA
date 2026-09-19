from typing import List, Dict, Any


def group_into_rows(
    points: List[Dict[str, float]],
    y_tolerance: float = 35.0,
) -> List[List[Dict[str, float]]]:
    """
    Group detected seat centers into rows using their Y coordinate.

    Each point should look like:
    {
        "x": 120,
        "y": 150
    }
    """

    if not points:
        return []

    # Sort from top to bottom.
    sorted_points = sorted(
        points,
        key=lambda p: p["y"],
    )

    rows: List[List[Dict[str, float]]] = []

    for point in sorted_points:

        placed = False

        for row in rows:

            average_y = sum(
                p["y"] for p in row
            ) / len(row)

            if abs(point["y"] - average_y) <= y_tolerance:
                row.append(point)
                placed = True
                break

        if not placed:
            rows.append([point])

    # Sort every row from left to right.
    for row in rows:
        row.sort(key=lambda p: p["x"])

    # Sort rows from top to bottom.
    rows.sort(
        key=lambda row: sum(
            p["y"] for p in row
        ) / len(row)
    )

    return rows


def validate_layout(
    detected_points: List[Dict[str, float]],
    expected_rows: int,
    expected_columns: int,
    y_tolerance: float = 35.0,
) -> Dict[str, Any]:
    """
    Compare detected seat positions with the user's
    expected row x column configuration.
    """

    rows = group_into_rows(
        detected_points,
        y_tolerance,
    )

    detected_rows = len(rows)

    row_counts = [
        len(row)
        for row in rows
    ]

    detected_columns = (
        max(row_counts)
        if row_counts
        else 0
    )

    row_mismatches = [
        {
            "row_number": index + 1,
            "expected_columns": expected_columns,
            "detected_columns": len(row),
        }
        for index, row in enumerate(rows)
        if len(row) != expected_columns
    ]

    rows_match = (
        detected_rows == expected_rows
    )

    columns_match = (
        detected_columns == expected_columns
        and len(row_mismatches) == 0
    )

    layout_matches = (
        rows_match
        and columns_match
    )

    return {
        "status": (
            "matched"
            if layout_matches
            else "attention_required"
        ),
        "expected": {
            "rows": expected_rows,
            "columns": expected_columns,
            "total_seats": (
                expected_rows *
                expected_columns
            ),
        },
        "detected": {
            "rows": detected_rows,
            "max_columns": detected_columns,
            "total_seats": len(
                detected_points
            ),
            "row_counts": row_counts,
        },
        "rows_match": rows_match,
        "columns_match": columns_match,
        "layout_matches": layout_matches,
        "row_mismatches": row_mismatches,
    }


if __name__ == "__main__":

    # -----------------------------------------
    # TEST 1: Correct 3 x 4 classroom
    # -----------------------------------------

    detected_points = [
        # Row A
        {"x": 100, "y": 100},
        {"x": 200, "y": 100},
        {"x": 300, "y": 100},
        {"x": 400, "y": 100},

        # Row B
        {"x": 100, "y": 200},
        {"x": 200, "y": 200},
        {"x": 300, "y": 200},
        {"x": 400, "y": 200},

        # Row C
        {"x": 100, "y": 300},
        {"x": 200, "y": 300},
        {"x": 300, "y": 300},
        {"x": 400, "y": 300},
    ]

    result = validate_layout(
        detected_points,
        expected_rows=3,
        expected_columns=4,
    )

    print("\n--- CORRECT LAYOUT ---")
    print(result)


    # -----------------------------------------
    # TEST 2: Missing one seat
    # -----------------------------------------

    detected_points_missing = detected_points[:-1]

    result = validate_layout(
        detected_points_missing,
        expected_rows=3,
        expected_columns=4,
    )

    print("\n--- MISSING SEAT ---")
    print(result)


    # -----------------------------------------
    # TEST 3: Wrong row count
    # -----------------------------------------

    detected_points_wrong_rows = [
        # Row A
        {"x": 100, "y": 100},
        {"x": 200, "y": 100},
        {"x": 300, "y": 100},
        {"x": 400, "y": 100},

        # Row B
        {"x": 100, "y": 200},
        {"x": 200, "y": 200},
        {"x": 300, "y": 200},
        {"x": 400, "y": 200},
    ]

    result = validate_layout(
        detected_points_wrong_rows,
        expected_rows=3,
        expected_columns=4,
    )

    print("\n--- WRONG ROW COUNT ---")
    print(result)