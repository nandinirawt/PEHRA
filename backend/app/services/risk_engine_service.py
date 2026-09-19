import sys
import time
from pathlib import Path
from typing import Any, Dict
SEAT_ID_MAP = {
    "PERSON-1": "A-01",
    "PERSON-2": "A-02",
    "PERSON-3": "A-03",
}

# ---------------------------------------------------------
# Make teammate's behavior-engine modules importable
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[3]
BEHAVIOR_ENGINE_DIR = PROJECT_ROOT / "behavior-engine"

if str(BEHAVIOR_ENGINE_DIR) not in sys.path:
    sys.path.insert(0, str(BEHAVIOR_ENGINE_DIR))


from features.extractor import FeatureExtractor
from temporal.window import TemporalWindowTracker
from fusion.engine import RiskFusionEngine


class RiskEngineService:
    def __init__(self):
        self.extractor = FeatureExtractor()
        self.tracker = TemporalWindowTracker()
        self.fusion = RiskFusionEngine()

    def process_pose(
        self,
        pose_data: Dict[str, Any],
    ) -> Dict[str, Any]:

        source_seat_id = pose_data["seat_id"]
        seat_id = SEAT_ID_MAP.get(source_seat_id, source_seat_id)
        pose_data["seat_id"] = seat_id

        # ---------------------------------------------------------
        # Normalize timestamp
        # ---------------------------------------------------------

        raw_timestamp = pose_data.get(
            "timestamp",
            time.time()
        )

        try:
            timestamp = float(raw_timestamp)
        except (TypeError, ValueError):
            timestamp = time.time()

        # Pass normalized timestamp to the Risk Engine
        pose_data["timestamp"] = timestamp

        # ---------------------------------------------------------
        # 1. Feature Extraction
        # ---------------------------------------------------------

        signals = self.extractor.extract_signals(
            pose_data
        )

        # ---------------------------------------------------------
        # 2. Temporal Persistence
        # ---------------------------------------------------------

        self.tracker.add_signals(
            seat_id,
            signals,
            timestamp
        )

        persistent = self.tracker.get_persistent_signals(
            seat_id,
            timestamp
        )

        # ---------------------------------------------------------
        # 3. Risk Fusion
        # ---------------------------------------------------------

        risk_result = self.fusion.compute_risk(
            seat_id,
            persistent,
            timestamp
        )

        # ---------------------------------------------------------
        # 4. Activity / Benign Context
        # ---------------------------------------------------------

        features = pose_data.get(
            "pose_features",
            {}
        ) or {}

        activity = features.get(
            "activity",
            "normal"
        )

        benign_context = features.get(
            "benign_context"
        )

        benign = benign_context is not None

        # ---------------------------------------------------------
        # Return complete result
        # ---------------------------------------------------------

        return {
            "risk": risk_result,
            "signals": signals,
            "activity": activity,
            "benign": benign,
        }


# ---------------------------------------------------------
# Global Risk Engine Service
# ---------------------------------------------------------

risk_engine_service = RiskEngineService()