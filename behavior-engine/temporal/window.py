from collections import defaultdict
from typing import Dict, Any, List
from config import WINDOW_DURATION_SECONDS, PERSISTENCE_MIN_OCCURRENCES

class TemporalWindowTracker:
    def __init__(self, window_size: float = WINDOW_DURATION_SECONDS):
        self.window_size = window_size
        self.seat_windows: Dict[str, List[Dict[str, Any]]] = defaultdict(list)

    def prune_old_signals(self, seat_id: str, current_time: float):
        cutoff = current_time - self.window_size
        self.seat_windows[seat_id] = [
            sig for sig in self.seat_windows[seat_id] if sig["timestamp"] >= cutoff
        ]

    def add_signals(self, seat_id: str, signals: List[Dict[str, Any]], current_time: float):
        self.prune_old_signals(seat_id, current_time)
        for sig in signals:
            self.seat_windows[seat_id].append(sig)

    def get_persistent_signals(self, seat_id: str, current_time: float) -> Dict[str, Any]:
        self.prune_old_signals(seat_id, current_time)
        window = self.seat_windows[seat_id]
        
        signal_counts = defaultdict(int)
        signal_confidences = defaultdict(list)

        for item in window:
            sig_name = item["signal"]
            signal_counts[sig_name] += 1
            signal_confidences[sig_name].append(item["confidence"])

        qualified_signals = {}
        for sig_name, count in signal_counts.items():
            required = PERSISTENCE_MIN_OCCURRENCES if sig_name == "repeated_head_turns" else 2
            if count >= required:
                confs = signal_confidences[sig_name]
                avg_conf = sum(confs) / len(confs) if confs else 0.8
                qualified_signals[sig_name] = {
                    "count": count,
                    "avg_confidence": avg_conf
                }

        has_temporal_pattern = len(window) >= (PERSISTENCE_MIN_OCCURRENCES * 2)
        
        return {
            "qualified_signals": qualified_signals,
            "has_temporal_pattern": has_temporal_pattern
        }
