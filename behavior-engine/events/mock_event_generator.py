from datetime import datetime, timezone
import random
import uuid


def generate_event(
    exam_id: str,
    seat_id: str,
    event_type: str,
    severity: str,
    confidence: float,
    duration: int,
):
    return {
        "event_id": f"EVT-{uuid.uuid4().hex[:8].upper()}",
        "exam_id": exam_id,
        "seat_id": seat_id,
        "event_type": event_type,
        "severity": severity,
        "confidence": round(confidence, 2),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "duration": duration,
    }


def generate_scenario(
    scenario: str,
    exam_id: str = "EXAM-01",
    seat_id: str = "B-04",
):
    scenarios = {
        "single_head_turn": {
            "event_type": "single_head_turn",
            "severity": "normal",
            "confidence": 0.42,
            "duration": 2,
        },

        "repeated_head_turns": {
            "event_type": "repeated_head_turns",
            "severity": "under_review",
            "confidence": 0.78,
            "duration": 18,
        },

        "body_orientation": {
            "event_type": "body_orientation_change",
            "severity": "under_review",
            "confidence": 0.74,
            "duration": 12,
        },

        "hand_anomaly": {
            "event_type": "hand_movement_anomaly",
            "severity": "under_review",
            "confidence": 0.71,
            "duration": 10,
        },

        "multi_signal_suspicious": {
            "event_type": "multi_signal_pattern",
            "severity": "high_risk",
            "confidence": 0.91,
            "duration": 35,
        },
    }

    if scenario not in scenarios:
        raise ValueError(
            f"Unknown scenario: {scenario}"
        )

    return generate_event(
        exam_id=exam_id,
        seat_id=seat_id,
        **scenarios[scenario],
    )


def main():
    scenarios = [
        "single_head_turn",
        "repeated_head_turns",
        "body_orientation",
        "hand_anomaly",
        "multi_signal_suspicious",
    ]

    for scenario in scenarios:
        event = generate_scenario(scenario)
        print("\nScenario:", scenario)
        print(event)


if __name__ == "__main__":
    main()