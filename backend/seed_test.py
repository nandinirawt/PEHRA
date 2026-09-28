from app.db import SessionLocal
from app.models.models import Exam, Seat, RiskStateRecord

db = SessionLocal()

exam = Exam(
    exam_id="EXAM-MATH-001",
    name="Math Finals",
    subject="Mathematics",
    hall_id="HALL-A",
    date="2026-09-28",
    start_time="10:00",
    end_time="13:00",
    total_seats=30,
    status="active"
)

seat = Seat(
    exam_id="EXAM-MATH-001",
    seat_id="B-04",
    row=2,
    column=4,
    status="normal"
)

risk = RiskStateRecord(
    exam_id="EXAM-MATH-001",
    seat_id="B-04",
    risk_score=0.85,
    status="high_risk"
)

db.merge(exam)
db.merge(seat)
db.merge(risk)
db.commit()
db.close()
print("SEEDED_SUCCESSFULLY")
