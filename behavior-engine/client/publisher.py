import time
import requests
from typing import Dict, Any

class BackendPublisher:
    def __init__(self, backend_url: str = "http://localhost:8000/api"):
        self.backend_url = backend_url.rstrip("/")

    def publish_risk_state(self, exam_id: str, risk_payload: Dict[str, Any]):
        seat_id = risk_payload["seat_id"]
        url = f"{self.backend_url}/exams/{exam_id}/risk/{seat_id}"
        contract_data = {
            "seat_id": seat_id,
            "risk_score": risk_payload["risk_score"],
            "confidence": risk_payload["confidence"],
            "status": risk_payload["status"],
            "updated_at": time.time(),
            "contributions": risk_payload.get("contributions", [])
        }
        try:
            requests.put(url, json=contract_data, timeout=1.0)
        except Exception:
            pass

    def publish_behavior_event(self, exam_id: str, risk_payload: Dict[str, Any], event_type: str):
        if risk_payload.get("status") == "normal":
            return

        url = f"{self.backend_url}/events"
        contract_data = {
            "event_id": f"EVT-{int(time.time() * 1000)}",
            "exam_id": exam_id,
            "seat_id": risk_payload["seat_id"],
            "event_type": event_type,
            "severity": risk_payload["status"],
            "confidence": risk_payload["confidence"],
            "timestamp": int(time.time()),
            "duration": 5
        }
        try:
            requests.post(url, json=contract_data, timeout=1.0)
        except Exception:
            pass
