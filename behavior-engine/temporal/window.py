import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from collections import defaultdict
from typing import Dict, List, Any


class BehaviorWindow:
    """
    Keeps recent behavior events for each seat.

    This is a simple prototype temporal window.
    Later it can be replaced with timestamp-based
    sliding-window logic from real POSE_DATA.
    """

    def __init__(self, max_events: int = 5):
        self.max_events = max_events
        self.events = defaultdict(list)

    def add_event(self, event: Dict[str, Any]) -> None:
        seat_id = event["seat_id"]

        self.events[seat_id].append(event)

        # Keep only the most recent events
        if len(self.events[seat_id]) > self.max_events:
            self.events[seat_id].pop(0)

    def get_events(self, seat_id: str) -> List[Dict[str, Any]]:
        return self.events.get(seat_id, [])

    def count_event_type(
        self,
        seat_id: str,
        event_type: str
    ) -> int:
        return sum(
            1
            for event in self.get_events(seat_id)
            if event.get("event_type") == event_type
        )

    def has_persistent_behavior(
        self,
        seat_id: str,
        event_type: str,
        minimum_occurrences: int = 3
    ) -> bool:
        return (
            self.count_event_type(seat_id, event_type)
            >= minimum_occurrences
        )


if __name__ == "__main__":
    from events.mock_event_generator import generate_scenario

    window = BehaviorWindow(max_events=5)

    # Three repeated head-turn events for B-04
    for _ in range(3):
        event = generate_scenario(
            "repeated_head_turns",
            exam_id="EXAM-01",
            seat_id="B-04",
        )

        window.add_event(event)

    print("Recent events:")
    print(window.get_events("B-04"))

    print("\nHead turn count:")
    print(
        window.count_event_type(
            "B-04",
            "repeated_head_turns"
        )
    )

    print("\nPersistent behavior:")
    print(
        window.has_persistent_behavior(
            "B-04",
            "repeated_head_turns",
            minimum_occurrences=3
        )
    )
    from events.mock_event_generator import generate_scenario