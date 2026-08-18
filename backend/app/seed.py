from app.db import SessionLocal, engine, Base
from app.models.models import Exam, Seat, RiskStateRecord, CalibrationRecord
from datetime import datetime

def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    exam = Exam(
        exam_id="EXAM-101",
        name="Data Structures & Algorithms Midterm",
        subject="Computer Science",
        hall_id="HALL-A",
        date="2026-10-24",
        start_time="10:00 AM",
        end_time="12:00 PM",
        total_seats=12,
        status="live"
    )
    db.add(exam)

    # Populate 3x4 seating grid
    for r in range(1, 4):
        for c in range(1, 5):
            seat_label = f"{chr(64+r)}-0{c}"
            status = "normal"
            if seat_label == "B-04":
                status = "high_risk"
            
            seat = Seat(seat_id=seat_label, exam_id="EXAM-101", row=r, column=c, status=status)
            db.add(seat)

    # Populate Seat B-04 Risk State with Contributions
    risk_b04 = RiskStateRecord(
        seat_id="B-04",
        exam_id="EXAM-101",
        risk_score=82,
        confidence=0.91,
        status="high_risk",
        updated_at=datetime.utcnow().isoformat(),
        contributions=[
            {"signal": "repeated_head_turns", "points": 18},
            {"signal": "body_orientation", "points": 20},
            {"signal": "hand_anomaly", "points": 8},
            {"signal": "temporal_pattern", "points": 24},
            {"signal": "neighbor_interaction", "points": 12}
        ]
    )
    db.add(risk_b04)

    cal = CalibrationRecord(
        camera_id="CAM-01",
        exam_id="EXAM-101",
        zone="Zone-A",
        seat_ids=["A-01", "A-02", "A-03", "A-04", "B-01", "B-02", "B-03", "B-04"],
        coverage=1.0,
        status="calibrated"
    )
    db.add(cal)

    db.commit()
    db.close()
    print("Database ready with fake data!")

if __name__ == "__main__":
    seed()