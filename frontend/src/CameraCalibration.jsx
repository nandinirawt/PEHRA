import { useEffect, useMemo, useRef, useState } from "react";
import "./CameraCalibration.css";
const CALIBRATION_API =
  "http://127.0.0.1:8011";

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
 * Prototype:
 * - Demo classroom image camera feed supported
 * - Live browser camera supported when permission is available
 * - Seat detection uses the existing P6 calibration detector API
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
    const [selectedSeatId, setSelectedSeatId] =
  useState(null);

  const [cameraMode, setCameraMode] =
    useState("demo");
    const [detectedSeats, setDetectedSeats] = useState([]);
    const detectionCacheRef = useRef({});
    const detectionHistoryRef = useRef([]);
    const [detectionImageSize, setDetectionImageSize] =
  useState({
    width: 1536,
    height: 1024,
  });

const liveDetectionInProgress =
  useRef(false);
const [detectionLoading, setDetectionLoading] = useState(false);
const [detectionError, setDetectionError] = useState("");

  const [videoError, setVideoError] =
    useState(false);

  const liveVideoRef =
    useRef(null);


  /* ==========================================================
     UI STATE
  ========================================================== */

  const [actionMessage, setActionMessage] =
    useState("");

  const [isSaved, setIsSaved] =
    useState(false);


  const detectClassroomSeats = async () => {
  try {
    setDetectionLoading(true);
    setDetectionError("");

    const imageBlob = await fetch(
      "/calibration/classroom.jpg"
    ).then((response) => {
      if (!response.ok) {
        throw new Error(
          "Classroom demo image could not be loaded."
        );
      }

      return response.blob();
    });

    const formData = new FormData();

    formData.append(
      "file",
      imageBlob,
      "classroom.jpg"
    );

   const response = await fetch(
  "http://127.0.0.1:8001/calibration/detect",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Seat detection failed: ${response.status}`
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(
        result.error ||
        "Seat detection failed."
      );
    }

    setDetectedSeats(
      result.seats || []
    );

  } catch (error) {
    console.error(
      "Seat detection error:",
      error
    );

    setDetectedSeats([]);

    setDetectionError(
      error.message ||
      "Unable to detect seats."
    );

  } finally {
    setDetectionLoading(false);
  }
};
const detectLiveFrame = async () => {

  if (
    liveDetectionInProgress.current ||
    !liveVideoRef.current
  ) {
    return;
  }

  const video =
    liveVideoRef.current;

  if (
    video.readyState < 2 ||
    video.videoWidth <= 0 ||
    video.videoHeight <= 0
  ) {
    return;
  }

  liveDetectionInProgress.current =
    true;

  try {

    const canvas =
      document.createElement("canvas");

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

    const context =
      canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    setDetectionImageSize({
      width: canvas.width,
      height: canvas.height,
    });

    const blob =
      await new Promise((resolve) => {
        canvas.toBlob(
          resolve,
          "image/jpeg",
          0.82
        );
      });

    if (!blob) {
      throw new Error(
        "Unable to capture live camera frame."
      );
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      blob,
      "live-frame.jpg"
    );

    const response =
      await fetch(
        "http://127.0.0.1:8001/calibration/detect",
        {
          method: "POST",
          body: formData,
        }
      );

    if (!response.ok) {
      throw new Error(
        `Live seat detection failed: ${response.status}`
      );
    }

    const result =
      await response.json();

    if (!result.success) {
      throw new Error(
        result.error ||
        "Unable to detect seats in live camera."
      );
    }

   const currentSeats =
  result.seats || [];

// Save the latest position of every detected seat.
currentSeats.forEach((seat) => {

  const seatId =
    seat.seat_id || seat.label;

  if (seatId) {
    detectionCacheRef.current[seatId] =
      seat;
  }

});

// Keep the last 3 detection frames.
detectionHistoryRef.current.push(
  currentSeats
);

if (
  detectionHistoryRef.current.length > 3
) {
  detectionHistoryRef.current.shift();
}

// Count how many recent frames saw each seat.
const seatAppearanceCount = {};

detectionHistoryRef.current.forEach(
  (frameSeats) => {

    frameSeats.forEach((seat) => {

      const seatId =
        seat.seat_id || seat.label;

      if (!seatId) {
        return;
      }

      seatAppearanceCount[seatId] =
        (seatAppearanceCount[seatId] || 0) + 1;

    });

  }
);

// Keep seats seen in at least 2 of the last 3 frames.
const stableSeats =
  currentSeats.filter((seat) => {

    const seatId =
      seat.seat_id || seat.label;

    return (
      seatAppearanceCount[seatId] >= 2
    );

  });

// IMPORTANT:
// Once a seat has been mapped, keep its last
// known box visible even if the next frame misses it.
mappedSeats.forEach((seatId) => {

  const alreadyVisible =
    stableSeats.some(
      (seat) =>
        (seat.seat_id || seat.label) ===
        seatId
    );

  if (alreadyVisible) {
    return;
  }

  const cachedSeat =
    detectionCacheRef.current[seatId];

  if (cachedSeat) {
    stableSeats.push(cachedSeat);
  }

});

setDetectedSeats(stableSeats);

setDetectionError("");

  } catch (error) {

    console.error(
      "Live seat detection error:",
      error
    );

    setDetectionError(
      error.message ||
      "Unable to detect seats from live camera."
    );

  } finally {

    liveDetectionInProgress.current =
      false;
  }
};
useEffect(() => {

  if (cameraMode !== "live") {
    return undefined;
  }

  const intervalId =
    setInterval(() => {
      detectLiveFrame();
    }, 1000);

  return () => {
    clearInterval(intervalId);
  };

}, [cameraMode]);

  /* ==========================================================
     LIVE CAMERA
  ========================================================== */

  useEffect(() => {

    let stream = null;

    if (cameraMode !== "live") {
      return undefined;
    }

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setActionMessage(
        "Live camera is not supported by this browser."
      );
      return undefined;
    }

    const startLiveCamera = async () => {
      try {

        setActionMessage(
          "Requesting camera permission..."
        );

        stream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });

        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject =
            stream;
        }

        setActionMessage(
          "Live camera connected."
        );

      } catch (error) {

        console.error(
          "Unable to access live camera:",
          error
        );

        setActionMessage(
          "Could not access the camera. Check browser camera permission."
        );
      }
    };

    startLiveCamera();

    return () => {

      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject =
          null;
      }
    };

  }, [cameraMode]);


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

    // Start with no seats mapped.
    setMappedSeats([]);

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
useEffect(() => {

  if (!examConfig) {
    return;
  }

  detectClassroomSeats();

}, [examConfig]);


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
const expectedSeatCount =
  allSeats.length;

const detectedSeatCount =
  detectedSeats.length;

const detectionCoverage =
  expectedSeatCount > 0
    ? Math.round(
        (detectedSeatCount /
          expectedSeatCount) *
          100
      )
    : 0;

const detectionStatus =
  detectionCoverage === 100
    ? "matched"
    : "attention";

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

  const alreadyMapped =
    mappedSeats.includes(seatId);

  setSelectedSeatId(
    alreadyMapped ? null : seatId
  );

  setMappedSeats((previous) => {

    if (alreadyMapped) {
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


const isSeatMapped = (seatId) => {
  return mappedSeats.includes(seatId);
};


  /* ==========================================================
     SAVE CALIBRATION
  ========================================================== */

     const saveCalibration = async () => {

  if (allSeats.length === 0) {
    setActionMessage(
      "No exam hall configuration found. Please complete Exam Setup first."
    );
    return;
  }

  if (mappedSeats.length === 0) {
    setActionMessage(
      "Please map at least one seat before saving calibration."
    );
    return;
  }

  try {
    setActionMessage("Saving calibration...");
    setIsSaved(false);

    // Convert P3 IDs: A-01 -> A01
    const backendSeatIds = mappedSeats.map(
      (seatId) => seatId.replace("-", "")
    );

    // Save camera -> zone -> seats
    const mappingResponse = await fetch(
      `${CALIBRATION_API}/api/calibration/mapping`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          camera_id: selectedCamera.camera_id,
          zone_id: selectedCamera.zone,
          seat_ids: backendSeatIds,
          bbox: [0, 0, 0, 0],
        }),
      }
    );

    if (!mappingResponse.ok) {
      const errorData = await mappingResponse.json();

      const message =
        errorData?.detail?.message ||
        "Unable to save calibration mapping.";

      throw new Error(message);
    }

    // Ask backend to validate the complete camera mapping
    const validationResponse = await fetch(
      `${CALIBRATION_API}/api/calibration/${encodeURIComponent(
        selectedCamera.camera_id
      )}/validate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rows: rows,
          columns: columnsPerRow,
          mapped_seats: backendSeatIds,
        }),
      }
    );

    if (!validationResponse.ok) {
      throw new Error(
        "Calibration validation failed."
      );
    }

    const validation =
      await validationResponse.json();

    if (validation.status !== "calibrated") {
      setActionMessage(
        `Calibration requires attention. Coverage: ${validation.coverage_percentage}%`
      );
      return;
    }

    setIsSaved(true);
    localStorage.setItem(
  "pehraCalibrationComplete",
  "true"
);

    setActionMessage(
      `Calibration saved for ${selectedCamera.camera_id}.`
    );

  } catch (error) {
    console.error(
      "Calibration save failed:",
      error
    );

    setIsSaved(false);

    setActionMessage(
      error.message ||
      "Unable to save calibration."
    );
  }
};
      


  /* ==========================================================
     RESET MAPPING
  ========================================================== */

  const resetCalibration = () => {

    setMappedSeats([]);

    setIsSaved(false);
    localStorage.removeItem(
  "pehraCalibrationComplete"
);

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


          {/* CAMERA FEED */}

          <div className="camera-mode-switch">

            <button
              type="button"
              className={
                cameraMode === "demo"
                  ? "active"
                  : ""
              }
             onClick={() => {
  detectionHistoryRef.current = [];
  setCameraMode("demo");
  setVideoError(false);
}}
            >
              Demo Video
            </button>

            <button
              type="button"
              className={
                cameraMode === "live"
                  ? "active"
                  : ""
              }
              onClick={() => {
  detectionHistoryRef.current = [];
  setCameraMode("live");
  setVideoError(false);
}}
            >
              Live Camera
            </button>

          </div>

          <div className="camera-preview">

  <div className="camera-overlay">
    <span>
      {cameraMode === "demo"
        ? "DEMO CAMERA VIEW"
        : "LIVE CAMERA VIEW"}
    </span>

    <span>
      {selectedCamera.zone}
    </span>
  </div>

  <div className="camera-stage">

    {/* REAL / DEMO CAMERA IMAGE */}
    <div className="camera-image-area">

      {cameraMode === "demo" ? (
        <img
          className="calibration-video"
          src="/calibration/classroom.jpg"
          alt="Classroom camera preview"
          onError={() =>
  setVideoError(true)
}

onLoad={(event) => {

  setVideoError(false);

  setDetectionImageSize({
    width:
      event.currentTarget.naturalWidth,

    height:
      event.currentTarget.naturalHeight,
  });

}}
        />
      ) : (
        <video
  ref={liveVideoRef}
  className="calibration-video"
  autoPlay
  muted
  playsInline
  onLoadedMetadata={(event) => {

    setDetectionImageSize({
      width:
        event.currentTarget.videoWidth,

      height:
        event.currentTarget.videoHeight,
    });

  }}
/>
      )}

      {videoError && cameraMode === "demo" && (
        <div className="live-camera-placeholder">
          Demo classroom image not found.
          <br />
          Add it to:
          frontend/public/calibration/classroom.jpg
        </div>
      )}

      {/* Detection boxes */}
      <div className="detection-overlay">

{detectedSeats.map(
  (seat, index) => {

   const imageWidth =
  detectionImageSize.width;

const imageHeight =
  detectionImageSize.height;

    const [
      x1,
      y1,
      x2,
      y2
    ] = seat.bbox;

    const left =
      (x1 / imageWidth) * 100;

    const top =
      (y1 / imageHeight) * 100;

    const width =
      ((x2 - x1) / imageWidth) * 100;

    const height =
      ((y2 - y1) / imageHeight) * 100;

  const logicalSeat =
  allSeats[index]?.seat_id ||
  seat.seat_id ||
  seat.label;

const isMapped =
  mappedSeats.includes(
    logicalSeat
  );
const isSelected =
  selectedSeatId === logicalSeat;

    return (
      <button
        key={`detected-${logicalSeat}`}
        type="button"
       className={`detected-seat-box ${
  isMapped
    ? "detected-mapped"
    : ""
} ${
  isSelected
    ? "detected-selected"
    : ""
}`}
        style={{
          left: `${left}%`,
          top: `${top}%`,
          width: `${width}%`,
          height: `${height}%`,
        }}
        onClick={() =>
          toggleSeat(logicalSeat)
        }
      >
        <span className="detected-seat-label">
          {logicalSeat}
        </span>
        <span className="detected-seat-center"></span>
      </button>
    );
  }
)}

      </div>

      <div className="camera-feed-label">
        <span className="camera-status-dot"></span>

        {cameraMode === "demo"
          ? "Demo Feed"
          : "Live Camera"}
      </div>

    </div>


    {/* 2D LOGICAL SEAT MAP */}
    <div className="mini-seat-map">

      <div className="mini-seat-map-title">
        Seat Structure
      </div>

      <div
        className="mini-seat-grid"
        style={{
          gridTemplateColumns:
            `repeat(${Math.max(
              columnsPerRow,
              1
            )}, 1fr)`,
        }}
      >

        {allSeats.map(
          (seat) => {

         const isMapped =
  isSeatMapped(
    seat.seat_id
  );

            return (
              <button
                key={seat.seat_id}
                className={
                  `mini-seat ${
                    isMapped
                      ? "mapped"
                      : ""
                  }`
                }
                onClick={() =>
                  toggleSeat(
                    seat.seat_id
                  )
                }
              >
                {seat.seat_id}
              </button>
            );
          }
        )}

      </div>

      <div className="mini-seat-map-help">
        Click a seat to map / unmap
      </div>

    </div>

  </div>

  <div className="camera-overlay-bottom">
    <span>
      {detectionLoading
        ? "Detecting seats..."
        : `${detectedSeatCount} seats detected`}
    </span>

    <button
      type="button"
      className="camera-detect-button"
      onClick={detectClassroomSeats}
      disabled={detectionLoading}
    >
      {detectionLoading
        ? "Detecting..."
        : "Detect Seats"}
    </button>
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
              IMAGE DETECTION
          ================================================== */}

          <div className="coverage-section">

            <div className="coverage-heading">

              <div>
                <span className="detail-label">
                  IMAGE DETECTION
                </span>

                <strong>
                  {detectionLoading
                    ? "Detecting..."
                    : `${detectedSeatCount} / ${expectedSeatCount}`}
                </strong>
              </div>

              <strong>
                {detectionCoverage}%
              </strong>

            </div>

            <div className="coverage-bar">
              <div
                style={{
                  width: `${detectionCoverage}%`,
                }}
              ></div>
            </div>

            <p>
              {detectionError
                ? detectionError
                : detectionCoverage === 100
                  ? "All expected seats were detected in the camera image."
                  : `${expectedSeatCount - detectedSeatCount} seats still need detection.`}
            </p>

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