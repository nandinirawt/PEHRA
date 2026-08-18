import { useState } from "react";
import LiveMonitor from "./LiveMonitor";
import CameraCalibration from "./CameraCalibration";
import "./LiveMonitorWorkspace.css";

function LiveMonitorWorkspace() {
  const [mode, setMode] = useState("monitoring");

  return (
    <main className="live-workspace">

      {/* =========================
          WORKSPACE HEADER
      ========================== */}

      <div className="workspace-header">

        <div>
          <span className="workspace-eyebrow">
            EXAM OPERATIONS
          </span>

          <h1>
            Live Monitor
          </h1>

          <p>
            Configure the examination hall and monitor
            live seat activity from one workspace.
          </p>
        </div>


        {/* =========================
            MODE SWITCHER
        ========================== */}

        <div className="workspace-tabs">

          <button
            className={
              mode === "monitoring"
                ? "workspace-tab active"
                : "workspace-tab"
            }
            onClick={() => setMode("monitoring")}
          >
            Monitoring
          </button>


          <button
            className={
              mode === "setup"
                ? "workspace-tab active"
                : "workspace-tab"
            }
            onClick={() => setMode("setup")}
          >
            Camera Setup
          </button>

        </div>

      </div>


      {/* =========================
          WORKSPACE CONTENT
      ========================== */}

      <div className="workspace-content">

        {mode === "monitoring" && (
          <LiveMonitor />
        )}

        {mode === "setup" && (
          <CameraCalibration />
        )}

      </div>

    </main>
  );
}

export default LiveMonitorWorkspace;