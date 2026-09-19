import time
from typing import Dict, Any
from features.extractor import FeatureExtractor
from temporal.window import TemporalWindowTracker
from fusion.engine import RiskFusionEngine
from client.publisher import BackendPublisher
from config import DEFAULT_BACKEND_URL

class BehaviorEnginePipeline:
    def __init__(self, backend_url: str = DEFAULT_BACKEND_URL):
        self.extractor = FeatureExtractor()
        self.tracker = TemporalWindowTracker()
        self.fusion = RiskFusionEngine()
        self.publisher = BackendPublisher(backend_url)

    def process_pose_frame(self, pose_data: Dict[str, Any], exam_id: str = "EXAM-01") -> Dict[str, Any]:
        seat_id = pose_data["seat_id"]
        ts = pose_data.get("timestamp", time.time())

        # 1. Feature Extraction & Benign Suppression
        signals = self.extractor.extract_signals(pose_data)

        # 2. Temporal Window & Persistence Check
        self.tracker.add_signals(seat_id, signals, ts)
        persistent = self.tracker.get_persistent_signals(seat_id, ts)

        # 3. Multi-Signal Fusion & Dynamic Decay
        risk_result = self.fusion.compute_risk(seat_id, persistent, ts)

        # 4. Dispatch via Client Publisher
        self.publisher.publish_risk_state(exam_id, risk_result)
        if signals:
            self.publisher.publish_behavior_event(exam_id, risk_result, signals[0]["signal"])

        return risk_result

    def tick_decay_all(self, active_seats: list, current_time: float, exam_id: str = "EXAM-01"):
        updates = []
        for seat_id in active_seats:
            persistent = self.tracker.get_persistent_signals(seat_id, current_time)
            risk_result = self.fusion.compute_risk(seat_id, persistent, current_time)
            self.publisher.publish_risk_state(exam_id, risk_result)
            updates.append(risk_result)
        return updates

