import sqlite3

conn = sqlite3.connect("pehra.db")
cursor = conn.cursor()

# 1. Clean existing test conflicts if any
cursor.execute("DELETE FROM exams WHERE exam_id='EXAM-MATH-001'")
cursor.execute("DELETE FROM seats WHERE exam_id='EXAM-MATH-001'")
cursor.execute("DELETE FROM risk_states WHERE exam_id='EXAM-MATH-001'")

# 2. Insert valid exam
cursor.execute("""
INSERT INTO exams (exam_id, name, subject, hall_id, date, start_time, end_time, total_seats, status)
VALUES ('EXAM-MATH-001', 'Math Finals', 'Mathematics', 'HALL-A', '2026-09-28', '10:00', '13:00', 30, 'active')
""")

# 3. Insert valid seat B-04
cursor.execute("""
INSERT INTO seats (seat_id, exam_id, row, column, status)
VALUES ('B-04', 'EXAM-MATH-001', 2, 4, 'normal')
""")

# 4. Insert baseline risk state
cursor.execute("""
INSERT INTO risk_states (exam_id, seat_id, risk_score, status)
VALUES ('EXAM-MATH-001', 'B-04', 0.85, 'high_risk')
""")

conn.commit()

# Print confirmation
cursor.execute("SELECT exam_id, seat_id, status FROM seats WHERE exam_id='EXAM-MATH-001'")
print("FOUND SEATS IN DB:", cursor.fetchall())

conn.close()
