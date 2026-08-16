import { useState } from "react";
import "./ExamCalendar.css";

const examDates = {
  5: [
    {
      title: "Physics",
      time: "09:00 AM",
      hall: "Hall B",
      students: 64,
      status: "completed",
    },
  ],

  16: [
    {
      title: "Mathematics",
      time: "10:00 AM",
      hall: "Hall A",
      students: 72,
      status: "live",
    },
  ],

  18: [
    {
      title: "Data Structures",
      time: "02:00 PM",
      hall: "Hall B",
      students: 68,
      status: "upcoming",
    },
  ],

  20: [
    {
      title: "Database Systems",
      time: "04:00 PM",
      hall: "Hall A",
      students: 70,
      status: "upcoming",
    },
  ],

  22: [
    {
      title: "Computer Networks",
      time: "10:00 AM",
      hall: "Hall C",
      students: 64,
      status: "upcoming",
    },
  ],
};

const dateSheetDates = [8, 16, 22];

function ExamCalendar() {
  const [selectedDate, setSelectedDate] = useState(16);

  const selectedExams = examDates[selectedDate] || [];

  const daysInMonth = 31;
  const firstDayOffset = 5;

  const calendarCells = [];

  for (let i = 0; i < firstDayOffset; i++) {
    calendarCells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  return (
    <section className="calendar-section">

      {/* =========================
          CALENDAR
      ========================== */}
      <div className="calendar-card">

        <div className="calendar-header">

          <div>
            <span className="calendar-eyebrow">
              EXAM CALENDAR
            </span>

            <h2>
              August 2026
            </h2>
          </div>

          <div className="calendar-navigation">
            <button type="button">
              ←
            </button>

            <button type="button">
              →
            </button>
          </div>

        </div>


        <div className="calendar-weekdays">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>


        <div className="calendar-grid">

          {calendarCells.map((day, index) => {

            if (!day) {
              return (
                <div
                  key={`empty-${index}`}
                  className="calendar-day empty"
                />
              );
            }

            const hasExam =
              Boolean(examDates[day]);

            const hasDateSheet =
              dateSheetDates.includes(day);

            const isSelected =
              selectedDate === day;

            return (
              <button
                type="button"
                key={day}
                className={`calendar-day ${
                  isSelected ? "selected" : ""
                } ${hasExam ? "has-exam" : ""}`}
                onClick={() => setSelectedDate(day)}
              >

                <span className="day-number">
                  {day}
                </span>

                <span className="day-indicators">

                  {hasExam && (
                    <span className="calendar-dot exam-dot" />
                  )}

                  {hasDateSheet && (
                    <span className="calendar-dot sheet-dot" />
                  )}

                </span>

              </button>
            );
          })}

        </div>


        <div className="calendar-legend">

          <span>
            <i className="legend-dot exam" />
            Exam
          </span>

          <span>
            <i className="legend-dot sheet" />
            Date sheet
          </span>

        </div>

      </div>


      {/* =========================
          SELECTED DATE
      ========================== */}
      <div className="selected-date-card">

        <div className="selected-date-header">

          <div>
            <span className="selected-eyebrow">
              SELECTED DATE
            </span>

            <h2>
              {selectedDate} August
            </h2>
          </div>

          <span className="selected-year">
            2026
          </span>

        </div>


        {selectedExams.length > 0 ? (

          <div className="selected-exam-list">

            {selectedExams.map((exam, index) => (

              <div
                className="selected-exam"
                key={`${exam.title}-${index}`}
              >

                <div className="selected-exam-time">
                  {exam.time}
                </div>

                <div className="selected-exam-info">

                  <strong>
                    {exam.title}
                  </strong>

                  <span>
                    {exam.hall} · {exam.students} Students
                  </span>

                </div>

                <span
                  className={`selected-exam-status ${exam.status}`}
                >
                  {exam.status === "live"
                    ? "Live"
                    : exam.status === "completed"
                    ? "Completed"
                    : "Upcoming"}
                </span>

              </div>

            ))}

          </div>

        ) : (

          <div className="no-exams">

            <div className="no-exams-icon">
              —
            </div>

            <strong>
              No examinations scheduled
            </strong>

            <span>
              There are no exams planned for this date.
            </span>

          </div>

        )}

      </div>

    </section>
  );
}

export default ExamCalendar;