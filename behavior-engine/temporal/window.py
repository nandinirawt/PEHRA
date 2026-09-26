from collections import defaultdict
from typing import Dict, Any, List

from config import (
    # Temporal window config
    WINDOW_DURATION_SECONDS,
    PERSISTENCE_MIN_OCCURRENCES,

    # Risk engine config
    WEIGHTS,
    DECAY_GRACE_PERIOD_SECONDS,
    DECAY_RATE_PER_SECOND,
    MAX_RISK_SCORE,
    MIN_RISK_SCORE,
    MIN_INDEPENDENT_SIGNALS,
    SCORE_UNDER_REVIEW_MIN,
    SCORE_HIGH_RISK_MIN,
)


# ================================================================
# TEMPORAL WINDOW TRACKER
# ================================================================

class TemporalWindowTracker:

    def __init__(
        self,
        window_size: float = WINDOW_DURATION_SECONDS,
    ):
        self.window_size = window_size

        self.seat_windows: Dict[
            str,
            List[Dict[str, Any]]
        ] = defaultdict(list)

    # ------------------------------------------------------------
    # REMOVE OLD SIGNALS
    # ------------------------------------------------------------

    def prune_old_signals(
        self,
        seat_id: str,
        current_time: float,
    ):

        cutoff = (
            current_time
            - self.window_size
        )

        self.seat_windows[seat_id] = [
            sig
            for sig in self.seat_windows[seat_id]
            if float(sig["timestamp"]) >= cutoff
        ]

    # ------------------------------------------------------------
    # ADD SIGNALS
    # ------------------------------------------------------------

    def add_signals(
        self,
        seat_id: str,
        signals: List[Dict[str, Any]],
        current_time: float,
    ):

        self.prune_old_signals(
            seat_id,
            current_time,
        )

        for sig in signals:

            self.seat_windows[
                seat_id
            ].append(sig)

        # Prune once more after insertion
        # so the window never contains
        # expired data.

        self.prune_old_signals(
            seat_id,
            current_time,
        )

    # ------------------------------------------------------------
    # GET PERSISTENT SIGNALS
    # ------------------------------------------------------------

    def get_persistent_signals(
        self,
        seat_id: str,
        current_time: float,
    ):

        self.prune_old_signals(
            seat_id,
            current_time,
        )

        window = self.seat_windows[
            seat_id
        ]

        signal_counts = defaultdict(int)

        signal_confidences = defaultdict(list)

        signal_latest_timestamp = {}

        # --------------------------------------------------------
        # AGGREGATE SIGNALS
        # --------------------------------------------------------

        for item in window:

            sig_name = item["signal"]

            timestamp = float(
                item["timestamp"]
            )

            confidence = float(
                item.get(
                    "confidence",
                    0.8,
                )
            )

            signal_counts[
                sig_name
            ] += 1

            signal_confidences[
                sig_name
            ].append(confidence)

            signal_latest_timestamp[
                sig_name
            ] = max(
                signal_latest_timestamp.get(
                    sig_name,
                    timestamp,
                ),
                timestamp,
            )

        observed_signals = {}

        qualified_signals = {}

        # --------------------------------------------------------
        # BUILD SIGNAL DATA
        # --------------------------------------------------------

        for sig_name, count in signal_counts.items():

            confs = (
                signal_confidences[
                    sig_name
                ]
            )

            avg_confidence = (
                sum(confs)
                / len(confs)
                if confs
                else 0.8
            )

            signal_data = {
                "count": count,

                "avg_confidence":
                    avg_confidence,

                "latest_timestamp":
                    signal_latest_timestamp[
                        sig_name
                    ],
            }

            observed_signals[
                sig_name
            ] = signal_data

            # repeated_head_turns needs the
            # configured persistence threshold.
            #
            # Other signals require 2
            # occurrences.

            required = (
                PERSISTENCE_MIN_OCCURRENCES
                if sig_name
                == "repeated_head_turns"
                else 2
            )

            if count >= required:

                qualified_signals[
                    sig_name
                ] = signal_data

        # --------------------------------------------------------
        # TEMPORAL PATTERN
        # --------------------------------------------------------

        has_temporal_pattern = (
            len(window)
            >= (
                PERSISTENCE_MIN_OCCURRENCES
                * 2
            )
        )

        return {
            "observed_signals":
                observed_signals,

            "qualified_signals":
                qualified_signals,

            "has_temporal_pattern":
                has_temporal_pattern,
        }


# ================================================================
# RISK FUSION ENGINE
# ================================================================

class RiskFusionEngine:

    def __init__(self):

        self.seat_states: Dict[
            str,
            Dict[str, Any]
        ] = {}

    # ------------------------------------------------------------
    # STATE INITIALIZATION
    # ------------------------------------------------------------

    def get_or_init_state(
        self,
        seat_id: str,
        current_time: float,
    ):

        if seat_id not in self.seat_states:

            self.seat_states[seat_id] = {

                "risk_score": 0.0,

                "confidence": 0.0,

                "status": "normal",

                # Last time NEW suspicious
                # evidence arrived.
                "last_active_time":
                    current_time,

                # Last time decay was applied.
                "last_decay_time":
                    current_time,

                "last_calculation_time":
                    current_time,

                # Number of genuine observations.
                "occurrence_counts": {},

                # Latest processed timestamp
                # for every signal.
                "processed_timestamps": {},

                # Temporal bonus.
                "temporal_bonus_applied":
                    False,

                "contributions": [],
            }

        return self.seat_states[
            seat_id
        ]

    # ------------------------------------------------------------
    # UPDATE STATUS
    # ------------------------------------------------------------

    def _update_status(
        self,
        state: Dict[str, Any],
    ):

        score = int(
            round(
                state["risk_score"]
            )
        )

        if score >= SCORE_HIGH_RISK_MIN:

            state["status"] = "high_risk"

        elif score >= SCORE_UNDER_REVIEW_MIN:

            state["status"] = "under_review"

        else:

            state["status"] = "normal"

    # ------------------------------------------------------------
    # DECAY
    # ------------------------------------------------------------

    def apply_decay(
        self,
        seat_id: str,
        current_time: float,
    ) -> float:

        state = self.seat_states[
            seat_id
        ]

        # Already zero
        if (
            state["risk_score"]
            <= MIN_RISK_SCORE
        ):

            state["risk_score"] = (
                MIN_RISK_SCORE
            )

            state["occurrence_counts"] = {}

            state[
                "temporal_bonus_applied"
            ] = False

            state[
                "contributions"
            ] = []

            state["status"] = "normal"

            state[
                "last_decay_time"
            ] = current_time

            state[
                "last_calculation_time"
            ] = current_time

            return 0.0

        # --------------------------------------------------------
        # TIME SINCE LAST NEW EVIDENCE
        # --------------------------------------------------------

        inactive_for = (
            current_time
            - state["last_active_time"]
        )

        # Grace period
        if (
            inactive_for
            <= DECAY_GRACE_PERIOD_SECONDS
        ):

            state[
                "last_calculation_time"
            ] = current_time

            return state["risk_score"]

        # --------------------------------------------------------
        # DETERMINE HOW MUCH NEW TIME TO DECAY
        # --------------------------------------------------------

        decay_start = (
            state["last_active_time"]
            + DECAY_GRACE_PERIOD_SECONDS
        )

        effective_start = max(
            state["last_decay_time"],
            decay_start,
        )

        elapsed = (
            current_time
            - effective_start
        )

        if elapsed <= 0:

            return state["risk_score"]

        # --------------------------------------------------------
        # GRADUAL DECAY
        # --------------------------------------------------------

        decay_amount = (
            elapsed
            * DECAY_RATE_PER_SECOND
        )

        state["risk_score"] = max(
            MIN_RISK_SCORE,
            state["risk_score"]
            - decay_amount,
        )

        state[
            "last_decay_time"
        ] = current_time

        state[
            "last_calculation_time"
        ] = current_time

        # --------------------------------------------------------
        # RESET AFTER ZERO
        # --------------------------------------------------------

        if (
            state["risk_score"]
            <= MIN_RISK_SCORE
        ):

            state["risk_score"] = (
                MIN_RISK_SCORE
            )

            state["occurrence_counts"] = {}

            state[
                "temporal_bonus_applied"
            ] = False

            state[
                "contributions"
            ] = []

            state["status"] = "normal"

        else:

            self._update_status(
                state
            )

        return state["risk_score"]

    # ------------------------------------------------------------
    # DECAY ALL SEATS
    # ------------------------------------------------------------

    def decay_all(
        self,
        current_time: float,
    ) -> List[Dict[str, Any]]:

        results = []

        for seat_id in list(
            self.seat_states.keys()
        ):

            self.apply_decay(
                seat_id,
                current_time,
            )

            state = self.seat_states[
                seat_id
            ]

            results.append(
                {
                    "seat_id": seat_id,

                    "risk_score":
                        int(
                            round(
                                state[
                                    "risk_score"
                                ]
                            )
                        ),

                    "confidence":
                        state[
                            "confidence"
                        ],

                    "status":
                        state[
                            "status"
                        ],

                    "contributions":
                        state[
                            "contributions"
                        ],
                }
            )

        return results

    # ------------------------------------------------------------
    # INCREMENT FACTOR
    # ------------------------------------------------------------

    def _increment_factor(
        self,
        occurrence_number: int,
    ) -> float:

        if occurrence_number == 1:
            return 0.40

        if occurrence_number == 2:
            return 0.25

        if occurrence_number == 3:
            return 0.15

        return 0.10

    # ------------------------------------------------------------
    # COMPUTE RISK
    # ------------------------------------------------------------

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

        observed = (
            persistent_data.get(
                "observed_signals",
                {},
            )
        )

        has_temporal_pattern = (
            persistent_data.get(
                "has_temporal_pattern",
                False,
            )
        )

        contributions = []

        confidences = []

        new_evidence = False

        # --------------------------------------------------------
        # PROCESS SIGNALS
        # --------------------------------------------------------

        for sig_name, data in (
            observed.items()
        ):

            current_latest_timestamp = (
                float(
                    data.get(
                        "latest_timestamp",
                        current_time,
                    )
                )
            )

            previous_latest_timestamp = (
                float(
                    state[
                        "processed_timestamps"
                    ].get(
                        sig_name,
                        -1,
                    )
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
                state[
                    "occurrence_counts"
                ].get(
                    sig_name,
                    0,
                )
                + 1
            )

            state[
                "occurrence_counts"
            ][sig_name] = (
                occurrence_number
            )

            base_weight = WEIGHTS.get(
                sig_name,
                10,
            )

            factor = (
                self._increment_factor(
                    occurrence_number
                )
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

            state[
                "risk_score"
            ] += points

            contributions.append(
                {
                    "signal": sig_name,
                    "points": points,
                }
            )

            state[
                "processed_timestamps"
            ][sig_name] = (
                current_latest_timestamp
            )

        # --------------------------------------------------------
        # TEMPORAL BONUS
        # --------------------------------------------------------

        if (
            has_temporal_pattern
            and new_evidence
            and not state[
                "temporal_bonus_applied"
            ]
        ):

            temporal_points = max(
                1,
                int(
                    round(
                        WEIGHTS[
                            "temporal_pattern"
                        ]
                        * 0.25
                    )
                ),
            )

            state[
                "risk_score"
            ] += temporal_points

            contributions.append(
                {
                    "signal":
                        "temporal_pattern",

                    "points":
                        temporal_points,
                }
            )

            state[
                "temporal_bonus_applied"
            ] = True

        elif not has_temporal_pattern:

            state[
                "temporal_bonus_applied"
            ] = False

        # --------------------------------------------------------
        # NEW EVIDENCE RESETS DECAY TIMER
        # --------------------------------------------------------

        if new_evidence:

            state[
                "last_active_time"
            ] = current_time

            state[
                "last_decay_time"
            ] = current_time

        else:

            # No genuinely new evidence:
            # apply gradual decay.
            self.apply_decay(
                seat_id,
                current_time,
            )

        # --------------------------------------------------------
        # ONE-SIGNAL SAFETY CAP
        # --------------------------------------------------------

        independent_signal_count = len(
            observed
        )

        if (
            new_evidence
            and independent_signal_count
            < MIN_INDEPENDENT_SIGNALS
        ):

            state[
                "risk_score"
            ] = min(
                state["risk_score"],
                SCORE_UNDER_REVIEW_MIN - 1,
            )

        # --------------------------------------------------------
        # CLAMP SCORE
        # --------------------------------------------------------

        state[
            "risk_score"
        ] = min(
            MAX_RISK_SCORE,
            max(
                MIN_RISK_SCORE,
                state["risk_score"],
            ),
        )

        # --------------------------------------------------------
        # CONFIDENCE
        # --------------------------------------------------------

        if confidences:

            state[
                "confidence"
            ] = round(
                sum(confidences)
                / len(confidences),
                2,
            )

        # --------------------------------------------------------
        # CONTRIBUTIONS
        # --------------------------------------------------------

        if new_evidence:

            state[
                "contributions"
            ] = contributions

        else:

            state[
                "contributions"
            ] = []

        # --------------------------------------------------------
        # STATUS
        # --------------------------------------------------------

        self._update_status(
            state
        )

        state[
            "last_calculation_time"
        ] = current_time

        return {
            "seat_id": seat_id,

            "risk_score":
                int(
                    round(
                        state[
                            "risk_score"
                        ]
                    )
                ),

            "confidence":
                state[
                    "confidence"
                ],

            "status":
                state[
                    "status"
                ],

            "contributions":
                state[
                    "contributions"
                ],
        }