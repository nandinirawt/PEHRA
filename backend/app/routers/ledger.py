from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import hashlib
import datetime
import uuid
import sys
import os

# Ensure project root is in path for ledger module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from app.db import get_db
from app.models.models import (
    Exam,
    ReviewRecord,
    IntegrityRecord,
    DltTransactionRecord,
    RiskStateRecord
)
from ledger.canonicalizer.canonicalizer import canonicalize_review_record
from ledger.client.bridge import LedgerBridge

router = APIRouter(tags=["Ledger & Integrity"])

@router.get("/api/ledger/verify/{event_id}")
def verify_event_integrity(event_id: str, db: Session = Depends(get_db)):
    review = db.query(ReviewRecord).filter(ReviewRecord.event_id == event_id).first()
    integrity = db.query(IntegrityRecord).filter(IntegrityRecord.record_id == event_id).first()
    tx = db.query(DltTransactionRecord).filter(DltTransactionRecord.record_id == event_id).first()

    if not review or not integrity:
        raise HTTPException(status_code=404, detail="No anchored integrity record found for this event_id")

    risk = db.query(RiskStateRecord).filter(
        RiskStateRecord.exam_id == review.exam_id,
        RiskStateRecord.seat_id == review.seat_id
    ).first()
    risk_score = risk.risk_score if risk else 0

    recomputed_canonical = canonicalize_review_record(
        seat_id=review.seat_id,
        event_id=review.event_id,
        decision=review.decision,
        timestamp=review.timestamp,
        risk_score=risk_score
    )
    recomputed_hash = hashlib.sha256(recomputed_canonical.encode("utf-8")).hexdigest()

    chain_check = LedgerBridge.verify(record_id=event_id, computed_hash=recomputed_hash)
    is_valid = (recomputed_hash == integrity.content_hash) and chain_check.get("match", False)

    return {
        "event_id": event_id,
        "exam_id": review.exam_id,
        "status": "VERIFIED" if is_valid else "TAMPERED",
        "stored_hash": integrity.content_hash,
        "recomputed_hash": recomputed_hash,
        "tx_ref": tx.tx_id if tx else None,
        "signature": integrity.signature,
        "checked_at": datetime.datetime.utcnow().isoformat() + "Z"
    }

@router.get("/api/exams/{exam_id}/ledger/{event_id}")
def get_event_ledger_detail(exam_id: str, event_id: str, db: Session = Depends(get_db)):
    integrity = db.query(IntegrityRecord).filter(
        IntegrityRecord.exam_id == exam_id,
        IntegrityRecord.record_id == event_id
    ).first()
    tx = db.query(DltTransactionRecord).filter(DltTransactionRecord.record_id == event_id).first()

    if not integrity:
        raise HTTPException(status_code=404, detail="No ledger transaction found for this event")

    return {
        "event_id": event_id,
        "exam_id": exam_id,
        "content_hash": integrity.content_hash,
        "signature": integrity.signature,
        "tx_ref": tx.tx_id if tx else None,
        "block_ref": tx.block_ref if tx else None,
        "chain_timestamp": tx.chain_timestamp if tx else integrity.timestamp,
        "status": "confirmed_incident"
    }

@router.get("/api/exams/{exam_id}/certificate")
def get_exam_integrity_certificate(exam_id: str, db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.exam_id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    reviews = db.query(ReviewRecord).filter(ReviewRecord.exam_id == exam_id).all()
    total_events = len(reviews)
    confirmed_incidents = sum(1 for r in reviews if r.decision in ["confirm_incident", "confirmed_incident"])
    false_alarms = sum(1 for r in reviews if r.decision == "false_alarm")

    session_summary_str = f"exam:{exam_id}|events:{total_events}|confirmed:{confirmed_incidents}|false:{false_alarms}"
    final_hash = hashlib.sha256(session_summary_str.encode("utf-8")).hexdigest()

    return {
        "certificate_id": f"CERT-{uuid.uuid4().hex[:8].upper()}",
        "exam_id": exam_id,
        "final_hash": final_hash,
        "total_events": total_events,
        "confirmed_incidents": confirmed_incidents,
        "false_alarms": false_alarms,
        "issued_at": datetime.datetime.utcnow().isoformat() + "Z",
        "tx_ref": f"0x{final_hash[:16]}...session-close"
    }
