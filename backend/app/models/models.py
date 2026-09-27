from sqlalchemy import Column, String, Integer, Float, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class Exam(Base):
    __tablename__ = "exams"

    exam_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    hall_id = Column(String, nullable=False)
    date = Column(String, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    total_seats = Column(Integer, nullable=False)
    status = Column(String, default="draft")  # draft | configured | ready | live | completed

class Seat(Base):
    __tablename__ = "seats"

    id = Column(Integer, primary_key=True, autoincrement=True)
    seat_id = Column(String, index=True, nullable=False)
    exam_id = Column(String, ForeignKey("exams.exam_id"), nullable=False)
    row = Column(Integer, nullable=False)
    column = Column(Integer, nullable=False)
    status = Column(String, default="normal")

class PoseRecord(Base):
    __tablename__ = "pose_data"

    id = Column(Integer, primary_key=True, autoincrement=True)
    seat_id = Column(String, index=True)
    timestamp = Column(String)
    presence = Column(Boolean)
    confidence = Column(Float)
    pose_features = Column(JSON)

class BehaviorEventRecord(Base):
    __tablename__ = "behavior_events"

    event_id = Column(String, primary_key=True, index=True)
    exam_id = Column(String, index=True)
    seat_id = Column(String, index=True)
    event_type = Column(String)
    severity = Column(String)
    confidence = Column(Float)
    timestamp = Column(String)
    duration = Column(Float)

class RiskStateRecord(Base):
    __tablename__ = "risk_states"

    seat_id = Column(String, primary_key=True, index=True)
    exam_id = Column(String, index=True)
    risk_score = Column(Integer)
    confidence = Column(Float)
    status = Column(String)
    updated_at = Column(String)
    contributions = Column(JSON)

class CalibrationRecord(Base):
    __tablename__ = "calibrations"

    camera_id = Column(String, primary_key=True, index=True)
    exam_id = Column(String, index=True)
    zone = Column(String)
    seat_ids = Column(JSON)
    coverage = Column(Float)
    status = Column(String)
# --- P4 Ledger & Integrity Models ---
class ReviewRecord(Base):
    __tablename__ = "reviews"

    review_id = Column(String, primary_key=True, index=True)
    exam_id = Column(String, index=True)
    seat_id = Column(String, index=True)
    event_id = Column(String, index=True)
    decision = Column(String)  # confirm_incident, false_alarm, keep_under_review
    reviewer_note = Column(String, nullable=True)
    timestamp = Column(String)

class IntegrityRecord(Base):
    __tablename__ = "integrity_records"

    record_id = Column(String, primary_key=True, index=True)
    exam_id = Column(String, index=True)
    record_type = Column(String)  # review_decision, session_digest
    content_hash = Column(String, nullable=False)
    signature = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)

class DltTransactionRecord(Base):
    __tablename__ = "dlt_transactions"

    tx_id = Column(String, primary_key=True, index=True)
    record_id = Column(String, index=True)
    block_ref = Column(String)
    node_confirmations = Column(Integer, default=1)
    chain_timestamp = Column(String)
