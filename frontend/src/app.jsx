import { useState } from "react";
import Dashboard from "./Dashboard.jsx";
import Exams from "./Exams.jsx";
import "./App.css";

function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div className="app">

      {/* =========================
          GLOBAL TOP NAVBAR
      ========================== */}
      <header className="navbar">

        <div className="brand">
          <img
            src="/pehra-logo.png"
            alt="PEHRA"
            className="brand-logo"
          />

          <span className="brand-name">
            PEHRA
          </span>
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
          PAGE CONTENT
      ========================== */}

      {page === "dashboard" && (
        <Dashboard />
      )}

      {page === "exams" && (
        <Exams />
      )}

      {page === "live" && (
        <main className="placeholder-page">
          <h1>Live Monitor</h1>
          <p>Live monitoring will be built next.</p>
        </main>
      )}

      {page === "privacy" && (
        <main className="placeholder-page">
          <h1>Privacy Center</h1>
          <p>Privacy page will be built next.</p>
        </main>
      )}

    </div>
  );
}

export default App;