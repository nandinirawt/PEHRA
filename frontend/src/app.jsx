import { useState } from "react";

import Dashboard from "./Dashboard.jsx";
import Exams from "./Exams.jsx";
import Login from "./Login.jsx";
import ActiveExamDock from "./ActiveExamDock.jsx";
import Navbar from "./Navbar.jsx";

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

  // Open Live Monitor from Active Exam Dock
  const handleOpenMonitor = () => {
    setPage("live");
  };

  return (
    <div className="app">

      {/* =========================
          GLOBAL TOP NAVBAR
      ========================== */}

      <Navbar
        page={page}
        setPage={setPage}
      />


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