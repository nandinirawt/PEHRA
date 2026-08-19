from typing import List, Dict, Any


def generate_seats(rows: int, columns: int) -> List[str]:
    """
    Generate seat IDs from a row x column layout.

    Example:
    rows=2, columns=3

    A01 A02 A03
    B01 B02 B03
    """

    if rows <= 0:
        raise ValueError("Rows must be greater than 0.")

    if columns <= 0:
        raise ValueError("Columns must be greater than 0.")

    seats = []

    for row_index in range(rows):
        row_letter = chr(ord("A") + row_index)

        for column_index in range(1, columns + 1):
            seats.append(f"{row_letter}{column_index:02d}")

    return seats


def create_expected_layout(
    rows: int,
    columns: int
) -> Dict[str, Any]:

    seats = generate_seats(rows, columns)

    return {
        "rows": rows,
        "columns": columns,
        "total_seats": len(seats),
        "seat_ids": seats,
    }


if __name__ == "__main__":
    layout = create_expected_layout(3, 4)

    print(layout)