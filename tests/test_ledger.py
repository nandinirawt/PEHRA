import json
import uuid

from ledger.chain.web3_client import LedgerClient
from ledger.crypto.hashing import sha256_text
from ledger.crypto.signing import generate_session_keypair, sign_hash


def make_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


def make_signed_record(exam_id: str, record_id: str):
    record = {
        "event_id": record_id,
        "exam_id": exam_id,
        "seat_id": "B-04",
        "decision": "confirmed_incident",
        "timestamp": "2026-09-27T13:00:00Z",
    }

    canonical_record = json.dumps(
        record,
        sort_keys=True,
        separators=(",", ":"),
    )

    content_hash = sha256_text(canonical_record)

    private_key, public_key = generate_session_keypair()
    signature = sign_hash(content_hash, private_key)

    return canonical_record, content_hash, signature, public_key


def test_record_and_verify():
    client = LedgerClient()

    exam_id = make_id("EXAM")
    record_id = make_id("EVT")

    _, content_hash, signature, _ = make_signed_record(
        exam_id,
        record_id,
    )

    client.create_exam(exam_id)

    tx = client.record_review(
        exam_id=exam_id,
        record_id=record_id,
        content_hash=content_hash,
        signature=signature,
    )

    assert tx

    assert client.verify_event(
        record_id=record_id,
        expected_hash=content_hash,
    ) is True


def test_tampered_record_is_detected():
    client = LedgerClient()

    exam_id = make_id("EXAM")
    record_id = make_id("EVT")

    _, original_hash, signature, _ = make_signed_record(
        exam_id,
        record_id,
    )

    client.create_exam(exam_id)

    client.record_review(
        exam_id=exam_id,
        record_id=record_id,
        content_hash=original_hash,
        signature=signature,
    )

    tampered_hash = sha256_text(
        '{"decision":"false_alarm","event_id":"tampered"}'
    )

    assert client.verify_event(
        record_id=record_id,
        expected_hash=tampered_hash,
    ) is False


def test_close_exam_and_verify_session_record():
    client = LedgerClient()

    exam_id = make_id("EXAM")
    record_id = make_id("SESSION")

    session_record = {
        "record_id": record_id,
        "exam_id": exam_id,
        "record_type": "session_summary",
        "total_events": 3,
        "confirmed_incidents": 1,
        "false_alarms": 2,
    }

    canonical_record = json.dumps(
        session_record,
        sort_keys=True,
        separators=(",", ":"),
    )

    content_hash = sha256_text(canonical_record)

    private_key, _ = generate_session_keypair()
    signature = sign_hash(content_hash, private_key)

    client.create_exam(exam_id)

    tx = client.close_exam(
        exam_id=exam_id,
        record_id=record_id,
        content_hash=content_hash,
        signature=signature,
    )

    assert tx

    assert client.verify_event(
        record_id=record_id,
        expected_hash=content_hash,
    ) is True
