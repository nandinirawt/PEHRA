import sqlite3
import hashlib
import sys
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
ROOT_DIR = CURRENT_DIR.parent
sys.path.append(str(ROOT_DIR))
sys.path.append(str(CURRENT_DIR))

try:
    from ledger.canonicalizer.canonicalizer import canonicalize_review_record
except ModuleNotFoundError:
    try:
        from app.ledger.canonicalizer import canonicalize_review_record
    except Exception:
        def canonicalize_review_record(seat_id, event_id, decision, timestamp, risk_score):
            import json
            return json.dumps({
                "decision": decision,
                "event_id": event_id,
                "risk_score": float(risk_score),
                "seat_id": seat_id,
                "timestamp": str(timestamp)
            }, sort_keys=True, separators=(",", ":"))

DB_PATH = "pehra.db"

def run_tamper_demo():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("\n" + "="*50)
    print("   PEHRA CRYPTOGRAPHIC INTEGRITY & TAMPER DEMO")
    print("="*50)

    cursor.execute("""
        SELECT r.event_id, r.seat_id, r.decision, r.timestamp, k.risk_score, i.content_hash, d.tx_id
        FROM reviews r
        JOIN integrity_records i ON r.event_id = i.record_id
        LEFT JOIN dlt_transactions d ON r.event_id = d.record_id
        LEFT JOIN risk_states k ON r.seat_id = k.seat_id
        WHERE r.decision = 'confirm_incident'
        LIMIT 1
    """)
    row = cursor.fetchone()

    if not row:
        print("[!] No anchored records found in database.")
        conn.close()
        return

    event_id, seat_id, decision, timestamp, risk_score, stored_hash, tx_id = row
    risk_score = risk_score if risk_score is not None else 0.85

    print(f"\n[+] Target Event ID : {event_id}")
    print(f"[+] Seat ID         : {seat_id}")
    print(f"[+] DLT Tx Ref      : {tx_id}")
    print(f"[+] Anchored Hash   : {stored_hash}")

    print("\n--- STAGE 1: VERIFYING UNTOUCHED AUDIT TRAIL ---")
    canonical_payload = canonicalize_review_record(
        seat_id=seat_id,
        event_id=event_id,
        decision=decision,
        timestamp=timestamp,
        risk_score=risk_score
    )
    computed_hash = hashlib.sha256(canonical_payload.encode("utf-8")).hexdigest()

    if computed_hash == stored_hash:
        print(">> STATUS: [VERIFIED] (Hash matches ledger anchor exactly)")
    else:
        print(f">> STATUS: [MISMATCH] Computed: {computed_hash} | Stored: {stored_hash}")

    print("\n--- STAGE 2: SIMULATING DATABASE TAMPERING ---")
    print(">> Attacker alters SQLite: changing 'confirm_incident' to 'false_alarm'...")
    cursor.execute(
        "UPDATE reviews SET decision = 'false_alarm' WHERE event_id = ?",
        (event_id,)
    )
    conn.commit()

    tampered_payload = canonicalize_review_record(
        seat_id=seat_id,
        event_id=event_id,
        decision="false_alarm",
        timestamp=timestamp,
        risk_score=risk_score
    )
    tampered_hash = hashlib.sha256(tampered_payload.encode("utf-8")).hexdigest()

    print(f">> Recomputed Hash : {tampered_hash}")
    print(f">> Anchored Hash   : {stored_hash}")

    if tampered_hash != stored_hash:
        print("\n>> ALERT: [TAMPERED] INTEGRITY BREACH DETECTED!")
        print("   Off-chain record no longer matches immutable ledger fingerprint.")
    else:
        print("\n>> Tamper not caught.")

    print("\n--- STAGE 3: RESTORING ORIGINAL DB STATE ---")
    cursor.execute(
        "UPDATE reviews SET decision = 'confirm_incident' WHERE event_id = ?",
        (event_id,)
    )
    conn.commit()
    conn.close()
    print(">> Original state restored successfully.\n" + "="*50)

if __name__ == "__main__":
    run_tamper_demo()
