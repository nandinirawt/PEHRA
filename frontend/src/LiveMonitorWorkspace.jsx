import { useState } from "react";
import LiveMonitor from "./LiveMonitor";
import CameraCalibration from "./CameraCalibration";
import PrivacyCenter from "./PrivacyCenter";
import "./LiveMonitorWorkspace.css";

function LiveMonitorWorkspace() {
  const [section, setSection] = useState("exam-setup");

  // =========================================================
  // EXAM SETUP DATA
  // =========================================================

  const [examName, setExamName] = useState(
    "Semester End Examination — Mathematics"
  );

  const [examCode, setExamCode] = useState("MTH-401");

  const [hallNumber, setHallNumber] = useState("HALL-A");

  const [examDate, setExamDate] = useState("15/08/2026");

  const [startTime, setStartTime] = useState("10:00 AM");

  const [duration, setDuration] = useState(90);

  // Keep these as strings so the user can temporarily empty
  // the input while typing.
  const [rows, setRows] = useState("12");

  const [seatsPerRow, setSeatsPerRow] = useState("6");

  // Convert safely to numbers for calculations.
  const numericRows = Number(rows) || 0;
  const numericSeatsPerRow = Number(seatsPerRow) || 0;

  const totalSeats = numericRows * numericSeatsPerRow;


  // =========================================================
  // NAVIGATION
  // =========================================================

  const goToSection = (nextSection) => {
    setSection(nextSection);
  };


  // =========================================================
  // STEP 1:
  // SAVE EXAM + HALL CONFIGURATION
  // =========================================================

  const saveExamConfiguration = () => {

    // Do not continue if seating values are empty/invalid.
    if (
      numericRows < 1 ||
      numericSeatsPerRow < 1
    ) {
      alert(
        "Please enter at least 1 row and 1 seat per row."
      );

      return false;
    }

    const examConfiguration = {
      examName,
      examCode,
      hallNumber,
      examDate,
      startTime,
      duration: Number(duration) || 0,
      rows: numericRows,
      seatsPerRow: numericSeatsPerRow,
      totalSeats,
      savedAt: new Date().toISOString(),
    };

    try {

      localStorage.setItem(
        "pehraExamConfig",
        JSON.stringify(examConfiguration)
      );

      console.log(
        "PEHRA exam configuration saved:",
        examConfiguration
      );

      return true;

    } catch (error) {

      console.error(
        "Unable to save PEHRA exam configuration:",
        error
      );

      return false;
    }
  };


  // =========================================================
  // EXAM SETUP
  // =========================================================

  const renderExamSetup = () => {
    return (
      <div className="operation-page">

        <div className="operation-heading">

          <div>

            <span className="operation-eyebrow">
              EXAM SETUP
            </span>

            <h2>
              Examination Setup
            </h2>

            <p>
              Configure the examination details and seating arrangement
              before monitoring begins.
            </p>

          </div>

          <div className="operation-status">
            <span className="status-dot green"></span>
            Setup
          </div>

        </div>


        <div className="setup-grid">

          {/* =================================================
              EXAMINATION DETAILS
          ================================================= */}

          <section className="setup-card">

            <div className="card-title">
              Examination Details
            </div>


            <div className="form-group">

              <label>
                Examination Name
              </label>

              <input
                type="text"
                value={examName}
                onChange={(e) =>
                  setExamName(e.target.value)
                }
              />

            </div>


            <div className="form-group">

              <label>
                Exam Code
              </label>

              <input
                type="text"
                value={examCode}
                onChange={(e) =>
                  setExamCode(e.target.value)
                }
              />

            </div>


            <div className="form-group">

              <label>
                Room / Hall Number
              </label>

              <input
                type="text"
                value={hallNumber}
                onChange={(e) =>
                  setHallNumber(e.target.value)
                }
              />

            </div>


            <div className="two-column">

              <div className="form-group">

                <label>
                  Date
                </label>

                <input
                  type="text"
                  value={examDate}
                  onChange={(e) =>
                    setExamDate(e.target.value)
                  }
                />

              </div>


              <div className="form-group">

                <label>
                  Start Time
                </label>

                <input
                  type="text"
                  value={startTime}
                  onChange={(e) =>
                    setStartTime(e.target.value)
                  }
                />

              </div>

            </div>


            <div className="form-group">

              <label>
                Duration (minutes)
              </label>

              <input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => {

                  const value = e.target.value;

                  if (value === "") {
                    setDuration("");
                    return;
                  }

                  setDuration(Number(value));

                }}
              />

            </div>

          </section>


          {/* =================================================
              SEATING CONFIGURATION
          ================================================= */}

          <section className="setup-card">

            <div className="card-title">
              Seating Configuration
            </div>

            <p className="card-description">
              Configure the actual seating capacity of this
              examination hall.
            </p>


            <div className="two-column">

              {/* ROWS */}

              <div className="form-group">

                <label>
                  Number of Rows
                </label>

                <input
                  type="number"
                  min="1"
                  value={rows}
                  onChange={(e) => {

                    const value = e.target.value;

                    // Allow the field to temporarily become empty.
                    if (value === "") {
                      setRows("");
                      return;
                    }

                    setRows(value);

                  }}
                />

              </div>


              {/* SEATS PER ROW */}

              <div className="form-group">

                <label>
                  Seats per Row
                </label>

                <input
                  type="number"
                  min="1"
                  value={seatsPerRow}
                  onChange={(e) => {

                    const value = e.target.value;

                    // Allow the field to temporarily become empty.
                    if (value === "") {
                      setSeatsPerRow("");
                      return;
                    }

                    setSeatsPerRow(value);

                  }}
                />

              </div>

            </div>


            {/* =================================================
                SEAT SUMMARY
            ================================================= */}

            <div className="seat-summary">

              <div>

                <span>
                  Rows
                </span>

                <strong>
                  {numericRows}
                </strong>

              </div>


              <div>

                <span>
                  Columns
                </span>

                <strong>
                  {numericSeatsPerRow}
                </strong>

              </div>


              <div>

                <span>
                  Total Seats
                </span>

                <strong>
                  {totalSeats}
                </strong>

              </div>

            </div>


            {/* =================================================
                SEATING PREVIEW
            ================================================= */}

            <div className="seating-preview">

              <div className="preview-label">
                Seating Preview
              </div>

              <div className="invigilator-desk">
                INVIGILATOR DESK
              </div>


              <div
                className="preview-grid"
                style={{
                  gridTemplateColumns:
                    `repeat(${Math.max(
                      numericSeatsPerRow,
                      1
                    )}, minmax(55px, 1fr))`
                }}
              >

                {Array.from(
                  { length: totalSeats },
                  (_, index) => {

                    const rowIndex =
                      Math.floor(
                        index / numericSeatsPerRow
                      );

                    const columnIndex =
                      index % numericSeatsPerRow;

                    const rowLetter =
                      String.fromCharCode(
                        65 + rowIndex
                      );

                    const seatNumber =
                      String(
                        columnIndex + 1
                      ).padStart(2, "0");

                    const seatId =
                      `${rowLetter}-${seatNumber}`;


                    return (
                      <div
                        key={seatId}
                        className="preview-seat"
                      >

                        <span className="seat-status-dot"></span>

                        {seatId}

                      </div>
                    );

                  }
                )}

              </div>

            </div>

          </section>

        </div>


        {/* =================================================
            IDENTITY MINIMIZED NOTICE
        ================================================= */}

        <div className="identity-notice">

          <div className="notice-icon">
            ✓
          </div>

          <div>

            <strong>
              Identity-Minimized Setup
            </strong>

            <p>
              Students are represented by anonymous Seat IDs.
              Facial identity is not required for behavioural monitoring.
            </p>

          </div>

        </div>


        {/* =================================================
            CONTINUE
        ================================================= */}

        <div className="operation-footer">

          <button
            className="primary-operation-button"
            onClick={() => {

              const saved =
                saveExamConfiguration();

              if (saved) {
                goToSection("calibration");
              }

            }}
          >

            Continue to Camera Calibration

            <span>
              →
            </span>

          </button>

        </div>

      </div>
    );
  };


  // =========================================================
  // PRE-EXAM CHECK
  // =========================================================

  const renderPreExamCheck = () => {
    return (
      <div className="operation-page">

        <div className="operation-heading">

          <div>

            <span className="operation-eyebrow">
              PRE-EXAM CHECK
            </span>

            <h2>
              System Readiness
            </h2>

            <p>
              Verify that the examination environment is ready
              before live monitoring begins.
            </p>

          </div>

          <div className="operation-status">
            <span className="status-dot green"></span>
            Ready
          </div>

        </div>


        <div className="check-list">

          <div className="check-item">

            <div className="check-icon">
              ✓
            </div>

            <div>

              <strong>
                Examination configuration
              </strong>

              <p>
                {examName} · {examCode} · {hallNumber}
              </p>

            </div>

            <span className="check-status">
              Complete
            </span>

          </div>


          <div className="check-item">

            <div className="check-icon">
              ✓
            </div>

            <div>

              <strong>
                Seating arrangement
              </strong>

              <p>
                {numericRows} rows × {numericSeatsPerRow} seats = {totalSeats} seats
              </p>

            </div>

            <span className="check-status">
              Complete
            </span>

          </div>


          <div className="check-item">

            <div className="check-icon">
              ✓
            </div>

            <div>

              <strong>
                Camera calibration
              </strong>

              <p>
                Camera-to-seat mapping is ready for monitoring.
              </p>

            </div>

            <span className="check-status">
              Ready
            </span>

          </div>


          <div className="check-item">

            <div className="check-icon">
              ✓
            </div>

            <div>

              <strong>
                Privacy configuration
              </strong>

              <p>
                Anonymous seat identifiers are used for monitoring.
              </p>

            </div>

            <span className="check-status">
              Protected
            </span>

          </div>

        </div>


        <div className="operation-footer">

          <button
            className="secondary-operation-button"
            onClick={() =>
              goToSection("calibration")
            }
          >
            ← Review Camera Setup
          </button>


          <button
            className="primary-operation-button"
            onClick={() => {

              const saved =
                saveExamConfiguration();

              if (saved) {
                goToSection("monitoring");
              }

            }}
          >

            Start Live Monitoring

            <span>
              →
            </span>

          </button>

        </div>

      </div>
    );
  };


  // =========================================================
  // ALERTS
  // =========================================================

  const renderAlerts = () => {
    return (
      <div className="operation-page">

        <div className="operation-heading">

          <div>

            <span className="operation-eyebrow">
              ALERTS
            </span>

            <h2>
              Examination Alerts
            </h2>

            <p>
              Review seats that currently require invigilator attention.
            </p>

          </div>

        </div>


        <div className="alert-list">

          <div className="alert-card review">

            <div className="alert-indicator"></div>

            <div className="alert-content">

              <strong>
                A-05
              </strong>

              <span>
                Under Review
              </span>

              <p>
                Behaviour signal requires invigilator review.
              </p>

            </div>

            <button
              onClick={() =>
                goToSection("monitoring")
              }
            >
              View Seat
            </button>

          </div>


          <div className="alert-card high-risk">

            <div className="alert-indicator"></div>

            <div className="alert-content">

              <strong>
                B-04
              </strong>

              <span>
                High Risk
              </span>

              <p>
                A high-risk behaviour event has been detected.
              </p>

            </div>

            <button
              onClick={() =>
                goToSection("monitoring")
              }
            >
              View Seat
            </button>

          </div>


          <div className="alert-card review">

            <div className="alert-indicator"></div>

            <div className="alert-content">

              <strong>
                C-06
              </strong>

              <span>
                Under Review
              </span>

              <p>
                Seat requires additional observation.
              </p>

            </div>

            <button
              onClick={() =>
                goToSection("monitoring")
              }
            >
              View Seat
            </button>

          </div>

        </div>

      </div>
    );
  };


  // =========================================================
  // SESSION REPORT
  // =========================================================

  const renderSessionReport = () => {
    const reportUnderReview = Math.min(5, totalSeats);
const reportHighRisk = Math.min(2, Math.max(0, totalSeats - reportUnderReview));
const reportAbsent = 0;

const reportNormal = Math.max(
  0,
  totalSeats - reportUnderReview - reportHighRisk - reportAbsent
);

const reportIncidents = reportUnderReview + reportHighRisk;
    return (
      <div className="operation-page">

        <div className="operation-heading">

          <div>

            <span className="operation-eyebrow">
              SESSION REPORT
            </span>

            <h2>
              Examination Summary
            </h2>

            <p>
              Overview of the current examination monitoring session.
            </p>

          </div>

        </div>


        <div className="report-grid">

          <div className="report-card">
            <span>Total Seats</span>
            <strong>{totalSeats}</strong>
          </div>


          <div className="report-card">
            <span>Normal</span>
            <strong>{reportNormal}</strong>
          </div>


          <div className="report-card">
            <span>Under Review</span>
            <strong>{reportUnderReview}</strong>
          </div>


          <div className="report-card">
            <span>High Risk</span>
            <strong>{reportHighRisk}</strong>
          </div>


          <div className="report-card">
            <span>Absent</span>
            <strong>{reportAbsent}</strong>
          </div>


          <div className="report-card">
            <span>Incidents</span>
            <strong>{reportIncidents}</strong>
          </div>

        </div>


        <div className="report-summary">

          <h3>
            Session Information
          </h3>

          <p>
            <strong>
              Examination:
            </strong>{" "}
            {examName}
          </p>

          <p>
            <strong>
              Hall:
            </strong>{" "}
            {hallNumber}
          </p>

          <p>
            <strong>
              Duration:
            </strong>{" "}
            {duration || 0} minutes
          </p>

          <p>
            <strong>
              Monitoring:
            </strong>{" "}
            Anonymous seat-based monitoring
          </p>

        </div>

      </div>
    );
  };


  // =========================================================
  // MAIN CONTENT SWITCH
  // =========================================================

  const renderContent = () => {

    switch (section) {

      case "exam-setup":
        return renderExamSetup();

      case "calibration":
  return (
    <div className="embedded-page">
      <CameraCalibration
        onProceedToPreCheck={() =>
          goToSection("pre-check")
        }
      />
    </div>
  );

      case "pre-check":
        return renderPreExamCheck();

      case "monitoring":
        return (
          <div className="embedded-page">
            <LiveMonitor />
          </div>
        );

      case "alerts":
        return renderAlerts();

      case "report":
        return renderSessionReport();

      case "privacy":
        return (
          <div className="embedded-page privacy-embedded">
            <PrivacyCenter />
          </div>
        );

      default:
        return renderExamSetup();
    }
  };


  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <main className="live-workspace">

      <header className="workspace-header">

        <div>

          <span className="workspace-eyebrow">
            EXAM OPERATIONS
          </span>

          <h1>
            Live Monitor
          </h1>

          <p>
            Configure, verify and monitor the examination
            from one workspace.
          </p>

        </div>

      </header>


      <div className="workspace-body">

        {/* =================================================
            SIDE NAVIGATION
        ================================================= */}

        <aside className="workspace-sidebar">

          <div className="sidebar-title">
            EXAM OPERATIONS
          </div>


          <button
            className={
              section === "exam-setup"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              goToSection("exam-setup")
            }
          >
            <span className="sidebar-icon">
              ▣
            </span>

            <span>
              Exam Setup
            </span>
          </button>


          <button
            className={
              section === "calibration"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              goToSection("calibration")
            }
          >
            <span className="sidebar-icon">
              ◉
            </span>

            <span>
              Camera Calibration
            </span>
          </button>


          <button
            className={
              section === "pre-check"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              goToSection("pre-check")
            }
          >
            <span className="sidebar-icon">
              ✓
            </span>

            <span>
              Pre-Exam Check
            </span>
          </button>


          <button
            className={
              section === "monitoring"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              goToSection("monitoring")
            }
          >
            <span className="sidebar-icon">
              ◌
            </span>

            <span>
              Live Monitoring
            </span>
          </button>


          <button
            className={
              section === "alerts"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              goToSection("alerts")
            }
          >
            <span className="sidebar-icon">
              !
            </span>

            <span>
              Alerts
            </span>
          </button>


          <button
            className={
              section === "report"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              goToSection("report")
            }
          >
            <span className="sidebar-icon">
              ▤
            </span>

            <span>
              Session Report
            </span>
          </button>


          <button
            className={
              section === "privacy"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              goToSection("privacy")
            }
          >
            <span className="sidebar-icon">
              ⌁
            </span>

            <span>
              Privacy & System
            </span>
          </button>


          <div className="sidebar-footer">

            <span className="status-dot green"></span>

            <div>

              <strong>
                Local Processing
              </strong>

              <small>
                Identity minimized
              </small>

            </div>

          </div>

        </aside>


        {/* =================================================
            MAIN WORKSPACE CONTENT
        ================================================= */}

        <section className="workspace-main">

          {renderContent()}

        </section>

      </div>

    </main>
  );
}

export default LiveMonitorWorkspace;