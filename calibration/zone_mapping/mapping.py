from typing import Dict, List


class CalibrationMapper:
    def __init__(self):
        self.mappings: Dict[str, List[str]] = {}

    def add_zone_mapping(
        self,
        camera_id: str,
        zone_id: str,
        seat_ids: List[str],
    ) -> None:
        key = f"{camera_id}:{zone_id}"
        self.mappings[key] = seat_ids

    def get_seats_for_zone(
        self,
        camera_id: str,
        zone_id: str,
    ) -> List[str]:
        key = f"{camera_id}:{zone_id}"
        return self.mappings.get(key, [])

    def is_seat_mapped(self, seat_id: str) -> bool:
        return any(
            seat_id in seats
            for seats in self.mappings.values()
        )


if __name__ == "__main__":
    mapper = CalibrationMapper()

    mapper.add_zone_mapping(
        "CAM-01",
        "ZONE-01",
        ["A01", "A02", "A03", "A04", "A05", "A06"],
    )

    mapper.add_zone_mapping(
        "CAM-01",
        "ZONE-02",
        ["B01", "B02", "B03", "B04", "B05", "B06"],
    )

    print(
        "ZONE-01:",
        mapper.get_seats_for_zone("CAM-01", "ZONE-01"),
    )

    print(
        "B04 mapped:",
        mapper.is_seat_mapped("B04"),
    )

    print(
        "C01 mapped:",
        mapper.is_seat_mapped("C01"),
    )