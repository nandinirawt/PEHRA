import "./index.css";

function StatCard({ label, value, detail, type = "neutral" }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className={`status-dot ${type}`}></span>
        <span>{label}</span>
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-detail">{detail}</div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="app">

      {/* =========================
          TOP NAVIGATION
      ========================== */}
      <header className="navbar">

        <div className="brand">
          <img
            src="/pehra-logo.png"
            alt="PEHRA"
            className="brand-logo"
          />

          <span className="brand-name">PEHRA</span>
        </div>


        <nav className="nav-links">
          <a className="active">Dashboard</a>
          <a>Exams</a>
          <a>Live Monitor</a>
          <a>Privacy</a>
        </nav>


        <div className="nav-right">

          <button className="notification">
            <span className="notification-dot"></span>
            ◌
          </button>

          <div className="profile">

            <div className="avatar">
              N
            </div>

            <div className="profile-info">
              <span className="profile-name">
                Nandini
              </span>

              <span className="profile-role">
                Invigilator
              </span>
            </div>

          </div>

        </div>

      </header>


      {/* =========================
          MAIN DASHBOARD
      ========================== */}
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


          <button className="monitor-button">

            Open Live Monitor

            <span>→</span>

          </button>

        </section>



        {/* =========================
            OVERVIEW STATISTICS
        ========================== */}
        <section className="stats">

          <StatCard
            label="Today's Exams"
            value="4"
            detail="1 active · 1 completed · 2 upcoming"
            type="neutral"
          />


          <StatCard
            label="Completed"
            value="1"
            detail="Examination completed today"
            type="normal"
          />


          <StatCard
            label="Upcoming"
            value="2"
            detail="Next examination at 02:00 PM"
            type="review"
          />


          <StatCard
            label="Attention"
            value="3"
            detail="Events requiring review"
            type="high"
          />

        </section>



        {/* =========================
            LOWER DASHBOARD
        ========================== */}
        <section className="dashboard-grid">


          {/* =========================
              TODAY'S SCHEDULE
          ========================== */}
          <div className="panel schedule-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Today's Schedule
                </h2>

                <p>
                  Your examination schedule for today
                </p>

              </div>


              <button className="text-button">
                View all →
              </button>

            </div>


            <div className="schedule-list">


              {/* Physics */}
              <div className="schedule-row">

                <div className="schedule-time">
                  09:00 AM
                </div>


                <div className="schedule-main">

                  <strong>
                    Physics
                  </strong>

                  <span>
                    Hall B · 64 Students
                  </span>

                </div>


                <div className="schedule-status completed">
                  ✓ Completed
                </div>

              </div>



              {/* Mathematics */}
              <div className="schedule-row active-row">

                <div className="schedule-time">
                  10:24 AM
                </div>


                <div className="schedule-main">

                  <strong>
                    Mathematics
                  </strong>

                  <span>
                    Hall A · 72 Students
                  </span>

                </div>


                <div className="schedule-status live">
                  ● Live
                </div>

              </div>



              {/* Data Structures */}
              <div className="schedule-row">

                <div className="schedule-time">
                  02:00 PM
                </div>


                <div className="schedule-main">

                  <strong>
                    Data Structures
                  </strong>

                  <span>
                    Hall B · 68 Students
                  </span>

                </div>


                <div className="schedule-status upcoming">
                  Upcoming
                </div>

              </div>



              {/* DBMS */}
              <div className="schedule-row">

                <div className="schedule-time">
                  04:00 PM
                </div>


                <div className="schedule-main">

                  <strong>
                    Database Systems
                  </strong>

                  <span>
                    Hall A · 70 Students
                  </span>

                </div>


                <div className="schedule-status upcoming">
                  Upcoming
                </div>

              </div>


            </div>

          </div>



          {/* =========================
              SYSTEM STATUS
          ========================== */}
          <div className="panel system-panel">

            <div className="panel-header">

              <div>

                <h2>
                  System Status
                </h2>

                <p>
                  Local examination environment
                </p>

              </div>


              <span className="healthy-badge">
                Healthy
              </span>

            </div>


            <div className="health-list">


              <div className="health-row">

                <span>
                  Edge Intelligence
                </span>

                <strong>
                  Active
                </strong>

              </div>


              <div className="health-row">

                <span>
                  Camera Network
                </span>

                <strong>
                  4 / 4
                </strong>

              </div>


              <div className="health-row">

                <span>
                  Local Processing
                </span>

                <strong>
                  Active
                </strong>

              </div>


              <div className="health-row">

                <span>
                  Privacy Mode
                </span>

                <strong>
                  Protected
                </strong>

              </div>


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
                Latest examination and system events
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
                  Camera calibration completed
                </strong>

                <span>
                  4 / 4 cameras ready
                </span>

              </div>

              <time>
                10:21 AM
              </time>

            </div>



            <div className="activity-row">

              <span className="activity-dot normal"></span>

              <div className="activity-content">

                <strong>
                  Pre-exam check completed
                </strong>

                <span>
                  All systems ready
                </span>

              </div>

              <time>
                10:18 AM
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



      {/* =========================
          FLOATING ACTIVE EXAM DOCK
      ========================== */}
      <div className="active-exam-dock">

        <div className="dock-status">

          <span className="dock-pulse"></span>

          LIVE

        </div>


        <div className="dock-divider"></div>


        <div className="dock-info">

          <strong>
            Hall A
          </strong>

          <span>
            Semester End Examination — Mathematics
          </span>

        </div>


        <div className="dock-students">
          72 Students
        </div>


        <div className="dock-time">
          01:24:32
        </div>

      </div>



      {/* =========================
          FOOTER
      ========================== */}
      <footer className="footer">

        <span>
          🔒 Local processing active
        </span>

        <span>
          PEHRA v1.0
        </span>

      </footer>

    </div>
  );
}

export default Dashboard;
