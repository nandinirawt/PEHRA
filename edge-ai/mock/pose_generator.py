from datetime import datetime, timezone
import time


def create_pose_data(
    seat_id,
    presence,
    confidence,
    head_direction,
    body_orientation,
    hand_state
):
    pose_data = {
        "seat_id": seat_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "presence": presence,
        "confidence": confidence,
        "pose_features": {
            "head_direction": head_direction,
            "body_orientation": body_orientation,
            "hand_state": hand_state
        }
    }

    return pose_data


def generate_normal_sequence(seat_id="A-01", count=5, delay=1):
    records = []

    for i in range(count):
        pose_data = create_pose_data(
            seat_id=seat_id,
            presence=True,
            confidence=0.95,
            head_direction="center",
            body_orientation="forward",
            hand_state="normal"
        )

        records.append(pose_data)

        print(f"\nNormal Record {i + 1}:")
        print(pose_data)

        time.sleep(delay)

    return records


def generate_head_turn_sequence(seat_id="B-04", delay=1):
    records =[]
    head_positions = [
        "center",
        "left",
        "center",
        "right",
        "center",
        "left"
    ]

    for i, direction in enumerate(head_positions):
        pose_data = create_pose_data(
            seat_id=seat_id,
            presence=True,
            confidence=0.95,
            head_direction=direction,
            body_orientation="forward",
            hand_state="normal"
        )

        print(f"\nHead Turn Record {i + 1}:")
        print(pose_data)
        records.append(pose_data)
        time.sleep(delay)
    return records

def generate_hand_anomaly_sequence(seat_id="B-04", delay=1):
    records = []
    hand_states = [
        "normal",
        "unusual_movement",
        "normal",
        "unusual_movement",
        "normal",
        "unusual_movement"
    ]

    for i, state in enumerate(hand_states):
        pose_data = create_pose_data(
            seat_id=seat_id,
            presence=True,
            confidence=0.95,
            head_direction="center",
            body_orientation="forward",
            hand_state=state
        )

        print(f"\nHand Anomaly Record {i + 1}:")
        print(pose_data)
        records.append(pose_data)
        time.sleep(delay)
    return records

def generate_combined_suspicious_sequence(seat_id="B-04", delay=1):
    records=[]
    sequence = [
        {
            "head_direction": "center",
            "body_orientation": "forward",
            "hand_state": "normal"
        },
        {
            "head_direction": "left",
            "body_orientation": "forward",
            "hand_state": "normal"
        },
        {
            "head_direction": "center",
            "body_orientation": "left",
            "hand_state": "unusual_movement"
        },
        {
            "head_direction": "right",
            "body_orientation": "right",
            "hand_state": "normal"
        },
        {
            "head_direction": "left",
            "body_orientation": "left",
            "hand_state": "unusual_movement"
        },
        {
            "head_direction": "center",
            "body_orientation": "forward",
            "hand_state": "unusual_movement"
        }
    ]

    for i, features in enumerate(sequence):
        pose_data = create_pose_data(
            seat_id=seat_id,
            presence=True,
            confidence=0.95,
            head_direction=features["head_direction"],
            body_orientation=features["body_orientation"],
            hand_state=features["hand_state"]
        )

        print(f"\nCombined Sequence Record {i + 1}:")
        print(pose_data)

        records.append(pose_data)
        time.sleep(delay)
    return records