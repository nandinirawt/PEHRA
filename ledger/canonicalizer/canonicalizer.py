import json
from typing import Any, Dict

def canonicalize(data: Dict[str, Any]) -> str:
    """
    Deterministic canonical serialization:
    - Sorts dictionary keys lexicographically
    - Uses strict separators without whitespace (',', ':')
    - Ensures uniform UTF-8 representation across platforms
    """
    return json.dumps(data, sort_keys=True, separators=(',', ':'), ensure_ascii=False)

def canonicalize_review_record(
    seat_id: str,
    event_id: str,
    decision: str,
    timestamp: str,
    risk_score: float = 0
) -> str:
    payload = {
        "decision": decision,
        "event_id": event_id,
        "risk_score": round(float(risk_score), 2),
        "seat_id": seat_id,
        "timestamp": timestamp,
    }
    return canonicalize(payload)
