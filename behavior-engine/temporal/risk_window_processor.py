from typing import List, Dict, Any

from temporal.window import BehaviorWindow


class RiskWindowProcessor:
    """
    Converts recent low-level behavior events into
    higher-level temporal events while preserving
    independent behavioral signals.
    """

    def __init__(
        self,
        window: BehaviorWindow | None = None,
    ):
        self.window = window or BehaviorWindow(max_events=5)

    def add_event(self, event: Dict[str, Any]) -> None:
        self.window.add_event(event)

    def process_seat(
        self,
        seat_id: str
    ) -> List[Dict[str, Any]]:

        events = self.window.get_events(seat_id)

        if not events:
            return []

        derived_events = []

        # -------------------------------------------------
        # REPEATED HEAD TURNS
        # -------------------------------------------------

        head_events = [
            event
            for event in events
            if event.get("event_type") == "single_head_turn"
        ]

        if len(head_events) >= 3:

            first_event = head_events[0]

            derived_events.append({
                "exam_id": first_event.get("exam_id"),
                "seat_id": seat_id,
                "event_type": "repeated_head_turns",
                "severity": "under_review",
                "confidence": max(
                    event.get("confidence", 0.0)
                    for event in head_events
                ),
                "timestamp": first_event.get("timestamp"),
                "duration": sum(
                    event.get("duration", 0)
                    for event in head_events
                ),
                "metadata": {
                    "occurrences": len(head_events)
                }
            })

        # -------------------------------------------------
        # BODY ORIENTATION
        # -------------------------------------------------

        body_events = [
            event
            for event in events
            if event.get("event_type")
            == "body_orientation_change"
        ]

        if body_events:

            latest_body = body_events[-1]

            derived_events.append({
                **latest_body,
                "severity": "under_review",
            })

        # -------------------------------------------------
        # HAND ANOMALY
        # -------------------------------------------------

        hand_events = [
            event
            for event in events
            if event.get("event_type")
            == "hand_movement_anomaly"
        ]

        if hand_events:

            latest_hand = hand_events[-1]

            derived_events.append({
                **latest_hand,
                "severity": "under_review",
            })

        # -------------------------------------------------
        # MULTI-SIGNAL PATTERN
        # -------------------------------------------------

        signal_categories = set()

        if len(head_events) >= 3:
            signal_categories.add("head_turn")

        if body_events:
            signal_categories.add("body_orientation")

        if hand_events:
            signal_categories.add("hand_anomaly")

        if len(signal_categories) >= 3:

            first_event = events[0]

            derived_events.append({
                "exam_id": first_event.get("exam_id"),
                "seat_id": seat_id,
                "event_type": "multi_signal_pattern",
                "severity": "high_risk",
                "confidence": max(
                    event.get("confidence", 0.0)
                    for event in events
                ),
                "timestamp": first_event.get("timestamp"),
                "duration": max(
                    event.get("duration", 0)
                    for event in events
                ),
                "metadata": {
                    "signals": sorted(signal_categories)
                }
            })

        return derived_events