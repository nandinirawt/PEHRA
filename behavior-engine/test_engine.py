import time
from main import BehaviorEnginePipeline

print("\n--- RUNNING BEHAVIOR RISK ENGINE TEST SUITE ---")
engine = BehaviorEnginePipeline()
base_time = 1000.0

# Test 1: Single action stays NORMAL
pose1 = {
    "seat_id": "B-04",
    "timestamp": base_time,
    "presence": True,
    "confidence": 0.9,
    "pose_features": {"head_direction": "left", "body_orientation": "forward"}
}
res1 = engine.process_pose_frame(pose1)
assert res1["status"] == "normal", "Failed: Status is not normal"
print("[PASS] Test 1: Single action stays NORMAL")

# Test 2: Benign suppression
pose2 = {
    "seat_id": "B-04",
    "timestamp": base_time + 1.0,
    "presence": True,
    "confidence": 0.9,
    "pose_features": {"head_direction": "left", "benign_context": "stretching"}
}
res2 = engine.process_pose_frame(pose2)
assert res2["status"] == "normal"
assert len(res2["contributions"]) == 0
print("[PASS] Test 2: Benign suppression verified")

# Test 3: Multi-signal escalation
t_escalate = base_time + 10.0
for i in range(3):
    res3 = engine.process_pose_frame({
        "seat_id": "B-04",
        "timestamp": t_escalate + i,
        "presence": True,
        "confidence": 0.95,
        "pose_features": {
            "head_direction": "right",
            "body_orientation": "right",
            "hand_movement": "abnormal"
        }
    })
assert res3["status"] == "high_risk", "Failed: Status did not escalate to high_risk"
print(f"[PASS] Test 3: Multi-signal escalation -> Score: {res3['risk_score']}")

# Test 4: Risk decay (forward time by 40s past window cutoff)
decay_time = t_escalate + 40.0
decayed = engine.process_pose_frame({
    "seat_id": "B-04",
    "timestamp": decay_time,
    "presence": True,
    "confidence": 0.95,
    "pose_features": {"head_direction": "center", "body_orientation": "forward"}
})
assert decayed["risk_score"] < res3["risk_score"], "Failed: Risk score did not decay"
print(f"[PASS] Test 4: Decay verified -> Initial: {res3['risk_score']} -> Decayed: {decayed['risk_score']}")
print("--- ALL 4 TESTS PASSED ---\n")
