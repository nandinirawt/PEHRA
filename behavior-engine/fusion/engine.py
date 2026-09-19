from typing import Dict, Any, List
from config import (
    WEIGHTS,
    DECAY_GRACE_PERIOD_SECONDS,
    DECAY_RATE_PER_SECOND,
    MAX_RISK_SCORE,
    MIN_RISK_SCORE,
    MIN_INDEPENDENT_SIGNALS,
    SCORE_UNDER_REVIEW_MIN,
    SCORE_HIGH_RISK_MIN
)

class RiskFusionEngine:
    def __init__(self):
        self.seat_states: Dict[str, Dict[str, Any]] = {}

    def get_or_init_state(self, seat_id: str, current_time: float):
        if seat_id not in self.seat_states:
            self.seat_states[seat_id] = {
                "risk_score": 0.0,
                "confidence": 0.0,
                "status": "normal",
                "last_active_time": current_time,
                "last_calculation_time": current_time,
                "contributions": []
            }
        return self.seat_states[seat_id]

    def apply_decay(self, seat_id: str, current_time: float) -> float:
        state = self.seat_states[seat_id]
        time_since_active = current_time - state["last_active_time"]

        if time_since_active > DECAY_GRACE_PERIOD_SECONDS:
            decay_seconds = time_since_active - DECAY_GRACE_PERIOD_SECONDS
            decay_amount = decay_seconds * DECAY_RATE_PER_SECOND
            state["risk_score"] = max(MIN_RISK_SCORE, state["risk_score"] - decay_amount)

        state["last_calculation_time"] = current_time
        return state["risk_score"]

    def compute_risk(
        self,
        seat_id: str,
        persistent_data: Dict[str, Any],
        current_time: float
    ) -> Dict[str, Any]:
        state = self.get_or_init_state(seat_id, current_time)
        qualified = persistent_data.get("qualified_signals", {})
        has_temporal_pattern = persistent_data.get("has_temporal_pattern", False)

        contributions: List[Dict[str, Any]] = []
        raw_score = 0.0
        confidences = []

        if qualified:
            state["last_active_time"] = current_time

            for sig_name, data in qualified.items():
                base_weight = WEIGHTS.get(sig_name, 10)
                sig_conf = data["avg_confidence"]
                points = int(round(base_weight * sig_conf))
                contributions.append({"signal": sig_name, "points": points})
                raw_score += points
                confidences.append(sig_conf)

            if has_temporal_pattern:
                t_points = WEIGHTS["temporal_pattern"]
                contributions.append({"signal": "temporal_pattern", "points": t_points})
                raw_score += t_points

            if len(qualified) < MIN_INDEPENDENT_SIGNALS and raw_score >= SCORE_UNDER_REVIEW_MIN:
                raw_score = SCORE_UNDER_REVIEW_MIN - 1

            state["risk_score"] = min(MAX_RISK_SCORE, raw_score)
            state["confidence"] = round(sum(confidences) / len(confidences), 2) if confidences else 0.85
        else:
            self.apply_decay(seat_id, current_time)
            contributions = []

        score = int(round(state["risk_score"]))
        if score >= SCORE_HIGH_RISK_MIN:
            status = "high_risk"
        elif score >= SCORE_UNDER_REVIEW_MIN:
            status = "under_review"
        else:
            status = "normal"

        state["status"] = status
        state["contributions"] = contributions

        return {
            "seat_id": seat_id,
            "risk_score": score,
            "confidence": state["confidence"],
            "status": status,
            "contributions": contributions
        }
