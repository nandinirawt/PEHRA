from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import hashlib
import datetime
import uuid
import sys
import os

# Ensure project root is in sys.path for the ledger module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from app.db import get_db
from app.models.models import (
    Seat,
    RiskStateRecord,
    ReviewRecord,
    IntegrityRecord,
    DltTransactionRecord
)
from app.schemas.schemas import ReviewActionSchema
from app.ws.manager import ws_manager
from ledger.canonicalizer.canonicalizer import canonicalize_review_record
from ledger.client.bridge import LedgerBridge

router = APIRouter(prefix="/api/exams/{exam_id}/reviews", tags=["Reviews"])

@router.patch("/{seat_id}")
async def handle_review_action(exam_id: str, seat_id: str, action_data: ReviewActionSchema, db: Session = Depends(get_db)):
    seat = db.query(Seat).filter(Seat.exam_id == exam_id, Seat.seat_id == seat_id).first()
    risk = db.query(RiskStateRecord).filter(RiskStateRecord.exam_id == exam_id, RiskStateRecord.seat_id == seat_id).first()
    if not seat:
        raise HTTPException(status_code=404, detail="Seat not found")

    timestamp = datetime.datetime.utcnow().isoformat() + "Z"
    event_id = getattr(action_data, "event_id", None) or f"evt-{uuid.uuid4().hex[:8]}"
    reviewer_note = getattr(action_data, "notes", None)

    ledger_tx = None

    if action_data.action == "false_alarm":
        seat.status = "normal"
        if risk:
            risk.status = "normal"
            risk.risk_score = 0
            
        # Store false alarm audit trail (off-chain only)
        review_entry = ReviewRecord(
            review_id=str(uuid.uuid4()),
            exam_id=exam_id,
            seat_id=seat_id,
            event_id=event_id,
            decision="false_alarm",
            reviewer_note=reviewer_note,
            timestamp=timestamp
        )
        db.add(review_entry)

    elif action_data.action == "confirm_incident":
        seat.status = "high_risk"
        if risk:
            risk.status = "high_risk"

        current_risk_score = risk.risk_score if risk else 0.85

        # 1. Canonicalize data
        canonical_str = canonicalize_review_record(
            seat_id=seat_id,
            event_id=event_id,
            decision="confirm_incident",
            timestamp=timestamp,
            risk_score=current_risk_score
        )

        # 2. SHA-256 Content Fingerprint
        content_hash = hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()
        signature = f"sig-session-{exam_id[:6]}-{content_hash[:8]}"

        # 3. Anchor on Distributed Ledger via Bridge
        anchor_receipt = LedgerBridge.anchor(
            record_id=event_id,
            exam_id=exam_id,
            content_hash=content_hash,
            signature=signature,
            record_type="review_decision"
        )

        ledger_tx = {
            "tx_ref": anchor_receipt.get("tx_id"),
            "block_ref": anchor_receipt.get("block_ref"),
            "node_confirmations": anchor_receipt.get("node_confirmations", 1),
            "chain_timestamp": anchor_receipt.get("chain_timestamp", timestamp),
            "content_hash": content_hash
        }

        # 4. Save review decision & audit trail to SQLite
        review_entry = ReviewRecord(
            review_id=str(uuid.uuid4()),
            exam_id=exam_id,
            seat_id=seat_id,
            event_id=event_id,
            decision="confirm_incident",
            reviewer_note=reviewer_note,
            timestamp=timestamp
        )
        db.add(review_entry)

        integrity_entry = IntegrityRecord(
            record_id=event_id,
            exam_id=exam_id,
            record_type="review_decision",
            content_hash=content_hash,
            signature=signature,
            timestamp=timestamp
        )
        db.add(integrity_entry)

        tx_entry = DltTransactionRecord(
            tx_id=anchor_receipt.get("tx_id"),
            record_id=event_id,
            block_ref=anchor_receipt.get("block_ref"),
            node_confirmations=anchor_receipt.get("node_confirmations", 1),
            chain_timestamp=anchor_receipt.get("chain_timestamp", timestamp)
        )
        db.add(tx_entry)

    elif action_data.action == "keep_under_review":
        seat.status = "under_review"
        if risk:
            risk.status = "under_review"

    db.commit()

    # Broadcast WebSocket update with ledger metadata
    broadcast_payload = {
        "type": "REVIEW_ACTION",
        "seat_id": seat_id,
        "action": action_data.action,
        "new_status": seat.status,
        "event_id": event_id
    }
    if ledger_tx:
        broadcast_payload["ledger_tx"] = ledger_tx

    await ws_manager.broadcast_to_exam(exam_id, broadcast_payload)

    response_payload = {
        "status": "ok",
        "action": action_data.action,
        "seat_status": seat.status,
        "event_id": event_id
    }
    if ledger_tx:
        response_payload["ledger_tx"] = ledger_tx

    return response_payload
