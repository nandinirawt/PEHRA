const API = "http://127.0.0.1:8001";


// =====================================================
// DOM ELEMENTS
// =====================================================

const image =
  document.getElementById("classroomImage");

const cameraWrapper =
  document.getElementById("cameraWrapper");

const seatOverlay =
  document.getElementById("seatOverlay");

const clickMarker =
  document.getElementById("clickMarker");

const rowsInput =
  document.getElementById("rows");

const columnsInput =
  document.getElementById("columns");

const detectButton =
  document.getElementById("detectButton");

const apiStatus =
  document.getElementById("apiStatus");

const detectionCount =
  document.getElementById("detectionCount");

const emptyResult =
  document.getElementById("emptyResult");

const seatResult =
  document.getElementById("seatResult");

const seatLabel =
  document.getElementById("seatLabel");

const seatRow =
  document.getElementById("seatRow");

const seatColumn =
  document.getElementById("seatColumn");

const seatConfidence =
  document.getElementById("seatConfidence");

const seatDistance =
  document.getElementById("seatDistance");

const seatCoordinates =
  document.getElementById("seatCoordinates");

const expectedLayout =
  document.getElementById("expectedLayout");

const detectedLayout =
  document.getElementById("detectedLayout");

const validationStatus =
  document.getElementById("validationStatus");


// =====================================================
// SEAT GRID ELEMENTS
// =====================================================

const seatGrid =
  document.getElementById("seatGrid");

const calibrationCount =
  document.getElementById("calibrationCount");


// =====================================================
// STATE
// =====================================================

let detections = [];

let calibratedSeats = new Set();


// =====================================================
// API HEALTH
// =====================================================

async function checkApi() {

  try {

    const response =
      await fetch(`${API}/`);

    if (!response.ok) {
      throw new Error("API unavailable");
    }

    apiStatus.textContent =
      "API Connected";

    apiStatus.className =
      "status online";

  } catch (error) {

    console.error(error);

    apiStatus.textContent =
      "API Offline";

    apiStatus.className =
      "status offline";
  }
}


// =====================================================
// CREATE LOGICAL SEAT GRID
// =====================================================

function renderSeatGrid() {

  const rows =
    Number(rowsInput.value);

  const columns =
    Number(columnsInput.value);

  const totalSeats =
    rows * columns;

  seatGrid.innerHTML =
    "";

  seatGrid.style.gridTemplateColumns =
    `repeat(${columns}, minmax(70px, 1fr))`;

  calibratedSeats =
    new Set();

  for (
    let seatNumber = 1;
    seatNumber <= totalSeats;
    seatNumber++
  ) {

    const seat =
      document.createElement("div");

    seat.className =
      "logical-seat";

    seat.dataset.seatNumber =
      seatNumber;

    seat.innerHTML = `
      <span class="logical-seat-number">
        ${String(seatNumber).padStart(2, "0")}
      </span>

      <span class="logical-seat-status">
        Not calibrated
      </span>
    `;

    seatGrid.appendChild(
      seat
    );
  }

  updateCalibrationCount();
}


// =====================================================
// CALIBRATION COUNT
// =====================================================

function updateCalibrationCount() {

  const rows =
    Number(rowsInput.value);

  const columns =
    Number(columnsInput.value);

  const total =
    rows * columns;

  calibrationCount.textContent =
    `${calibratedSeats.size} / ${total} calibrated`;
}


// =====================================================
// GET LOGICAL SEAT NUMBER
// =====================================================

function getSeatNumber(
  row,
  column
) {

  const columns =
    Number(columnsInput.value);

  return (
    (row - 1) *
      columns +
    column
  );
}


// =====================================================
// MARK SEAT AS CALIBRATED
// =====================================================

function markSeatCalibrated(
  seatNumber
) {

  const seat =
    document.querySelector(
      `.logical-seat[data-seat-number="${seatNumber}"]`
    );

  if (!seat) {
    return;
  }

  seat.classList.remove(
    "detected"
  );

  seat.classList.add(
    "calibrated"
  );

  const status =
    seat.querySelector(
      ".logical-seat-status"
    );

  if (status) {

    status.textContent =
      "Calibrated";
  }

  calibratedSeats.add(
    Number(seatNumber)
  );

  updateCalibrationCount();
}


// =====================================================
// DETECT SEATS
// =====================================================

async function detectSeats() {

  try {

    detectButton.disabled =
      true;

    detectButton.textContent =
      "Detecting...";


    const imageBlob =
      await fetch(
        "../data/classroom.jpg"
      ).then(
        response => {

          if (!response.ok) {
            throw new Error(
              "Could not load classroom image"
            );
          }

          return response.blob();
        }
      );


    const formData =
      new FormData();

    formData.append(
      "file",
      imageBlob,
      "classroom.jpg"
    );


    const response =
      await fetch(
        `${API}/calibration/detect`,
        {
          method: "POST",
          body: formData
        }
      );


    if (!response.ok) {

      const errorText =
        await response.text();

      throw new Error(
        `Detection failed: ${response.status} ${errorText}`
      );
    }


    const result =
      await response.json();


    detections =
      result.seats || [];


    detectionCount.textContent =
      `${detections.length} detected`;


    drawDetections();

    updateValidation();

  } catch (error) {

    console.error(
      "Detection error:",
      error
    );

    alert(
      `Seat detection failed.\n\n${error.message}`
    );

  } finally {

    detectButton.disabled =
      false;

    detectButton.textContent =
      "Detect Seats";
  }
}


// =====================================================
// DRAW DETECTED SEATS
// =====================================================

function drawDetections() {
  seatOverlay.innerHTML = "";

  const naturalWidth = image.naturalWidth;
  const naturalHeight = image.naturalHeight;

  if (!naturalWidth || !naturalHeight) {
    return;
  }

  detections.forEach((seat) => {
    const [x1, y1, x2, y2] = seat.bbox;

    const left =
      (x1 / naturalWidth) * 100;

    const top =
      (y1 / naturalHeight) * 100;

    const width =
      ((x2 - x1) / naturalWidth) * 100;

    const height =
      ((y2 - y1) / naturalHeight) * 100;

    const box =
      document.createElement("div");

    box.className = "seat-box";

    box.style.left = `${left}%`;
    box.style.top = `${top}%`;
    box.style.width = `${width}%`;
    box.style.height = `${height}%`;

    box.dataset.seatId = seat.id;

    const label =
      document.createElement("span");

    label.className =
      "seat-box-label";

    label.textContent =
      seat.label ||
      `#${seat.id}`;

    box.appendChild(label);

    seatOverlay.appendChild(box);
  });
}

// =====================================================
// CLICK CAMERA / IMAGE
// =====================================================

cameraWrapper.addEventListener(
  "click",
  async (event) => {

    if (!detections.length) {

      alert(
        "Click Detect Seats first."
      );

      return;
    }


    const rect =
      image.getBoundingClientRect();


    const scaleX =
      image.naturalWidth /
      rect.width;


    const scaleY =
      image.naturalHeight /
      rect.height;


    const x =
      (
        event.clientX -
        rect.left
      ) *
      scaleX;


    const y =
      (
        event.clientY -
        rect.top
      ) *
      scaleY;


    // Show where the user clicked.
    clickMarker.style.left =
      `${event.clientX - rect.left}px`;


    clickMarker.style.top =
      `${event.clientY - rect.top}px`;


    clickMarker.classList.remove(
      "hidden"
    );


    try {

      const response =
        await fetch(
          `${API}/calibration/click`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                x,
                y
              })
          }
        );


      if (!response.ok) {

        const errorText =
          await response.text();

        throw new Error(
          `Click request failed: ${response.status} ${errorText}`
        );
      }


      const result =
        await response.json();


      if (!result.success) {

        alert(
          result.error ||
          "Seat could not be identified."
        );

        return;
      }


      showSelectedSeat(
        result
      );

    } catch (error) {

      console.error(
        "Click error:",
        error
      );

      alert(
        `Could not contact calibration backend.\n\n${error.message}`
      );
    }
  }
);


// =====================================================
// SHOW SELECTED SEAT
// =====================================================

function showSelectedSeat(
  result
) {

  const seat =
    result.seat;


  const seatNumber =
    getSeatNumber(
      seat.row,
      seat.column
    );


  // Show right-side details.
  emptyResult.classList.add(
    "hidden"
  );

  seatResult.classList.remove(
    "hidden"
  );


  seatLabel.textContent =
    `Seat ${String(
      seatNumber
    ).padStart(2, "0")}`;


  seatRow.textContent =
    seat.row;


  seatColumn.textContent =
    seat.column;


  seatConfidence.textContent =
    `${Math.round(
      seat.confidence * 100
    )}%`;


  seatDistance.textContent =
    `${result.distance.toFixed(
      1
    )} px`;


  seatCoordinates.textContent =
    `(${seat.x}, ${seat.y})`;


  // Mark logical seat in the grid.
  markSeatCalibrated(
    seatNumber
  );


  // Remove previous selected camera box.
  document
    .querySelectorAll(
      ".seat-box"
    )
    .forEach(
      box => {

        box.classList.remove(
          "selected"
        );
      }
    );


  // Highlight current camera detection.
  const selected =
    document.querySelector(
      `.seat-box[data-seat-id="${seat.detected_id}"]`
    );


  if (selected) {

    selected.classList.add(
      "selected"
    );
  }
}


// =====================================================
// UPDATE CALIBRATION STATUS
// =====================================================

function updateValidation() {

  const rows =
    Number(rowsInput.value);

  const columns =
    Number(columnsInput.value);


  expectedLayout.textContent =
    `${rows} × ${columns}`;


  const totalExpected =
    rows *
    columns;


  detectedLayout.textContent =
    detections.length
      ? `${detections.length} seats`
      : "—";


  if (
    detections.length ===
    totalExpected
  ) {

    validationStatus.textContent =
      "Count Match";

    validationStatus.style.color =
      "#28784e";

  } else if (
    detections.length
  ) {

    validationStatus.textContent =
      "Mismatch";

    validationStatus.style.color =
      "#a63b3b";

  } else {

    validationStatus.textContent =
      "Not checked";

    validationStatus.style.color =
      "#777";
  }
}


// =====================================================
// ROW / COLUMN CHANGES
// =====================================================

rowsInput.addEventListener(
  "input",
  () => {

    updateValidation();

    renderSeatGrid();
  }
);


columnsInput.addEventListener(
  "input",
  () => {

    updateValidation();

    renderSeatGrid();
  }
);


// =====================================================
// BUTTON
// =====================================================

detectButton.addEventListener(
  "click",
  detectSeats
);


// =====================================================
// INITIAL STATE
// =====================================================

checkApi();

updateValidation();

renderSeatGrid();