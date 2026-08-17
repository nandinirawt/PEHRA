import { useState } from "react";
import Dashboard from "./Dashboard.jsx";
import Exams from "./Exams.jsx";
import Login from "./Login.jsx";
import ActiveExamDock from "./ActiveExamDock.jsx";
import "./App.css";

function App() {
  const [page, setPage] = useState("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Show login page before entering the main application
  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() => setIsLoggedIn(true)}
      />
    );
  }

  // Open the Live Monitor page
  const handleOpenMonitor = () => {
    setPage("live");
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
          />

          <span className="brand-name">
            PEHRA
          </span>

        </div>


        {/* =========================
            NAVIGATION
        ========================== */}

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


        {/* =========================
            RIGHT SIDE
        ========================== */}

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

          <h1>
            Live Monitor
          </h1>

          <p>
            Live monitoring will be built next.
          </p>

        </main>
      )}


      {page === "privacy" && (
        <main className="placeholder-page">

          <h1>
            Privacy Center
          </h1>

          <p>
            Privacy page will be built next.
          </p>

        </main>
      )}


      {/* =========================
          GLOBAL ACTIVE EXAM DOCK
          HIDDEN ON LIVE MONITOR
      ========================== */}

      {page !== "live" && (
        <ActiveExamDock
          onOpenMonitor={handleOpenMonitor}
        />
      )}

    </div>
  );
}

export default App;