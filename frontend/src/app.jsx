import { useState } from "react";

import Dashboard from "./Dashboard.jsx";
import Exams from "./Exams.jsx";
import Login from "./Login.jsx";
import Navbar from "./Navbar.jsx";
import ActiveExamDock from "./ActiveExamDock.jsx";
import CameraCalibration from "./CameraCalibration.jsx";
import LiveMonitorWorkspace from "./LiveMonitorWorkspace.jsx";
import PrivacyCenter from "./PrivacyCenter.jsx";


import ChiefLayout from "./chief/ChiefLayout.jsx";

import "./App.css";

function App() {
  const [page, setPage] = useState("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  const handleLogin = (selectedRole) => {
    setRole(selectedRole);
    setIsLoggedIn(true);
  };

  const handleOpenMonitor = () => {
    setPage("live");
  };

  /*
   * LOGIN
   */
  if (!isLoggedIn) {
    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }

  /*
   * CHIEF INVIGILATOR
   */
  if (role === "chief") {
  return <ChiefLayout />;
}

  /*
   * EXISTING INVIGILATOR FLOW
   */
  return (
    <div className="app">

      {/* Global Navbar */}
      <Navbar
        page={page}
        setPage={setPage}
      />

      {/* Dashboard */}
      {page === "dashboard" && (
        <Dashboard />
      )}

      {/* Exams */}
      {page === "exams" && (
        <Exams />
      )}

      {/* Camera Calibration */}
      {page === "calibration" && (
        <CameraCalibration
          onProceedToPreCheck={() => {
            setPage("live");
          }}
        />
      )}

      {/* Live Monitor */}
      {page === "live" && (
        <LiveMonitorWorkspace />
      )}

      {/* Privacy Center */}
      {page === "privacy" && (
        <PrivacyCenter />
      )}

      {/* Active Exam Dock */}
      {page !== "live" && (
        <ActiveExamDock
          onOpenMonitor={handleOpenMonitor}
        />
      )}

    </div>
  );
}

export default App;