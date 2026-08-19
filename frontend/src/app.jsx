import { useState } from "react";
import Dashboard from "./Dashboard.jsx";
import Exams from "./Exams.jsx";
import Privacy from "./Privacy.jsx";
import ActiveExamDock from "./ActiveExamDock.jsx";
import "./App.css";

function App() {
  const [page, setPage] = useState("dashboard");
  const [activeExamId, setActiveExamId] = useState("exam-001");

  const handleNavigate = (targetPage, examId = null) => {
    if (examId) {
      setActiveExamId(examId);
    }
    setPage(targetPage);
  };

  return (
    <div className="app">
      {/* =========================
          GLOBAL TOP NAVBAR
      ========================== */}
      <header className="navbar">
        <div className="brand">
          <img
            src="/pehraa-logo.png"
            alt="PEHRA"
            className="brand-logo"
            onError={(e) => {
              e.currentTarget.src = "/pehra-logo.png";
            }}
          />
          <span className="brand-name">PEHRA</span>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-link-button ${
              page === "dashboard" ? "active" : ""
            }`}
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={`nav-link-button ${
              page === "exams" ? "active" : ""
            }`}
            onClick={() => setPage("exams")}
          >
            Exams
          </button>

          <button
            className={`nav-link-button ${
              page === "live" ? "active" : ""
            }`}
            onClick={() => setPage("live")}
          >
            Live Monitor
          </button>

          <button
            className={`nav-link-button ${
              page === "privacy" ? "active" : ""
            }`}
            onClick={() => setPage("privacy")}
          >
            Privacy
          </button>
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

      {/* =========================
          PAGE CONTENT
      ========================== */}
      {page === "dashboard" && <Dashboard onNavigate={handleNavigate} />}

      {page === "exams" && <Exams onNavigate={handleNavigate} />}

      {page === "live" && (
        <main className="placeholder-page">
          <div className="placeholder-card">
            <span className="live-pulse-badge">● LIVE CONTROL ROOM</span>
            <h1>Live Monitor</h1>
            <p>
              Monitoring session for <strong>{activeExamId || "Active Exam"}</strong>.
            </p>
            <p className="placeholder-note">
              Person 3 (Live Monitor Frontend Lead) is wiring the real-time seat matrix, pose
              keypoints visualization, and human review controls.
            </p>
            <button
              type="button"
              className="secondary-button"
              style={{ marginTop: "16px" }}
              onClick={() => setPage("exams")}
            >
              ← Return to Exams Hub
            </button>
          </div>
        </main>
      )}

      {page === "privacy" && <Privacy onNavigate={handleNavigate} />}

      <ActiveExamDock onMonitor={() => setPage("live")} />
    </div>
  );
}

export default App;