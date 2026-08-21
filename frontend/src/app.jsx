import PrivacyCenter from "./PrivacyCenter";
import LiveMonitorWorkspace from "./LiveMonitorWorkspace";
import { useState } from "react";
import Dashboard from "./Dashboard.jsx";
import Exams from "./Exams.jsx";
import ActiveExamDock from "./ActiveExamDock.jsx";
import CameraCalibration from "./CameraCalibration.jsx";
import Login from "./Login.jsx";
import "./App.css";

function App() {

  /* =========================
     LOGIN
  ========================== */

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);


  /* =========================
     PAGE
  ========================== */

  const [page, setPage] =
    useState("dashboard");


  /* =========================
     LOGIN SCREEN
  ========================== */

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() =>
          setIsLoggedIn(true)
        }
      />
    );
  }


  /* =========================
     NAVIGATION
  ========================== */

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

          {/* DASHBOARD */}

          <button
            className={`nav-link-button ${
              page === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setPage("dashboard")
            }
          >
            Dashboard
          </button>


          {/* EXAMS */}

          <button
            className={`nav-link-button ${
              page === "exams"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setPage("exams")
            }
          >
            Exams
          </button>


          {/* CAMERA CALIBRATION */}

          <button
            className={`nav-link-button ${
              page === "calibration"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setPage("calibration")
            }
          >
            Camera Calibration
          </button>


          {/* LIVE MONITOR */}

          <button
            className={`nav-link-button ${
              page === "live"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setPage("live")
            }
          >
            Live Monitor
          </button>


          {/* PRIVACY */}

          <button
            className={`nav-link-button ${
              page === "privacy"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setPage("privacy")
            }
          >
            Privacy
          </button>

        </nav>


        {/* RIGHT SIDE */}

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


      {/* YOUR P6/P3 CALIBRATION PAGE */}

      {page === "calibration" && (
        <CameraCalibration
          onProceedToPreCheck={() => {
            setPage("live");
          }}
        />
      )}


      {/* LIVE MONITOR */}

      {page === "live" && (
        <LiveMonitorWorkspace />
      )}


      {/* PRIVACY */}

      {page === "privacy" && (
        <PrivacyCenter />
      )}


      {/* ACTIVE EXAM DOCK */}

      <ActiveExamDock
        onMonitor={() =>
          setPage("live")
        }
      />

    </div>
  );
}

export default App;