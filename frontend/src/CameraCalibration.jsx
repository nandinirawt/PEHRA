import { useMemo, useState } from "react";
import "./CameraCalibration.css";

/*
 * ============================================================
 * PEHRA — CAMERA → SEAT CALIBRATION
 * VERSION 1
 * ============================================================
 *
 * Frontend mock implementation.
 *
 * CALIBRATION contract:
 *
 * {
 *   camera_id,
 *   zone,
 *   seat_ids,
 *   coverage,
 *   status
 * }
 *
 * SEAT shape used for generated layout:
 *
 * {
 *   seat_id,
 *   row,
 *   column,
 *   status
 * }
 *
 * No real camera/CV connection in Version 1.
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
    label = String.fromCharCode(65 + (number % 26)) + label;
    number = Math.floor(number / 26);
  }

  return label;
};


/* ============================================================
   GENERATE SEATS
   ============================================================ */

const generateSeats = (totalSeats, columnsPerRow) => {
  const seats = [];

  for (let index = 0; index < totalSeats; index++) {
    const rowIndex = Math.floor(index / columnsPerRow);
    const column = (index % columnsPerRow) + 1;

    const row = getRowLabel(rowIndex);

    seats.push({
      seat_id: `${row}-${String(column).padStart(2, "0")}`,
      row,
      column,
      status: "normal",
    });
  }

  return seats;
};


/* ============================================================
   INITIAL HALL
   ============================================================ */

const initialSeats = generateSeats(72, 6);


/* ============================================================
   COMPONENT
   ============================================================ */

function CameraCalibration() {

  const [selectedCamera, setSelectedCamera] =
    useState(cameras[0]);


  /* ==========================================================
     HALL CONFIGURATION
     ========================================================== */

  const [totalSeatsInput, setTotalSeatsInput] =
    useState("72");

  const [columnsInput, setColumnsInput] =
    useState("6");


  const [totalSeats, setTotalSeats] =
    useState(72);

  const [columnsPerRow, setColumnsPerRow] =
    useState(6);


  const [allSeats, setAllSeats] =
    useState(initialSeats);


  /* ==========================================================
     MAPPING
     ========================================================== */

  const [mappedSeats, setMappedSeats] =
    useState(initialSeats.map((seat) => seat.seat_id));


  /* ==========================================================
     UI STATE
     ========================================================== */

  const [actionMessage, setActionMessage] =
    useState("");

  const [isSaved, setIsSaved] =
    useState(false);


  /* ==========================================================
     CALCULATED ROWS
     ========================================================== */

  const rows = useMemo(() => {
    return Math.ceil(totalSeats / columnsPerRow);
  }, [totalSeats, columnsPerRow]);


  /* ==========================================================
     COVERAGE
     ========================================================== */

  const coverage = useMemo(() => {

    if (allSeats.length === 0) {
      return 0;
    }

    return Math.round(
      (mappedSeats.length / allSeats.length) * 100
    );

  }, [mappedSeats, allSeats]);


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
    camera_id: selectedCamera.camera_id,
    zone: selectedCamera.zone,
    seat_ids: mappedSeats,
    coverage,
    status: calibrationStatus,
  };


  /* ==========================================================
     GENERATE HALL LAYOUT
     ========================================================== */

  const generateHallLayout = () => {

    const requestedSeats =
      Math.max(
        1,
        Math.min(
          500,
          Number(totalSeatsInput) || 1
        )
      );

    const requestedColumns =
      Math.max(
        1,
        Math.min(
          20,
          Number(columnsInput) || 1
        )
      );


    const newSeats =
      generateSeats(
        requestedSeats,
        requestedColumns
      );


    setTotalSeats(requestedSeats);

    setColumnsPerRow(requestedColumns);

    setAllSeats(newSeats);
      localStorage.setItem(
  "pehraHallConfig",
  JSON.stringify({
    total_seats: requestedSeats,
    columns_per_row: requestedColumns,
    rows: Math.ceil(
      requestedSeats / requestedColumns
    ),
    seats: newSeats,
  })
);

    /*
     * For Version 1 we begin the newly generated
     * hall with every seat mapped.
     *
     * The invigilator can then click individual
     * seats to unmap them.
     */

    setMappedSeats(
      newSeats.map(
        (seat) => seat.seat_id
      )
    );


    setIsSaved(false);

    setActionMessage(
      `Hall layout generated: ${requestedSeats} seats, ${requestedColumns} columns and ${Math.ceil(
        requestedSeats / requestedColumns
      )} rows.`
    );
  };


  /* ==========================================================
     TOGGLE SEAT MAPPING
     ========================================================== */

  const toggleSeat = (seatId) => {

    setIsSaved(false);

    setActionMessage("");


    setMappedSeats((previous) => {

      if (previous.includes(seatId)) {

        return previous.filter(
          (id) => id !== seatId
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

    setIsSaved(true);

    setActionMessage(
      `Calibration saved for ${selectedCamera.camera_id}.`
    );


    /*
     * V2:
     * This object will be sent to the backend.
     *
     * V1:
     * Keep it locally and log it for demonstration.
     */
    localStorage.setItem(
  "pehraHallConfig",
  JSON.stringify({
    total_seats: totalSeats,
    columns_per_row: columnsPerRow,
    rows,
    seats: allSeats,
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

  const handleCameraChange = (camera) => {

    setSelectedCamera(camera);

    setIsSaved(false);

    setActionMessage("");

  };


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
            SYSTEM SETUP
          </span>

          <h1>
            Camera → Seat Calibration
          </h1>

          <p>
            Teach PEHRA which physical area of a camera
            image corresponds to each exam seat.
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


            {/* MOCK HALL */}

            <div className="mock-camera-hall">

              <div className="mock-camera-desk">
                INVIGILATOR DESK
              </div>


              <div
                className="mock-camera-seats"
                style={{
                  gridTemplateColumns:
                    `repeat(${columnsPerRow}, minmax(0, 1fr))`,
                }}
              >

                {allSeats.map((seat) => {

                  const isMapped =
                    mappedSeats.includes(
                      seat.seat_id
                    );


                  return (

                    <button
                      key={seat.seat_id}
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

                })}

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
            RIGHT — CONFIGURATION + CALIBRATION
            ==================================================== */}

        <div className="calibration-details">


          {/* ==================================================
              HALL CONFIGURATION
              ================================================== */}

          <div className="hall-config-card">

            <div className="hall-config-header">

              <div>

                <span className="detail-label">
                  HALL CONFIGURATION
                </span>

                <h3>
                  Seating Arrangement
                </h3>

                <p>
                  Configure the actual seating capacity
                  of this examination hall.
                </p>

              </div>

            </div>


            <div className="hall-config-inputs">


              <div>

                <label>
                  Total Seats
                </label>

                <input
                  type="number"
                  min="1"
                  max="500"
                  value={totalSeatsInput}
                  onChange={(event) =>
                    setTotalSeatsInput(
                      event.target.value
                    )
                  }
                />

              </div>


              <div>

                <label>
                  Seats per Row
                </label>

                <input
                  type="number"
                  min="1"
                  max="20"
                  value={columnsInput}
                  onChange={(event) =>
                    setColumnsInput(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>


            <div className="hall-config-summary">

              <div>

                <span>
                  Rows
                </span>

                <strong>
                  {Math.ceil(
                    (
                      Number(totalSeatsInput) || 0
                    ) /
                    (
                      Number(columnsInput) || 1
                    )
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Columns
                </span>

                <strong>
                  {Number(columnsInput) || 0}
                </strong>

              </div>


              <div>

                <span>
                  Seats
                </span>

                <strong>
                  {Number(totalSeatsInput) || 0}
                </strong>

              </div>

            </div>


            <button
              className="generate-layout-btn"
              onClick={generateHallLayout}
            >
              Generate Hall Layout
            </button>

          </div>


          {/* ==================================================
              CAMERA SELECTOR
              ================================================== */}

          <div className="detail-section">

            <span className="detail-label">
              CAMERA
            </span>

            <select
              value={selectedCamera.camera_id}
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

              {cameras.map((camera) => (

                <option
                  key={camera.camera_id}
                  value={camera.camera_id}
                >
                  {camera.camera_id}
                </option>

              ))}

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
                  width: `${coverage}%`,
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

                {calibrationStatus === "ready"
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
              disabled={coverage === 0}
              onClick={saveCalibration}
            >
              Save Calibration
            </button>


            <button
              className="reset-calibration"
              onClick={resetCalibration}
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

    </main>

  );
}


export default CameraCalibration;