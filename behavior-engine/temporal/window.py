from collections import defaultdict
from typing import Dict, Any, List

from config import (
    WINDOW_DURATION_SECONDS,
    PERSISTENCE_MIN_OCCURRENCES,
)


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

    def prune_old_signals(
        self,
        seat_id: str,
        current_time: float,
    ):
        cutoff = current_time - self.window_size

        self.seat_windows[seat_id] = [
            sig
            for sig in self.seat_windows[seat_id]
            if float(sig["timestamp"]) >= cutoff
        ]

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
            self.seat_windows[seat_id].append(sig)

    def get_persistent_signals(
        self,
        seat_id: str,
        current_time: float,
    ) -> Dict[str, Any]:

        self.prune_old_signals(
            seat_id,
            current_time,
        )

        window = self.seat_windows[seat_id]

        signal_counts = defaultdict(int)
        signal_confidences = defaultdict(list)
        signal_latest_timestamp = {}

        for item in window:
            sig_name = item["signal"]
            timestamp = float(item["timestamp"])
            confidence = float(
                item.get("confidence", 0.8)
            )

            signal_counts[sig_name] += 1
            signal_confidences[sig_name].append(
                confidence
            )

            signal_latest_timestamp[sig_name] = max(
                signal_latest_timestamp.get(
                    sig_name,
                    timestamp,
                ),
                timestamp,
            )

        observed_signals = {}
        qualified_signals = {}

        for sig_name, count in signal_counts.items():

            confs = signal_confidences[sig_name]

            avg_confidence = (
                sum(confs) / len(confs)
                if confs
                else 0.8
            )

            signal_data = {
                "count": count,
                "avg_confidence": avg_confidence,
                "latest_timestamp":
                    signal_latest_timestamp[sig_name],
            }

            observed_signals[sig_name] = signal_data

            required = (
                PERSISTENCE_MIN_OCCURRENCES
                if sig_name == "repeated_head_turns"
                else 2
            )

            if count >= required:
                qualified_signals[sig_name] = signal_data

        has_temporal_pattern = (
            len(window)
            >= PERSISTENCE_MIN_OCCURRENCES * 2
        )

        return {
            "observed_signals": observed_signals,
            "qualified_signals": qualified_signals,
            "has_temporal_pattern":
                has_temporal_pattern,
        }
