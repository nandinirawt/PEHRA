import ExamCalendar from "./ExamCalendar.jsx";

function Dashboard() {
  return (
    <main className="dashboard">

      {/* =========================
          WELCOME
      ========================== */}
      <section className="welcome">

        <div>
          <p className="eyebrow">
            EXAMINATION CONTROL CENTER
          </p>

          <h1>
            Good morning, Nandini.
          </h1>

          <p className="subtitle">
            Here's your examination overview for today.
          </p>
        </div>

        <div className="system-status">
          <span className="status-live"></span>
          System Active
        </div>

      </section>


      {/* =========================
          ACTIVE EXAM
      ========================== */}
      <section className="active-exam">

        <div className="active-left">

          <div className="live-label">
            <span className="pulse"></span>
            LIVE EXAM
          </div>

          <div className="exam-title">
            Semester End Examination — Mathematics
          </div>

          <div className="exam-meta">
            <span>Hall A</span>
            <span>•</span>
            <span>72 Students</span>
            <span>•</span>
            <span>01:24:32 elapsed</span>
          </div>

        </div>

      </section>


      {/* =========================
          QUICK OVERVIEW
      ========================== */}
      <section className="stats">

        <div className="stat-card">

          <div className="stat-top">
            <span className="status-dot neutral"></span>
            <span>Today's Exams</span>
          </div>

          <div className="stat-value">
            4
          </div>

          <div className="stat-detail">
            1 active · 2 upcoming · 1 completed
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-top">
            <span className="status-dot review"></span>
            <span>Upcoming</span>
          </div>

          <div className="stat-value">
            2
          </div>

          <div className="stat-detail">
            Next exam at 02:00 PM
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-top">
            <span className="status-dot normal"></span>
            <span>Completed</span>
          </div>

          <div className="stat-value">
            1
          </div>

          <div className="stat-detail">
            Completed today
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-top">
            <span className="status-dot high"></span>
            <span>Attention</span>
          </div>

          <div className="stat-value">
            3
          </div>

          <div className="stat-detail">
            Items requiring review
          </div>

        </div>

      </section>


      {/* =========================
          EXAM CALENDAR
      ========================== */}
      <ExamCalendar />


      {/* =========================
          PUBLISHED DATE SHEETS
      ========================== */}
      <section className="panel datesheet-panel">

        <div className="panel-header">

          <div>
            <h2>
              Published Date Sheets
            </h2>

            <p>
              Official examination schedules available to you.
            </p>
          </div>

          <button className="text-button">
            View all →
          </button>

        </div>


        <div className="datesheet-list">

          <div className="datesheet-row">

            <div className="datesheet-icon">
              PDF
            </div>

            <div className="datesheet-info">

              <strong>
                Periodical I
              </strong>

              <span>
                Examination Date Sheet · Published 12 Aug 2026
              </span>

            </div>

            <button className="datesheet-view">
              View →
            </button>

          </div>


          <div className="datesheet-row">

            <div className="datesheet-icon">
              PDF
            </div>

            <div className="datesheet-info">

              <strong>
                Semester End Examination
              </strong>

              <span>
                Examination Date Sheet · Published 05 Aug 2026
              </span>

            </div>

            <button className="datesheet-view">
              View →
            </button>

          </div>


          <div className="datesheet-row">

            <div className="datesheet-icon">
              PDF
            </div>

            <div className="datesheet-info">

              <strong>
                Periodical II
              </strong>

              <span>
                Examination Date Sheet · Published 28 Jul 2026
              </span>

            </div>

            <button className="datesheet-view">
              View →
            </button>

          </div>

        </div>

      </section>


      {/* =========================
          RECENT ACTIVITY
      ========================== */}
      <section className="panel activity-panel">

        <div className="panel-header">

          <div>
            <h2>
              Recent Activity
            </h2>

            <p>
              Recent examination and system updates
            </p>
          </div>

        </div>


        <div className="activity-list">

          <div className="activity-row">

            <span className="activity-dot live"></span>

            <div className="activity-content">

              <strong>
                Mathematics examination started
              </strong>

              <span>
                Hall A · 72 students
              </span>

            </div>

            <time>
              10:24 AM
            </time>

          </div>


          <div className="activity-row">

            <span className="activity-dot normal"></span>

            <div className="activity-content">

              <strong>
                Periodical I date sheet published
              </strong>

              <span>
                5 examinations added
              </span>

            </div>

            <time>
              09:42 AM
            </time>

          </div>


          <div className="activity-row">

            <span className="activity-dot normal"></span>

            <div className="activity-content">

              <strong>
                Camera calibration completed
              </strong>

              <span>
                Mathematics · Hall A
              </span>

            </div>

            <time>
              10:21 AM
            </time>

          </div>


          <div className="activity-row">

            <span className="activity-dot neutral"></span>

            <div className="activity-content">

              <strong>
                Physics examination completed
              </strong>

              <span>
                Hall B · 64 students
              </span>

            </div>

            <time>
              09:58 AM
            </time>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Dashboard;