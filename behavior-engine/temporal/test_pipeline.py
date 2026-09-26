from datetime import datetime, timezone

from events.p5_event_adapter import convert_p5_observation
from events.event_processor import process_events
from temporal.window import BehaviorWindow
from temporal.risk_window_processor import RiskWindowProcessor


def main():

    # -----------------------------------------
    # Create temporal window
    # -----------------------------------------

    window = BehaviorWindow(max_events=5)


    # -----------------------------------------
    # Simulated P5 observations
    # -----------------------------------------

    observations = [
    # Head turn 1
    {
        "head_direction": "left",
        "body_orientation": "forward",
        "hand_state": "normal",
        "confidence": 0.95,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    },

    # Head turn 2
    {
        "head_direction": "right",
        "body_orientation": "forward",
        "hand_state": "normal",
        "confidence": 0.95,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    },

    # Head turn 3 + body orientation + hand anomaly
    {
        "head_direction": "left",
        "body_orientation": "left",
        "hand_state": "unusual_movement",
        "confidence": 0.95,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    },
]


    # -----------------------------------------
    # P5 → standard events → temporal window
    # -----------------------------------------

    for observation in observations:

        events = convert_p5_observation(
            observation=observation,
            exam_id="EXAM-01",
            seat_id="B-04",
        )

        for event in events:
            window.add_event(event)


    # -----------------------------------------
    # Show recent events
    # -----------------------------------------

    print("Recent events:")

    for event in window.get_events("B-04"):
        print(event)


    # -----------------------------------------
    # Count head turns
    # -----------------------------------------

    head_turn_count = window.count_event_type(
        "B-04",
        "single_head_turn",
    )

    print("\nHead-turn event count:")
    print(head_turn_count)


    # -----------------------------------------
    # Temporal processing
    # -----------------------------------------

    processor = RiskWindowProcessor(window)

    derived_events = processor.process_seat("B-04")

    print("\nDerived temporal events:")

    for event in derived_events:
        print(event)


    # -----------------------------------------
    # Risk calculation
    # -----------------------------------------

    risk_events = derived_events
    risk_result = process_events(
        risk_events
    )

    print("\nRisk result:")
    print(risk_result)


if __name__ == "__main__":
    main()