import cv2

from seat_detector import detect_chairs


def group_into_rows(detections, expected_rows):
    """
    Group detected seat centers into the expected number
    of physical rows.

    Uses the Y coordinate and divides the detections
    into spatial row groups.
    """

    if not detections:
        return []

    sorted_detections = sorted(
        detections,
        key=lambda d: d["center"][1]
    )

    n = len(sorted_detections)

    # Start with evenly sized groups.
    base_size = n // expected_rows
    remainder = n % expected_rows

    rows = []
    start = 0

    for row_index in range(expected_rows):

        size = base_size

        if row_index < remainder:
            size += 1

        row = sorted_detections[
            start:start + size
        ]

        row = sorted(
            row,
            key=lambda d: d["center"][0]
        )

        rows.append(row)

        start += size

    return rows

def sort_detections_spatially(
    detections,
    expected_rows,
    expected_columns,
):
    """
    Sort detected seats top-to-bottom, then left-to-right.

    Returns the detections ordered as:
    R1-C1, R1-C2, ..., R2-C1, ...
    """

    if not detections:
        return []

    # Sort by vertical position first.
    sorted_by_y = sorted(
        detections,
        key=lambda d: d["center"][1]
    )

    total = len(sorted_by_y)

    # For this prototype, use the configured
    # rows/columns to create spatial groups.
    expected_total = expected_rows * expected_columns

    if total != expected_total:
        return sorted_by_y

    ordered = []

    for row_index in range(expected_rows):
        start = row_index * expected_columns
        end = start + expected_columns

        row = sorted_by_y[start:end]

        row.sort(
            key=lambda d: d["center"][0]
        )

        ordered.extend(row)

    return ordered
def _cluster_1d(values, k, iterations=30):
    """
    Simple 1D k-means clustering.
    Returns labels for each value.
    """

    if len(values) < k:
        return [0] * len(values)

    sorted_values = sorted(values)

    centers = [
        sorted_values[
            int(i * (len(sorted_values) - 1) / (k - 1))
        ]
        for i in range(k)
    ]

    labels = [0] * len(values)

    for _ in range(iterations):

        # Assign each value to nearest center
        for i, value in enumerate(values):
            labels[i] = min(
                range(k),
                key=lambda c: abs(value - centers[c])
            )

        # Recalculate centers
        new_centers = []

        for cluster_id in range(k):
            cluster_values = [
                values[i]
                for i in range(len(values))
                if labels[i] == cluster_id
            ]

            if cluster_values:
                new_centers.append(
                    sum(cluster_values) / len(cluster_values)
                )
            else:
                new_centers.append(
                    centers[cluster_id]
                )

        if all(
            abs(new_centers[i] - centers[i]) < 0.5
            for i in range(k)
        ):
            break

        centers = new_centers

    return labels


def order_detections_into_grid(
    detections,
    expected_rows,
    expected_columns
):
    """
    Order seats spatially using columns first.

    For the classroom camera:
        1. Sort detections by X.
        2. Divide them into expected columns.
        3. Sort each column by Y.
        4. Rebuild the grid row-by-row.

    This works better for the current perspective
    because column X positions remain more stable.
    """

    if not detections:
        return []

    expected_total = (
        expected_rows *
        expected_columns
    )

    if len(detections) != expected_total:
        return sorted(
            detections,
            key=lambda d: (
                d["center"][0],
                d["center"][1]
            )
        )

    # -------------------------------------------------
    # Step 1: sort by X
    # -------------------------------------------------

    sorted_by_x = sorted(
        detections,
        key=lambda d: d["center"][0]
    )

    # -------------------------------------------------
    # Step 2: divide into columns
    # -------------------------------------------------

    columns = []

    for column_index in range(
        expected_columns
    ):

        start = (
            column_index *
            expected_rows
        )

        end = start + expected_rows

        column = sorted_by_x[
            start:end
        ]

        # Top → bottom
        column.sort(
            key=lambda d: d["center"][1]
        )

        columns.append(column)

    # -------------------------------------------------
    # Step 3: rebuild row-wise
    # -------------------------------------------------

    ordered = []

    for row_index in range(
        expected_rows
    ):

        for column_index in range(
            expected_columns
        ):

            column = columns[column_index]

            if row_index < len(column):
                ordered.append(
                    column[row_index]
                )

    return ordered
    """
    Automatically order detections into:

    R1-C1, R1-C2, ...
    R2-C1, R2-C2, ...

    using vertical clustering for rows and
    horizontal sorting within each row.
    """

    if not detections:
        return []

    total_expected = (
        expected_rows * expected_columns
    )

    if len(detections) != total_expected:
        return sorted(
            detections,
            key=lambda d: (
                d["center"][1],
                d["center"][0]
            )
        )

    y_values = [
        detection["center"][1]
        for detection in detections
    ]

    row_labels = _cluster_1d(
        y_values,
        expected_rows
    )

    rows = []

    for row_id in range(expected_rows):

        row = [
            detections[i]
            for i in range(len(detections))
            if row_labels[i] == row_id
        ]

        # Physical left → right order
        row.sort(
            key=lambda d: d["center"][0]
        )

        rows.append(row)

    # Top → bottom
    rows.sort(
        key=lambda row:
        sum(
            d["center"][1]
            for d in row
        ) / len(row)
        if row else float("inf")
    )

    ordered = []

    for row in rows:
        ordered.extend(row)

    return ordered
def analyze_grid(
    detections,
    expected_rows,
    expected_columns
):
    """
    Analyze the detected physical seating arrangement.
    """

    rows = group_into_rows(
    detections,
    expected_rows
)
    ordered_detections = order_detections_into_grid(
    detections,
    expected_rows,
    expected_columns
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

    total_seats = len(detections)

    rows_match = (
        detected_rows == expected_rows
    )

    columns_match = (
        detected_columns == expected_columns
    )

    counts_match = all(
        count == expected_columns
        for count in row_counts
    )

    calibration_passed = (
        rows_match
        and columns_match
        and counts_match
    )

    return {
        "expected": {
            "rows": expected_rows,
            "columns": expected_columns,
            "total_seats":
                expected_rows * expected_columns,
        },

        "detected": {
            "rows": detected_rows,
            "columns": detected_columns,
            "total_seats": total_seats,
            "row_counts": row_counts,
        },
        

        "calibration_passed":
            calibration_passed,

        "rows_match":
            rows_match,

        "columns_match":
            columns_match,

        "counts_match":
            counts_match,

        "grid": [
            [
                {
                    "x": round(
                        seat["center"][0],
                        2
                    ),
                    "y": round(
                        seat["center"][1],
                        2
                    ),
                }
                for seat in row
            ]
            for row in rows
        ],
        "ordered_seats": [
    {
        "detected_id": index + 1,
        "row": (index // expected_columns) + 1,
        "column": (index % expected_columns) + 1,
        "label": (
            f"R{(index // expected_columns) + 1}"
            f"-C{(index % expected_columns) + 1}"
        ),
        "x": round(d["center"][0], 2),
        "y": round(d["center"][1], 2),
        "confidence": d["confidence"],
    }
    for index, d in enumerate(ordered_detections)
],
    }


if __name__ == "__main__":

    image_path = input(
        "Enter classroom image path: "
    ).strip()

    expected_rows = int(
        input("Enter expected rows: ")
    )

    expected_columns = int(
        input("Enter expected columns: ")
    )

    image = cv2.imread(image_path)

    if image is None:
        raise FileNotFoundError(
            f"Could not read image: {image_path}"
        )

    print("\nDetecting seats...")

    detections = detect_chairs(image)

    print(
        f"Detected seat candidates: "
        f"{len(detections)}"
    )

    print("\nDetected seat centers:")

    # Print every detected seat
    for i, detection in enumerate(
        detections,
        start=1
    ):
        x, y = detection["center"]

        print(
            f"Seat {i}: "
            f"x={x:.1f}, "
            f"y={y:.1f}, "
            f"confidence={detection['confidence']:.3f}"
        )

    # IMPORTANT:
    # This is OUTSIDE the for loop.
    result = analyze_grid(
        detections,
        expected_rows,
        expected_columns
    )

    print("\n==============================")
    print("       CALIBRATION RESULT")
    print("==============================")

    print(
        f"Expected: "
        f"{result['expected']['rows']} × "
        f"{result['expected']['columns']}"
    )

    print(
        f"Detected rows: "
        f"{result['detected']['rows']}"
    )

    print(
        f"Detected columns: "
        f"{result['detected']['columns']}"
    )

    print(
        f"Detected seats: "
        f"{result['detected']['total_seats']}"
    )

    print(
        f"Seats per row: "
        f"{result['detected']['row_counts']}"
    )

    print("------------------------------")

    if result["calibration_passed"]:

        print("✓ CALIBRATION PASSED")

        print(
            "Camera seating layout matches "
            "the configured structure."
        )

    else:

        print("✗ CALIBRATION FAILED")

        if not result["rows_match"]:
            print(
                f"- Expected "
                f"{expected_rows} rows but detected "
                f"{result['detected']['rows']}"
            )

        if not result["columns_match"]:
            print(
                f"- Expected "
                f"{expected_columns} columns but detected "
                f"{result['detected']['columns']}"
            )

        if not result["counts_match"]:
            print(
                "- One or more rows do not contain "
                f"{expected_columns} seats."
            )

    print("==============================")