import "./index.css";

function StatCard({ label, value, detail, type }) {
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

function Seat({ status }) {
  return <div className={`seat ${status}`}></div>;
}

function Dashboard() {
  const seats = [
    "normal", "normal", "normal", "normal", "normal", "normal",
    "normal", "normal", "review", "normal", "normal", "normal",
    "normal", "normal", "normal", "normal", "high", "normal",
    "normal", "normal", "normal", "review", "normal", "normal",
    "normal", "normal", "normal", "normal", "normal", "normal",
    "normal", "normal", "normal", "normal", "normal", "normal",
  ];

  return (
    <div className="app">

      {/* TOP NAVIGATION */}
      <header className="navbar">

        <div className="brand">
          <img
            src="/pehraa-logo.png"
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
            <div className="avatar">N</div>

            <div className="profile-info">
              <span className="profile-name">Nandini</span>
              <span className="profile-role">Invigilator</span>
            </div>
          </div>

        </div>

      </header>


      {/* MAIN DASHBOARD */}
      <main className="dashboard">

        <section className="welcome">

          <div>
            <p className="eyebrow">EXAMINATION CONTROL CENTER</p>

            <h1>Good morning, Nandini.</h1>

            <p className="subtitle">
              Here's what's happening with your examinations today.
            </p>
          </div>

          <div className="system-status">
            <span className="status-live"></span>
            System Active
          </div>

        </section>


        {/* ACTIVE EXAM */}
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
              <span>Started 10:24 AM</span>
            </div>

          </div>

          <button className="monitor-button">
            Open Live Monitor
            <span>→</span>
          </button>

        </section>


        {/* STATISTICS */}
        <section className="stats">

          <StatCard
            label="Total Students"
            value="72"
            detail="72 / 72 present"
            type="neutral"
          />

          <StatCard
            label="Normal"
            value="57"
            detail="79.2% of students"
            type="normal"
          />

          <StatCard
            label="Under Review"
            value="10"
            detail="13.9% of students"
            type="review"
          />

          <StatCard
            label="High Risk"
            value="5"
            detail="6.9% of students"
            type="high"
          />

        </section>


        {/* MAIN CONTENT GRID */}
        <section className="dashboard-grid">

          {/* SEATING MAP */}
          <div className="panel seating-panel">

            <div className="panel-header">

              <div>
                <h2>Examination Hall</h2>
                <p>Hall A · Current seating status</p>
              </div>

              <button className="text-button">
                View Monitor →
              </button>

            </div>

            <div className="legend">

              <span>
                <i className="legend-dot normal"></i>
                Normal
              </span>

              <span>
                <i className="legend-dot review"></i>
                Under Review
              </span>

              <span>
                <i className="legend-dot high"></i>
                High Risk
              </span>

            </div>


            <div className="seat-map">

              {seats.map((status, index) => (
                <Seat key={index} status={status} />
              ))}

            </div>

            <div className="hall-footer">
              <span>6 columns</span>
              <span>12 rows</span>
              <span>72 seats</span>
            </div>

          </div>


          {/* RIGHT SIDE */}
          <div className="right-column">

            {/* SYSTEM HEALTH */}
            <div className="panel">

              <div className="panel-header">
                <div>
                  <h2>System Health</h2>
                  <p>Local examination environment</p>
                </div>

                <span className="healthy-badge">
                  Healthy
                </span>
              </div>


              <div className="health-list">

                <div className="health-row">
                  <span>Edge Intelligence</span>
                  <strong>Active</strong>
                </div>

                <div className="health-row">
                  <span>Camera Network</span>
                  <strong>4 / 4</strong>
                </div>

                <div className="health-row">
                  <span>Local Processing</span>
                  <strong>Active</strong>
                </div>

                <div className="health-row">
                  <span>Cloud Transmission</span>
                  <strong>Disabled</strong>
                </div>

              </div>

            </div>


            {/* UPCOMING EXAM */}
            <div className="panel upcoming-panel">

              <div className="panel-header">

                <div>
                  <h2>Next Examination</h2>
                  <p>Upcoming schedule</p>
                </div>

              </div>


              <div className="upcoming-time">
                <span>02:00</span>
                <small>PM</small>
              </div>

              <h3>Data Structures</h3>

              <div className="upcoming-meta">
                Hall B · 68 Students
              </div>

              <button className="outline-button">
                View Exam
              </button>

            </div>

          </div>

        </section>

      </main>


      {/* FIXED ACTIVE EXAM DOCK */}
      <div className="active-exam-dock">

        <div className="dock-status">
          <span className="dock-pulse"></span>
          LIVE
        </div>

        <div className="dock-divider"></div>

        <div className="dock-info">
          <strong>Hall A</strong>
          <span>Semester End Examination — Mathematics</span>
        </div>

        <div className="dock-students">
          72 Students
        </div>

        <button className="dock-button">
          Monitor →
        </button>

      </div>


      {/* FOOTER */}
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
