from typing import Dict, Any, List

from config import (
    WEIGHTS,
    DECAY_GRACE_PERIOD_SECONDS,
    DECAY_RATE_PER_SECOND,
    MAX_RISK_SCORE,
    MIN_RISK_SCORE,
    MIN_INDEPENDENT_SIGNALS,
    SCORE_UNDER_REVIEW_MIN,
    SCORE_HIGH_RISK_MIN,
)


class RiskFusionEngine:

    def __init__(self):
        self.seat_states: Dict[str, Dict[str, Any]] = {}

    def get_or_init_state(
        self,
        seat_id: str,
        current_time: float,
    ) -> Dict[str, Any]:

        if seat_id not in self.seat_states:
            self.seat_states[seat_id] = {
                "risk_score": 0.0,
                "confidence": 0.0,
                "status": "normal",

                "last_active_time": current_time,
                "last_calculation_time": current_time,
                "last_decay_time": current_time,

                "occurrence_counts": {},
                "processed_timestamps": {},

                "temporal_bonus_applied": False,
                "contributions": [],
            }

        return self.seat_states[seat_id]

    def _update_status(
        self,
        state: Dict[str, Any],
    ) -> None:

        score = int(
            round(state["risk_score"])
        )

        if score >= SCORE_HIGH_RISK_MIN:
            state["status"] = "high_risk"

        elif score >= SCORE_UNDER_REVIEW_MIN:
            state["status"] = "under_review"

        else:
            state["status"] = "normal"

    def apply_decay(
        self,
        seat_id: str,
        current_time: float,
    ) -> float:

        state = self.seat_states[seat_id]

        time_since_active = (
            current_time
            - state["last_active_time"]
        )

        if time_since_active > DECAY_GRACE_PERIOD_SECONDS:

            decay_start_time = (
                state["last_active_time"]
                + DECAY_GRACE_PERIOD_SECONDS
            )

            decay_from = max(
                state["last_decay_time"],
                decay_start_time,
            )

            decay_seconds = (
                current_time - decay_from
            )

            if decay_seconds > 0:

                decay_amount = (
                    decay_seconds
                    * DECAY_RATE_PER_SECOND
                )

                state["risk_score"] = max(
                    MIN_RISK_SCORE,
                    state["risk_score"] - decay_amount,
                )

                state["last_decay_time"] = current_time

        if state["risk_score"] <= MIN_RISK_SCORE:

            state["risk_score"] = MIN_RISK_SCORE
            state["occurrence_counts"] = {}
            state["temporal_bonus_applied"] = False
            state["contributions"] = []
            state["status"] = "normal"

        else:
            self._update_status(state)

        state["last_calculation_time"] = current_time

        return state["risk_score"]

    def _increment_factor(
        self,
        occurrence_number: int,
    ) -> float:
        """
        Gradually increase confidence in repeated behavior
        without allowing a single observation to become high risk.

        1st observation -> 40%
        2nd observation -> 30%
        3rd observation -> 25%
        4th+ observation -> 10%
        """

        if occurrence_number == 1:
            return 0.40

        if occurrence_number == 2:
            return 0.30

        if occurrence_number == 3:
            return 0.25

        return 0.10

    def compute_risk(
        self,
        seat_id: str,
        persistent_data: Dict[str, Any],
        current_time: float,
    ) -> Dict[str, Any]:

        state = self.get_or_init_state(
            seat_id,
            current_time,
        )

        # Apply decay before processing current evidence.
        self.apply_decay(
            seat_id,
            current_time,
        )

        observed = persistent_data.get(
            "observed_signals",
            {},
        )

        has_temporal_pattern = persistent_data.get(
            "has_temporal_pattern",
            False,
        )

        contributions: List[Dict[str, Any]] = []
        confidences = []
        new_evidence = False

        # --------------------------------------------------------------
        # PROCESS NEW OBSERVATIONS
        # --------------------------------------------------------------

        for sig_name, data in observed.items():

            current_latest_timestamp = float(
                data.get(
                    "latest_timestamp",
                    current_time,
                )
            )

            previous_latest_timestamp = float(
                state["processed_timestamps"].get(
                    sig_name,
                    -1,
                )
            )

            avg_confidence = float(
                data.get(
                    "avg_confidence",
                    0.8,
                )
            )

            confidences.append(
                avg_confidence
            )

            is_new_observation = (
                current_latest_timestamp
                > previous_latest_timestamp
            )

            if not is_new_observation:
                continue

            new_evidence = True

            occurrence_number = (
                state["occurrence_counts"].get(
                    sig_name,
                    0,
                ) + 1
            )

            state["occurrence_counts"][
                sig_name
            ] = occurrence_number

            base_weight = WEIGHTS.get(
                sig_name,
                10,
            )

            factor = self._increment_factor(
                occurrence_number,
            )

            points = max(
                1,
                int(
                    round(
                        base_weight
                        * avg_confidence
                        * factor
                    )
                ),
            )

            state["risk_score"] += points

            contributions.append(
                {
                    "signal": sig_name,
                    "points": points,
                }
            )

            state["processed_timestamps"][
                sig_name
            ] = current_latest_timestamp

        # --------------------------------------------------------------
        # TEMPORAL PATTERN CONTRIBUTION
        # --------------------------------------------------------------

        if (
            has_temporal_pattern
            and new_evidence
            and not state["temporal_bonus_applied"]
        ):

            temporal_points = WEIGHTS[
                "temporal_pattern"
            ]

            state["risk_score"] += temporal_points

            contributions.append(
                {
                    "signal": "temporal_pattern",
                    "points": temporal_points,
                }
            )

            state["temporal_bonus_applied"] = True

        elif not has_temporal_pattern:

            state["temporal_bonus_applied"] = False

        # --------------------------------------------------------------
        # REFRESH ACTIVITY TIMER
        # --------------------------------------------------------------

        if new_evidence:

            state["last_active_time"] = current_time
            state["last_decay_time"] = current_time

        else:

            self.apply_decay(
                seat_id,
                current_time,
            )

        # --------------------------------------------------------------
        # SINGLE-SIGNAL SAFETY CAP
        # --------------------------------------------------------------

        independent_signal_count = len(observed)

        if (
            new_evidence
            and independent_signal_count
            < MIN_INDEPENDENT_SIGNALS
        ):

            state["risk_score"] = min(
                state["risk_score"],
                SCORE_UNDER_REVIEW_MIN - 1,
            )

        # --------------------------------------------------------------
        # SCORE LIMIT
        # --------------------------------------------------------------

        state["risk_score"] = min(
            MAX_RISK_SCORE,
            max(
                MIN_RISK_SCORE,
                state["risk_score"],
            ),
        )

        # --------------------------------------------------------------
        # CONFIDENCE
        # --------------------------------------------------------------

        if confidences:

            state["confidence"] = round(
                sum(confidences)
                / len(confidences),
                2,
            )

        # --------------------------------------------------------------
        # CONTRIBUTIONS
        # --------------------------------------------------------------

        if new_evidence:
            state["contributions"] = contributions
        else:
            state["contributions"] = []

        # --------------------------------------------------------------
        # FINAL STATUS
        # --------------------------------------------------------------

        self._update_status(state)

        state["last_calculation_time"] = current_time

        return {
            "seat_id": seat_id,
            "risk_score": int(
                round(
                    state["risk_score"]
                )
            ),
            "confidence": state["confidence"],
            "status": state["status"],
            "contributions": state["contributions"],
        }
