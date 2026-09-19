import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from risk.state_machine import calculate_risk_score


# Maps behavior event types to their risk contribution.
EVENT_WEIGHTS = {
        "multi_signal_pattern": {
        "temporal_points": 24,
    },
    "single_head_turn": {
        "head_turn_points": 18,
    },
    "repeated_head_turns": {
        "head_turn_points": 18,
    },
    "body_orientation_change": {
        "body_orientation_points": 20,
    },
    "hand_movement_anomaly": {
        "hand_anomaly_points": 8,
    },
    "neighbor_interaction": {
        "neighbor_interaction_points": 12,
    },
    "temporal_pattern": {
        "temporal_points": 24,
    },
}


def process_events(events: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Process behavior events belonging to the same seat/session
    and return an explainable risk result.
    """

    if not events:
        return {
            "risk_score": 0,
            "status": "normal",
            "contributions": [],
        }

    points = {
        "head_turn_points": 0,
        "body_orientation_points": 0,
        "hand_anomaly_points": 0,
        "neighbor_interaction_points": 0,
        "temporal_points": 0,
    }

    for event in events:
        event_type = event.get("event_type")

        contribution = EVENT_WEIGHTS.get(event_type)

        if not contribution:
            print(
                f"Warning: unknown event type: {event_type}"
            )
            continue

        for key, value in contribution.items():
            points[key] += value

    return calculate_risk_score(**points)


if __name__ == "__main__":
    from events.mock_event_generator import generate_scenario

    # -----------------------------------------
    # Scenario 1: One normal/weak event
    # -----------------------------------------
    single_event = [
        generate_scenario(
            "single_head_turn",
            exam_id="EXAM-01",
            seat_id="B-04",
        )
    ]

    result = process_events(single_event)

    print("\n--- SINGLE EVENT ---")
    print(result)


    # -----------------------------------------
    # Scenario 2: Two signals
    # -----------------------------------------
    two_signal_events = [
        generate_scenario(
            "repeated_head_turns",
            exam_id="EXAM-01",
            seat_id="B-04",
        ),
        generate_scenario(
            "body_orientation",
            exam_id="EXAM-01",
            seat_id="B-04",
        ),
    ]

    result = process_events(two_signal_events)

    print("\n--- TWO SIGNALS ---")
    print(result)


    # -----------------------------------------
    # Scenario 3: Multiple suspicious signals
    # -----------------------------------------
    multi_signal_events = [
        generate_scenario(
            "repeated_head_turns",
            exam_id="EXAM-01",
            seat_id="B-04",
        ),
        generate_scenario(
            "body_orientation",
            exam_id="EXAM-01",
            seat_id="B-04",
        ),
        generate_scenario(
            "hand_anomaly",
            exam_id="EXAM-01",
            seat_id="B-04",
        ),
        generate_scenario(
            "multi_signal_suspicious",
            exam_id="EXAM-01",
            seat_id="B-04",
        ),
    ]

    result = process_events(multi_signal_events)

    print("\n--- MULTI SIGNAL ---")
    print(result)