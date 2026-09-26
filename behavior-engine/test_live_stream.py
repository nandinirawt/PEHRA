import time
import requests
from datetime import datetime, timezone

BASE_URL = "http://127.0.0.1:8000/api/pose"

print(">>> [PHASE 1] Sending 2 baseline normal frames for B-04...")
for i in range(2):
    r = requests.post(BASE_URL, json={
        "seat_id": "B-04",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "presence": True,
        "confidence": 0.95,
        "pose_features": {"head_direction": "center", "body_orientation": "forward"}
    })
    res = r.json()
    risk = res.get("risk", {})
    print(f"Frame {i+1} -> Status: {risk.get('status')}, Risk Score: {risk.get('risk_score')}")
    time.sleep(1)

print("\n>>> [PHASE 2] Sending sustained multi-signal suspicious frames (Escalation)...")
for i in range(4):
    r = requests.post(BASE_URL, json={
        "seat_id": "B-04",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "presence": True,
        "confidence": 0.95,
        "pose_features": {
            "head_direction": "right",
            "body_orientation": "right",
            "hand_movement": "abnormal"
        }
    })
    res = r.json()
    risk = res.get("risk", {})
    print(f"Frame {i+1} -> Status: {risk.get('status')}, Score: {risk.get('risk_score')}, Contributions: {risk.get('contributions')}")
    time.sleep(1)

print("\n>>> Frames completed. Look at your Live Monitor dashboard in the browser!")
