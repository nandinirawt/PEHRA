from typing import Dict, Any, List

class FeatureExtractor:
    def __init__(self):
        self.benign_actions = {"stretching", "clock_check", "adjusting_posture", "normal"}

    def extract_signals(self, pose_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        features = pose_data.get("pose_features", {})
        signals = []

        if features.get("benign_context") in self.benign_actions or features.get("status") == "benign":
            return []

        timestamp = pose_data.get("timestamp")
        confidence = pose_data.get("confidence", 0.85)

        head_dir = str(features.get("head_direction", "center")).lower()
        body_dir = str(features.get("body_orientation", "forward")).lower()
        hand_state = str(features.get("hand_movement", features.get("hand_state", ""))).lower()

        if head_dir in ["left", "right", "turned", "away"]:
            signals.append({
                "signal": "repeated_head_turns",
                "confidence": confidence,
                "timestamp": timestamp
            })

        if body_dir in ["left", "right", "turned_left", "turned_right", "away"]:
            signals.append({
                "signal": "body_orientation",
                "confidence": confidence,
                "timestamp": timestamp
            })

        if "abnormal" in hand_state or features.get("hand_abnormal", False) or features.get("abnormal_hand", False):
            signals.append({
                "signal": "hand_anomaly",
                "confidence": confidence,
                "timestamp": timestamp
            })

        if head_dir in ["left", "right"] and body_dir in ["left", "right"] and head_dir == body_dir:
            signals.append({
                "signal": "neighbor_interaction",
                "confidence": confidence,
                "timestamp": timestamp
            })

        return signals
