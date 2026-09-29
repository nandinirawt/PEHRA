from collections import defaultdict, deque
from datetime import datetime
from typing import Dict, Any, List

from config import (
    WINDOW_DURATION_SECONDS,
    PERSISTENCE_MIN_OCCURRENCES,
)


def _timestamp_to_seconds(value: Any) -> float:
    """
    Convert numeric or ISO-8601 timestamps into Unix seconds.
    """

    if isinstance(value, (int, float)):
        return float(value)

    if isinstance(value, str):
        value = value.strip()

        try:
            return float(value)
        except ValueError:
            pass

        try:
            normalized = value.replace("Z", "+00:00")
            return datetime.fromisoformat(
                normalized
            ).timestamp()
        except ValueError as exc:
            raise ValueError(
                f"Unsupported timestamp format: {value}"
            ) from exc

    raise TypeError(
        f"Unsupported timestamp type: {type(value).__name__}"
    )


class BehaviorWindow:
    """
    Rolling event window used by the temporal pipeline.
    """

    def __init__(
        self,
        max_events: int = 50,
        window_duration_seconds: float | None = None,
    ):
        if max_events <= 0:
            raise ValueError(
                "max_events must be greater than zero"
            )

        self.max_events = max_events

        self.window_duration_seconds = (
            WINDOW_DURATION_SECONDS
            if window_duration_seconds is None
            else window_duration_seconds
        )

        self._events: Dict[
            str,
            deque
        ] = defaultdict(deque)

    def _prune(
        self,
        seat_id: str,
        current_time: float | None = None,
    ) -> None:

        events = self._events[seat_id]

        while len(events) > self.max_events:
            events.popleft()

        if current_time is not None:

            cutoff = (
                current_time
                - self.window_duration_seconds
            )

            while events:

                event_timestamp = _timestamp_to_seconds(
                    events[0].get(
                        "timestamp",
                        current_time,
                    )
                )

                if event_timestamp >= cutoff:
                    break

                events.popleft()

    def add_event(
        self,
        event: Dict[str, Any],
    ) -> None:

        seat_id = event.get("seat_id")

        if not seat_id:
            raise ValueError(
                "Behavior event must contain seat_id"
            )

        event_copy = dict(event)

        self._events[seat_id].append(
            event_copy
        )

        raw_timestamp = event_copy.get(
            "timestamp"
        )

        current_time = (
            _timestamp_to_seconds(raw_timestamp)
            if raw_timestamp is not None
            else None
        )

        self._prune(
            seat_id,
            current_time,
        )

    def get_events(
        self,
        seat_id: str,
        current_time: Any | None = None,
    ) -> List[Dict[str, Any]]:

        normalized_time = None

        if current_time is not None:
            normalized_time = _timestamp_to_seconds(
                current_time
            )

        self._prune(
            seat_id,
            normalized_time,
        )

        return list(
            self._events.get(
                seat_id,
                [],
            )
        )

    def count_event_type(
        self,
        first: str,
        second: str | None = None,
    ) -> int:
        """
        Count events by event type.

        Supports both common calling styles:

            count_event_type("single_head_turn")
            count_event_type("single_head_turn", "B-04")
            count_event_type("B-04", "single_head_turn")

        This keeps the temporal test compatible regardless of
        which argument order its existing code uses.
        """

        seat_ids = set(
            self._events.keys()
        )

        event_types = {
            event.get("event_type")
            for events in self._events.values()
            for event in events
            if event.get("event_type")
        }

        # --------------------------------------------------------------
        # ONE ARGUMENT
        # --------------------------------------------------------------

        if second is None:

            event_type = first

            return sum(
                1
                for events in self._events.values()
                for event in events
                if event.get("event_type")
                == event_type
            )

        # --------------------------------------------------------------
        # TWO ARGUMENTS
        # --------------------------------------------------------------

        # Style A:
        # count_event_type(event_type, seat_id)

        if (
            first in event_types
            and second in seat_ids
        ):

            event_type = first
            seat_id = second

        # Style B:
        # count_event_type(seat_id, event_type)

        elif (
            first in seat_ids
            and second in event_types
        ):

            seat_id = first
            event_type = second

        else:
            # Fall back to the most natural interpretation:
            # first = event type, second = seat.
            event_type = first
            seat_id = second

        events = self.get_events(
            seat_id
        )

        return sum(
            1
            for event in events
            if event.get("event_type")
            == event_type
        )

    def clear(
        self,
        seat_id: str | None = None,
    ) -> None:

        if seat_id is None:
            self._events.clear()
            return

        self._events.pop(
            seat_id,
            None,
        )


class TemporalWindowTracker:
    """
    Maintains low-level suspicious signals over the
    configured temporal window.
    """

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
    ) -> None:

        cutoff = (
            current_time
            - self.window_size
        )

        self.seat_windows[seat_id] = [
            signal
            for signal in self.seat_windows[seat_id]
            if _timestamp_to_seconds(
                signal["timestamp"]
            ) >= cutoff
        ]

    def add_signals(
        self,
        seat_id: str,
        signals: List[Dict[str, Any]],
        current_time: float,
    ) -> None:

        self.prune_old_signals(
            seat_id,
            current_time,
        )

        for signal in signals:
            self.seat_windows[seat_id].append(
                dict(signal)
            )

        self.prune_old_signals(
            seat_id,
            current_time,
        )

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

            signal_name = item["signal"]

            timestamp = _timestamp_to_seconds(
                item["timestamp"]
            )

            confidence = float(
                item.get(
                    "confidence",
                    0.8,
                )
            )

            signal_counts[signal_name] += 1

            signal_confidences[
                signal_name
            ].append(
                confidence
            )

            signal_latest_timestamp[
                signal_name
            ] = max(
                signal_latest_timestamp.get(
                    signal_name,
                    timestamp,
                ),
                timestamp,
            )

        observed_signals = {}
        qualified_signals = {}

        for signal_name, count in signal_counts.items():

            confidences = signal_confidences[
                signal_name
            ]

            average_confidence = (
                sum(confidences)
                / len(confidences)
                if confidences
                else 0.8
            )

            signal_data = {
                "count": count,
                "avg_confidence": average_confidence,
                "latest_timestamp":
                    signal_latest_timestamp[
                        signal_name
                    ],
            }

            observed_signals[
                signal_name
            ] = signal_data

            required_occurrences = (
                PERSISTENCE_MIN_OCCURRENCES
                if signal_name
                == "repeated_head_turns"
                else 2
            )

            if count >= required_occurrences:

                qualified_signals[
                    signal_name
                ] = signal_data

        has_temporal_pattern = (
            len(window)
            >= PERSISTENCE_MIN_OCCURRENCES * 2
        )

        return {
            "observed_signals":
                observed_signals,

            "qualified_signals":
                qualified_signals,

            "has_temporal_pattern":
                has_temporal_pattern,
        }
