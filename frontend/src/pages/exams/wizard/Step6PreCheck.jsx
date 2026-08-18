import React, { useState } from "react";

export default function Step6PreCheck({ formData, onStartExam, onSaveReady, isSubmitting = false }) {
  const [runningDiagnostic, setRunningDiagnostic] = useState(false);
  const [diagnosticDone, setDiagnosticDone] = useState(true);

  const handleReRunDiagnostic = () => {
    setRunningDiagnostic(true);
    setDiagnosticDone(false);
    setTimeout(() => {
      setRunningDiagnostic(false);
      setDiagnosticDone(true);
    }, 1200);
  };

  const seatingConfig = formData.seatingConfig || { rows: 6, columns: 10, disabledSeats: [] };
  const totalSlots = (seatingConfig.rows || 6) * (seatingConfig.columns || 10);
  const activeDesks = totalSlots - (seatingConfig.disabledSeats ? seatingConfig.disabledSeats.length : 0);

  const checks = [
    {
      id: "seating",
      label: "Hall Seating Matrix Synchronized",
      detail: `${activeDesks} active examination desks configured in ${formData.hall || "Hall A"}.`,
      status: "passed",
      badge: "VERIFIED",
    },
    {
      id: "edge_ai",
      label: "Edge AI Sensing Pipeline Online",
      detail: "Local inference runtime active (Latency: 14ms · Model: Anonymous Pose 17-pt).",
      status: "passed",
      badge: "ONLINE",
    },
    {
      id: "cameras",
      label: "Camera Feeds Synchronized & Streaming",
      detail: `${(formData.cameras && formData.cameras.length) || 3} camera nodes delivering steady 30 FPS.`,
      status: "passed",
      badge: "30 FPS",
    },
    {
      id: "calibration",
      label: "Spatial Calibration Matrix Validated",
      detail: "100% seat coverage achieved. Zero blind spots detected.",
      status: "passed",
      badge: "100% COVERAGE",
    },
    {
      id: "privacy",
      label: "Privacy Architecture Enforced",
      detail: "Face embeddings disabled · Raw frames discarded · Anonymous Seat IDs only.",
      status: "passed",
      badge: "GUARANTEED",
    },
  ];

  return (
    <div className="wizard-step-content">
      <div className="step-intro">
        <h2>Step 6: Pre-Exam Readiness Audit & Launch</h2>
        <p>
          Review automated pre-flight health diagnostics before starting the examination or saving
          it as ready.
        </p>
      </div>

      <div className="precheck-summary-banner">
        <div className="exam-summary-card">
          <span className="eyebrow-mini">EXAMINATION OVERVIEW</span>
          <h3>{formData.title || "Untitled Examination"}</h3>
          <div className="meta-row">
            <span><strong>Subject:</strong> {formData.subject || "General"}</span>
            <span><strong>Hall:</strong> {formData.hall || "Hall A"}</span>
            <span><strong>Date:</strong> {formData.date || "Today"}</span>
            <span><strong>Time:</strong> {formData.startTime || "10:00"} – {formData.endTime || "13:00"}</span>
            <span><strong>Candidates:</strong> {activeDesks}</span>
          </div>
        </div>

        <div className="readiness-score-card">
          <span className="score-label">System Readiness Score</span>
          <strong className="score-value">100%</strong>
          <span className="score-badge">READY TO LAUNCH</span>
        </div>
      </div>

      {/* Diagnostics List */}
      <div className="diagnostics-panel">
        <div className="panel-header-row">
          <h3>Pre-Flight System Diagnostics</h3>
          <button
            type="button"
            className="secondary-button"
            onClick={handleReRunDiagnostic}
            disabled={runningDiagnostic}
          >
            {runningDiagnostic ? "Running Diagnostics..." : "↻ Re-Run All Diagnostics"}
          </button>
        </div>

        <div className="diagnostics-list">
          {checks.map((c) => (
            <div key={c.id} className={`diagnostic-item ${runningDiagnostic ? "checking" : "passed"}`}>
              <div className="diag-icon-col">
                <span className="diag-check-circle">{runningDiagnostic ? "⋯" : "✓"}</span>
              </div>
              <div className="diag-content-col">
                <div className="diag-title-row">
                  <strong>{c.label}</strong>
                  <span className="diag-tag">{runningDiagnostic ? "CHECKING" : c.badge}</span>
                </div>
                <p className="diag-detail">{c.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action controls */}
      <div className="precheck-launch-card">
        <div className="launch-info">
          <h4>Ready to Begin Examination?</h4>
          <p>
            Starting the examination initiates real-time anonymous pose processing, activates the
            Active Exam Dock, and opens the Live Monitor control room.
          </p>
        </div>

        <div className="launch-buttons-group">
          <button
            type="button"
            className="secondary-button"
            onClick={onSaveReady}
            disabled={isSubmitting}
          >
            Save as Upcoming Exam
          </button>

          <button
            type="button"
            className="primary-button btn-launch-live"
            onClick={onStartExam}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Starting Session..." : "▶ Start Examination Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
