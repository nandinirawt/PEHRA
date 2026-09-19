from datetime import datetime, timezone
from typing import Dict, Any, List


def convert_p5_observation(
    observation: Dict[str, Any],
    exam_id: str,
    seat_id: str,
) -> List[Dict[str, Any]]:
    """
    Convert one P5 live-detection observation into
    standardized PEHRA behavioral events.

    P5 currently provides:
    - head_direction
    - body_orientation
    - hand_state
    - confidence
    """

    events = []

    confidence = float(
        observation.get("confidence", 0.0)
    )

    timestamp = observation.get(
        "timestamp",
        datetime.now(timezone.utc).isoformat()
    )

    # -------------------------------------------------
    # HEAD DIRECTION
    # -------------------------------------------------

    head_direction = observation.get(
        "head_direction"
    )

    if head_direction in {"left", "right"}:

        events.append({
            "exam_id": exam_id,
            "seat_id": seat_id,
            "event_type": "single_head_turn",
            "severity": "normal",
            "confidence": confidence,
            "timestamp": timestamp,
            "duration": 1,
            "metadata": {
                "direction": head_direction
            }
        })

    # -------------------------------------------------
    # BODY ORIENTATION
    # -------------------------------------------------

    body_orientation = observation.get(
        "body_orientation"
    )

    if body_orientation in {"left", "right"}:

        events.append({
            "exam_id": exam_id,
            "seat_id": seat_id,
            "event_type": "body_orientation_change",
            "severity": "under_review",
            "confidence": confidence,
            "timestamp": timestamp,
            "duration": 1,
            "metadata": {
                "direction": body_orientation
            }
        })

    # -------------------------------------------------
    # HAND STATE
    # -------------------------------------------------

    hand_state = observation.get(
        "hand_state"
    )

    if hand_state == "unusual_movement":

        events.append({
            "exam_id": exam_id,
            "seat_id": seat_id,
            "event_type": "hand_movement_anomaly",
            "severity": "under_review",
            "confidence": confidence,
            "timestamp": timestamp,
            "duration": 1,
            "metadata": {}
        })

    return events
#---------------------------------------
if __name__ == "__main__":

    sample_observation = {
        "head_direction": "left",
        "body_orientation": "left",
        "hand_state": "unusual_movement",
        "confidence": 0.95,
        "timestamp": "2026-08-23T10:30:00Z"
    }

    events = convert_p5_observation(
        observation=sample_observation,
        exam_id="EXAM-01",
        seat_id="B-04",
    )

    for event in events:
        print(event)