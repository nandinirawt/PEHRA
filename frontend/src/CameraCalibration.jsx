import { useEffect, useMemo, useState } from "react";
import "./CameraCalibration.css";

/*
 * ============================================================
 * PEHRA — CAMERA → SEAT CALIBRATION
 * VERSION 1
 * ============================================================
 *
 * Camera Calibration receives the hall configuration from
 * Exam Setup.
 *
 * Exam Setup owns:
 * - number of rows
 * - seats per row
 * - total seats
 * - hall information
 *
 * Camera Calibration owns:
 * - camera selection
 * - camera → seat mapping
 * - coverage
 * - calibration status
 *
 * V1:
 * - No real camera/CV connection
 * - Configuration is shared through localStorage
 *
 * ============================================================
 */


/* ============================================================
   MOCK CAMERA DATA
============================================================ */

const cameras = [
  {
    camera_id: "CAM-HALL-A-01",
    zone: "Hall A — Front",
  },
  {
    camera_id: "CAM-HALL-A-02",
    zone: "Hall A — Middle",
  },
  {
    camera_id: "CAM-HALL-A-03",
    zone: "Hall A — Rear",
  },
  {
    camera_id: "CAM-HALL-A-04",
    zone: "Hall A — Wide View",
  },
];


/* ============================================================
   CREATE ROW LABEL
============================================================ */

const getRowLabel = (index) => {
  let label = "";
  let number = index + 1;

  while (number > 0) {
    number--;

    label =
      String.fromCharCode(
        65 + (number % 26)
      ) + label;

    number = Math.floor(number / 26);
  }

  return label;
};


/* ============================================================
   GENERATE SEATS
============================================================ */

const generateSeats = (
  totalSeats,
  columnsPerRow
) => {
  const seats = [];

  if (
    totalSeats <= 0 ||
    columnsPerRow <= 0
  ) {
    return seats;
  }

  for (
    let index = 0;
    index < totalSeats;
    index++
  ) {

    const rowIndex =
      Math.floor(
        index / columnsPerRow
      );

    const column =
      (index % columnsPerRow) + 1;

    const row =
      getRowLabel(rowIndex);

    seats.push({
      seat_id:
        `${row}-${String(column).padStart(2, "0")}`,

      row,

      column,

      status: "normal",
    });
  }

  return seats;
};


/* ============================================================
   COMPONENT
============================================================ */

function CameraCalibration({ onProceedToPreCheck }) {

  /* ==========================================================
     EXAM CONFIGURATION FROM EXAM SETUP
  ========================================================== */

  const [examConfig, setExamConfig] =
    useState(null);


  /* ==========================================================
     CAMERA
  ========================================================== */

  const [selectedCamera, setSelectedCamera] =
    useState(cameras[0]);


  /* ==========================================================
     SEATS
  ========================================================== */

  const [allSeats, setAllSeats] =
    useState([]);

  const [mappedSeats, setMappedSeats] =
    useState([]);


  /* ==========================================================
     UI STATE
  ========================================================== */

  const [actionMessage, setActionMessage] =
    useState("");

  const [isSaved, setIsSaved] =
    useState(false);


  /* ==========================================================
     LOAD EXAM CONFIGURATION
  ========================================================== */

  useEffect(() => {

    try {

      const savedConfig =
        localStorage.getItem(
          "pehraExamConfig"
        );

      if (!savedConfig) {

        setExamConfig(null);
        setAllSeats([]);
        setMappedSeats([]);

        return;
      }


      const parsedConfig =
        JSON.parse(savedConfig);


      const totalSeats =
        Number(parsedConfig.totalSeats) || 0;

      const columnsPerRow =
        Number(parsedConfig.seatsPerRow) || 0;


      if (
        totalSeats <= 0 ||
        columnsPerRow <= 0
      ) {

        setExamConfig(null);
        setAllSeats([]);
        setMappedSeats([]);

        return;
      }


      const seats =
        generateSeats(
          totalSeats,
          columnsPerRow
        );


      setExamConfig(parsedConfig);

      setAllSeats(seats);

      /*
       * V1 starts with all configured seats mapped.
       * The invigilator can click individual seats
       * to unmap them.
       */

      setMappedSeats(
        seats.map(
          (seat) => seat.seat_id
        )
      );


    } catch (error) {

      console.error(
        "Unable to load PEHRA exam configuration:",
        error
      );

      setExamConfig(null);
      setAllSeats([]);
      setMappedSeats([]);
    }

  }, []);


  /* ==========================================================
     CALCULATED VALUES
  ========================================================== */

  const totalSeats =
    allSeats.length;


  const columnsPerRow =
    Number(
      examConfig?.seatsPerRow
    ) || 0;


  const rows =
    Number(
      examConfig?.rows
    ) ||
    (
      columnsPerRow > 0
        ? Math.ceil(
            totalSeats /
            columnsPerRow
          )
        : 0
    );


  /* ==========================================================
     COVERAGE
  ========================================================== */

  const coverage = useMemo(() => {

    if (
      allSeats.length === 0
    ) {
      return 0;
    }

    return Math.round(
      (
        mappedSeats.length /
        allSeats.length
      ) * 100
    );

  }, [
    mappedSeats,
    allSeats,
  ]);


  /* ==========================================================
     CALIBRATION STATUS
  ========================================================== */

  const calibrationStatus =
    coverage === 100
      ? "ready"
      : coverage > 0
      ? "in_progress"
      : "not_configured";


  /* ==========================================================
     CALIBRATION CONTRACT
  ========================================================== */

  const calibration = {

    camera_id:
      selectedCamera.camera_id,

    zone:
      selectedCamera.zone,

    seat_ids:
      mappedSeats,

    coverage,

    status:
      calibrationStatus,
  };


  /* ==========================================================
     TOGGLE SEAT MAPPING
  ========================================================== */

  const toggleSeat = (seatId) => {

    setIsSaved(false);

    setActionMessage("");


    setMappedSeats((previous) => {

      if (
        previous.includes(seatId)
      ) {

        return previous.filter(
          (id) =>
            id !== seatId
        );
      }


      return [
        ...previous,
        seatId,
      ];

    });

  };


  /* ==========================================================
     SAVE CALIBRATION
  ========================================================== */

  const saveCalibration = () => {

    if (
      allSeats.length === 0
    ) {

      setActionMessage(
        "No exam hall configuration found. Please complete Exam Setup first."
      );

      return;
    }


    if (
      coverage === 0
    ) {

      setActionMessage(
        "Please map at least one seat before saving calibration."
      );

      return;
    }


    setIsSaved(true);


    setActionMessage(
      `Calibration saved for ${selectedCamera.camera_id}.`
    );


    /*
     * Keep the hall configuration in the format
     * already consumed by LiveMonitor.jsx.
     */

    localStorage.setItem(
      "pehraHallConfig",
      JSON.stringify({

        total_seats:
          totalSeats,

        columns_per_row:
          columnsPerRow,

        rows:
          rows,

        seats:
          allSeats,

      })
    );


    /*
     * Store the camera calibration separately.
     * This will be useful when the backend/WebSocket
     * is introduced in V2.
     */

    localStorage.setItem(
      "pehraCalibration",
      JSON.stringify({

        camera_id:
          calibration.camera_id,

        zone:
          calibration.zone,

        seat_ids:
          calibration.seat_ids,

        coverage:
          calibration.coverage,

        status:
          calibration.status,

      })
    );


    console.log(
      "PEHRA CALIBRATION:",
      calibration
    );

  };


  /* ==========================================================
     RESET MAPPING
  ========================================================== */

  const resetCalibration = () => {

    setMappedSeats([]);

    setIsSaved(false);

    setActionMessage(
      "Calibration reset. Select the seats covered by this camera."
    );

  };


  /* ==========================================================
     CAMERA CHANGE
  ========================================================== */

  const handleCameraChange = (
    camera
  ) => {

    setSelectedCamera(camera);

    setIsSaved(false);

    setActionMessage("");

  };


  /* ==========================================================
     NO EXAM CONFIGURATION
  ========================================================== */

  if (!examConfig) {

    return (
      <main className="camera-calibration-page">

        <section className="calibration-header">

          <div>

            <span className="eyebrow">
              SYSTEM SETUP
            </span>

            <h1>
              Camera → Seat Calibration
            </h1>

            <p>
              Camera calibration uses the hall layout
              configured during Exam Setup.
            </p>

          </div>

        </section>


        <section
          className="calibration-success"
          style={{
            marginTop: "24px",
          }}
        >

          <span className="success-icon">
            !
          </span>

          <div>

            <strong>
              Exam Setup Required
            </strong>

            <p>
              Please complete Exam Setup and configure
              the hall seating arrangement before
              starting camera calibration.
            </p>

          </div>

        </section>

      </main>
    );

  }


  /* ==========================================================
     RENDER
  ========================================================== */

  return (

    <main className="camera-calibration-page">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <section className="calibration-header">

        <div>

          <span className="eyebrow">
            CAMERA SETUP
          </span>

          <h1>
            Camera → Seat Calibration
          </h1>

          <p>
            Map the configured examination seats
            to the appropriate camera coverage.
          </p>

        </div>


        <div className="calibration-status">

          <span
            className={`status-dot ${
              coverage === 100
                ? "normal"
                : "review"
            }`}
          ></span>

          {coverage === 100
            ? "Calibration Ready"
            : "Calibration In Progress"}

        </div>

      </section>


      {/* ======================================================
          EXAM CONFIGURATION SUMMARY
      ====================================================== */}

      <section
        className="hall-config-card"
        style={{
          marginBottom: "20px",
        }}
      >

        <div className="hall-config-header">

          <div>

            <span className="detail-label">
              EXAM CONFIGURATION
            </span>

            <h3>
              {examConfig.examName}
            </h3>

            <p>
              {examConfig.examCode}
              {" · "}
              {examConfig.hallNumber}
            </p>

          </div>

        </div>


        <div className="hall-config-summary">

          <div>

            <span>
              Rows
            </span>

            <strong>
              {rows}
            </strong>

          </div>


          <div>

            <span>
              Columns
            </span>

            <strong>
              {columnsPerRow}
            </strong>

          </div>


          <div>

            <span>
              Seats
            </span>

            <strong>
              {totalSeats}
            </strong>

          </div>

        </div>

      </section>


      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <section className="calibration-layout">


        {/* ====================================================
            LEFT — CAMERA PREVIEW
        ==================================================== */}

        <div className="camera-panel">

          <div className="panel-heading">

            <div>

              <h2>
                Camera Preview
              </h2>

              <p>
                {selectedCamera.camera_id}
              </p>

            </div>


            <span className="camera-live-indicator">

              <span className="live-dot"></span>

              Preview

            </span>

          </div>


          {/* CAMERA MOCK VIEW */}

          <div className="camera-preview">

            <div className="camera-overlay">

              <span>
                LIVE CAMERA VIEW
              </span>

              <span>
                {selectedCamera.zone}
              </span>

            </div>


            {/* CONFIGURED HALL */}

            <div className="mock-camera-hall">

              <div className="mock-camera-desk">
                INVIGILATOR DESK
              </div>


              <div
                className="mock-camera-seats"
                style={{
                  gridTemplateColumns:
                    `repeat(${Math.max(
                      columnsPerRow,
                      1
                    )}, minmax(0, 1fr))`,
                }}
              >

                {allSeats.map(
                  (seat) => {

                    const isMapped =
                      mappedSeats.includes(
                        seat.seat_id
                      );


                    return (

                      <button
                        key={
                          seat.seat_id
                        }

                        className={`camera-seat ${
                          isMapped
                            ? "mapped"
                            : "unmapped"
                        }`}

                        onClick={() =>
                          toggleSeat(
                            seat.seat_id
                          )
                        }
                      >

                        <span></span>

                        {seat.seat_id}

                      </button>

                    );

                  }
                )}

              </div>

            </div>


            <div className="camera-overlay-bottom">

              <span>
                Click a seat to map / unmap
              </span>

            </div>

          </div>


          {/* CAMERA LEGEND */}

          <div className="camera-legend">

            <span>

              <i className="mapped"></i>

              Mapped

            </span>


            <span>

              <i className="unmapped"></i>

              Not mapped

            </span>

          </div>

        </div>


        {/* ====================================================
            RIGHT — CALIBRATION DETAILS
        ==================================================== */}

        <div className="calibration-details">


          {/* ==================================================
              CAMERA SELECTOR
          ================================================== */}

          <div className="detail-section">

            <span className="detail-label">
              CAMERA
            </span>

            <select
              value={
                selectedCamera.camera_id
              }

              onChange={(event) => {

                const camera =
                  cameras.find(
                    (item) =>
                      item.camera_id ===
                      event.target.value
                  );

                if (camera) {

                  handleCameraChange(
                    camera
                  );

                }

              }}
            >

              {cameras.map(
                (camera) => (

                  <option
                    key={
                      camera.camera_id
                    }

                    value={
                      camera.camera_id
                    }
                  >
                    {camera.camera_id}
                  </option>

                )
              )}

            </select>

          </div>


          {/* ==================================================
              ZONE / CAMERA STATUS
          ================================================== */}

          <div className="info-row">

            <div>

              <span>
                Zone
              </span>

              <strong>
                {selectedCamera.zone}
              </strong>

            </div>


            <div>

              <span>
                Camera Status
              </span>

              <strong className="ready-text">

                <span className="status-dot normal"></span>

                Connected

              </strong>

            </div>

          </div>


          {/* ==================================================
              HALL SUMMARY
          ================================================== */}

          <div className="calibration-card">

            <div className="calibration-card-header">

              <span className="detail-label">
                HALL LAYOUT
              </span>

              <span className="calibration-badge ready">
                Configured
              </span>

            </div>


            <div className="calibration-info">

              <div>

                <span>
                  Hall
                </span>

                <strong>
                  {examConfig.hallNumber}
                </strong>

              </div>


              <div>

                <span>
                  Rows
                </span>

                <strong>
                  {rows}
                </strong>

              </div>


              <div>

                <span>
                  Seats
                </span>

                <strong>
                  {totalSeats}
                </strong>

              </div>

            </div>

          </div>


          {/* ==================================================
              COVERAGE
          ================================================== */}

          <div className="coverage-section">

            <div className="coverage-heading">

              <div>

                <span className="detail-label">
                  SEAT COVERAGE
                </span>

                <strong>
                  {mappedSeats.length} /{" "}
                  {allSeats.length}
                </strong>

              </div>


              <strong>
                {coverage}%
              </strong>

            </div>


            <div className="coverage-bar">

              <div
                style={{
                  width:
                    `${coverage}%`,
                }}
              ></div>

            </div>


            <p>

              {coverage === 100
                ? "All seats are mapped to this camera."
                : `${allSeats.length - mappedSeats.length} seats still need mapping.`}

            </p>

          </div>


          {/* ==================================================
              CALIBRATION STATUS
          ================================================== */}

          <div className="calibration-card">

            <div className="calibration-card-header">

              <span className="detail-label">
                CALIBRATION STATUS
              </span>


              <span
                className={`calibration-badge ${
                  calibrationStatus
                }`}
              >

                {calibrationStatus ===
                "ready"
                  ? "Ready"
                  : calibrationStatus ===
                    "in_progress"
                  ? "In Progress"
                  : "Not Configured"}

              </span>

            </div>


            <div className="calibration-info">

              <div>

                <span>
                  Camera ID
                </span>

                <strong>
                  {calibration.camera_id}
                </strong>

              </div>


              <div>

                <span>
                  Seats Mapped
                </span>

                <strong>
                  {calibration.seat_ids.length}
                </strong>

              </div>


              <div>

                <span>
                  Coverage
                </span>

                <strong>
                  {calibration.coverage}%
                </strong>

              </div>

            </div>

          </div>


          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="calibration-actions">

            <button
              className="save-calibration"
              disabled={
                coverage === 0
              }

              onClick={
                saveCalibration
              }
            >
              Save Calibration
            </button>


            <button
              className="reset-calibration"
              onClick={
                resetCalibration
              }
            >
              Reset
            </button>

          </div>


          {/* ==================================================
              FEEDBACK
          ================================================== */}

          {actionMessage && (

            <div className="calibration-message">

              <span className="privacy-dot"></span>

              {actionMessage}

            </div>

          )}


          {/* ==================================================
              CONTRACT NOTE
          ================================================== */}

          <div className="calibration-note">

            <span className="privacy-dot"></span>

            Calibration data maps camera zones to
            anonymous seat IDs. No student identity data
            is captured.

          </div>

        </div>

      </section>


      {/* ======================================================
          SUCCESS
      ====================================================== */}

      {isSaved && (

        <section className="calibration-success">

          <span className="success-icon">
            ✓
          </span>


          <div>

            <strong>
              Calibration saved successfully
            </strong>

            <p>
              {selectedCamera.camera_id} currently
              covers {mappedSeats.length} of{" "}
              {allSeats.length} seats.
            </p>

          </div>

        </section>

      )}
      <div className="calibration-footer">
  <button
    className="secondary-operation-button"
    onClick={() => window.history.back()}
  >
    ← Back
  </button>

  <button
    className="primary-operation-button"
    disabled={!isSaved}
   onClick={onProceedToPreCheck}
  >
    Proceed to Pre-Exam Check
    <span>→</span>
  </button>
</div>

    </main>
  );
}


export default CameraCalibration;