import { useEffect, useState } from "react";
import "./LiveMonitor.css";
import { patch } from "./api/client";
 
const CURRENT_USER_ROLE = "invigilator";
const API_BASE_URL = "http://localhost:8000";
const EXAM_ID = "EXAM-101";
const CHIEF_HALLS = [
  {
    hall_id: "HALL-A",
    name: "Hall A",
    rows: 12,
    columns_per_row: 6,
    total_seats: 72,
  },
  {
    hall_id: "HALL-B",
    name: "Hall B",
    rows: 10,
    columns_per_row: 6,
    total_seats: 60,
  },
  {
    hall_id: "HALL-C",
    name: "Hall C",
    rows: 8,
    columns_per_row: 6,
    total_seats: 48,
  },
];
/*
 * ============================================================
 * PEHRA - VERSION 1 MOCK DATA
 * ============================================================
 *
 * These objects follow the shared backend/frontend contract:
 *
 * EXAM
 * SEAT
 * POSE_DATA
 * BEHAVIOR_EVENT
 * RISK_STATE
 * CALIBRATION
 *
 * The hall/event presentation still uses local V1 mock data,
 * while review actions are persisted through the live backend API.
 * ============================================================
 */


/* ============================================================
   EXAM
   ============================================================ */

const exam = {
  exam_id: "EXAM-101",
  name: "Semester End Examination",
  subject: "Mathematics",
  hall_id: "HALL-A",
  date: "2026-08-18",
  start_time: "09:00",
  end_time: "12:00",
  total_seats: 72,
  status: "active",
};


/* ============================================================
   SEAT
   ============================================================ */

const defaultSeats = Array.from(
  { length: 72 },
  (_, index) => {

    const rowIndex = Math.floor(index / 6);
    const column = (index % 6) + 1;

    const row =
      String.fromCharCode(65 + rowIndex);

    return {
      seat_id: `${row}-${String(column).padStart(2, "0")}`,
      row,
      column,
      status: "normal",
    };

  }
);


/* ============================================================
   BEHAVIOR_EVENT
   ============================================================
 *
 * severity is used by the Version 1 UI as the contribution
 * shown beside each behaviour.
 * ============================================================ */

const behaviorEvents = [
  {
    event_id: "EVT-001",
    exam_id: exam.exam_id,
    seat_id: "A-05",
    event_type: "Head movement",
    severity: 12,
    confidence: 0.91,
    timestamp: "10:42:31",
    duration: 4,
  },

  {
    event_id: "EVT-002",
    exam_id: exam.exam_id,
    seat_id: "A-05",
    event_type: "Body orientation",
    severity: 16,
    confidence: 0.89,
    timestamp: "10:42:37",
    duration: 6,
  },

  {
    event_id: "EVT-003",
    exam_id: exam.exam_id,
    seat_id: "A-05",
    event_type: "Temporal pattern",
    severity: 20,
    confidence: 0.92,
    timestamp: "10:42:44",
    duration: 12,
  },

  {
    event_id: "EVT-004",
    exam_id: exam.exam_id,
    seat_id: "B-04",
    event_type: "Repeated head turns",
    severity: 18,
    confidence: 0.94,
    timestamp: "10:42:31",
    duration: 7,
  },

  {
    event_id: "EVT-005",
    exam_id: exam.exam_id,
    seat_id: "B-04",
    event_type: "Body orientation",
    severity: 20,
    confidence: 0.92,
    timestamp: "10:42:38",
    duration: 8,
  },

  {
    event_id: "EVT-006",
    exam_id: exam.exam_id,
    seat_id: "B-04",
    event_type: "Hand anomaly",
    severity: 8,
    confidence: 0.88,
    timestamp: "10:42:45",
    duration: 3,
  },

  {
    event_id: "EVT-007",
    exam_id: exam.exam_id,
    seat_id: "B-04",
    event_type: "Temporal pattern",
    severity: 24,
    confidence: 0.95,
    timestamp: "10:42:52",
    duration: 15,
  },

  {
    event_id: "EVT-008",
    exam_id: exam.exam_id,
    seat_id: "B-04",
    event_type: "Neighbor interaction",
    severity: 12,
    confidence: 0.86,
    timestamp: "10:43:02",
    duration: 5,
  },

  {
    event_id: "EVT-009",
    exam_id: exam.exam_id,
    seat_id: "C-06",
    event_type: "Body orientation",
    severity: 14,
    confidence: 0.91,
    timestamp: "10:43:10",
    duration: 6,
  },

  {
    event_id: "EVT-010",
    exam_id: exam.exam_id,
    seat_id: "C-06",
    event_type: "Head movement",
    severity: 10,
    confidence: 0.89,
    timestamp: "10:43:18",
    duration: 4,
  },

  {
    event_id: "EVT-011",
    exam_id: exam.exam_id,
    seat_id: "C-06",
    event_type: "Temporal pattern",
    severity: 20,
    confidence: 0.92,
    timestamp: "10:43:25",
    duration: 10,
  },

  {
    event_id: "EVT-012",
    exam_id: exam.exam_id,
    seat_id: "D-03",
    event_type: "Head turn",
    severity: 15,
    confidence: 0.90,
    timestamp: "10:43:32",
    duration: 5,
  },

  {
    event_id: "EVT-013",
    exam_id: exam.exam_id,
    seat_id: "D-03",
    event_type: "Body orientation",
    severity: 16,
    confidence: 0.91,
    timestamp: "10:43:38",
    duration: 7,
  },

  {
    event_id: "EVT-014",
    exam_id: exam.exam_id,
    seat_id: "D-03",
    event_type: "Temporal pattern",
    severity: 20,
    confidence: 0.93,
    timestamp: "10:43:47",
    duration: 11,
  },

  {
    event_id: "EVT-015",
    exam_id: exam.exam_id,
    seat_id: "E-02",
    event_type: "Head movement",
    severity: 12,
    confidence: 0.88,
    timestamp: "10:43:54",
    duration: 4,
  },

  {
    event_id: "EVT-016",
    exam_id: exam.exam_id,
    seat_id: "E-02",
    event_type: "Body orientation",
    severity: 14,
    confidence: 0.90,
    timestamp: "10:44:01",
    duration: 5,
  },

  {
    event_id: "EVT-017",
    exam_id: exam.exam_id,
    seat_id: "E-02",
    event_type: "Temporal pattern",
    severity: 20,
    confidence: 0.92,
    timestamp: "10:44:08",
    duration: 10,
  },

  {
    event_id: "EVT-018",
    exam_id: exam.exam_id,
    seat_id: "F-02",
    event_type: "Repeated head turns",
    severity: 20,
    confidence: 0.94,
    timestamp: "10:44:15",
    duration: 8,
  },

  {
    event_id: "EVT-019",
    exam_id: exam.exam_id,
    seat_id: "F-02",
    event_type: "Body orientation",
    severity: 18,
    confidence: 0.91,
    timestamp: "10:44:23",
    duration: 7,
  },

  {
    event_id: "EVT-020",
    exam_id: exam.exam_id,
    seat_id: "F-02",
    event_type: "Hand anomaly",
    severity: 12,
    confidence: 0.87,
    timestamp: "10:44:31",
    duration: 4,
  },

  {
    event_id: "EVT-021",
    exam_id: exam.exam_id,
    seat_id: "F-02",
    event_type: "Temporal pattern",
    severity: 26,
    confidence: 0.95,
    timestamp: "10:44:39",
    duration: 13,
  },

  {
    event_id: "EVT-022",
    exam_id: exam.exam_id,
    seat_id: "F-04",
    event_type: "Head movement",
    severity: 13,
    confidence: 0.90,
    timestamp: "10:44:47",
    duration: 5,
  },

  {
    event_id: "EVT-023",
    exam_id: exam.exam_id,
    seat_id: "F-04",
    event_type: "Body orientation",
    severity: 10,
    confidence: 0.88,
    timestamp: "10:44:54",
    duration: 4,
  },

  {
    event_id: "EVT-024",
    exam_id: exam.exam_id,
    seat_id: "F-04",
    event_type: "Temporal pattern",
    severity: 20,
    confidence: 0.91,
    timestamp: "10:45:02",
    duration: 9,
  },

  {
    event_id: "EVT-025",
    exam_id: exam.exam_id,
    seat_id: "G-06",
    event_type: "Head turn",
    severity: 15,
    confidence: 0.89,
    timestamp: "10:45:10",
    duration: 5,
  },

  {
    event_id: "EVT-026",
    exam_id: exam.exam_id,
    seat_id: "G-06",
    event_type: "Body orientation",
    severity: 14,
    confidence: 0.90,
    timestamp: "10:45:17",
    duration: 6,
  },

  {
    event_id: "EVT-027",
    exam_id: exam.exam_id,
    seat_id: "G-06",
    event_type: "Temporal pattern",
    severity: 20,
    confidence: 0.92,
    timestamp: "10:45:25",
    duration: 10,
  },

  {
    event_id: "EVT-028",
    exam_id: exam.exam_id,
    seat_id: "H-05",
    event_type: "Repeated head turns",
    severity: 18,
    confidence: 0.94,
    timestamp: "10:45:32",
    duration: 7,
  },

  {
    event_id: "EVT-029",
    exam_id: exam.exam_id,
    seat_id: "H-05",
    event_type: "Body orientation",
    severity: 17,
    confidence: 0.91,
    timestamp: "10:45:40",
    duration: 7,
  },

  {
    event_id: "EVT-030",
    exam_id: exam.exam_id,
    seat_id: "H-05",
    event_type: "Temporal pattern",
    severity: 24,
    confidence: 0.94,
    timestamp: "10:45:48",
    duration: 12,
  },

  {
    event_id: "EVT-031",
    exam_id: exam.exam_id,
    seat_id: "H-05",
    event_type: "Neighbor interaction",
    severity: 12,
    confidence: 0.86,
    timestamp: "10:45:56",
    duration: 5,
  },

  {
    event_id: "EVT-032",
    exam_id: exam.exam_id,
    seat_id: "I-02",
    event_type: "Head movement",
    severity: 12,
    confidence: 0.89,
    timestamp: "10:46:03",
    duration: 4,
  },

  {
    event_id: "EVT-033",
    exam_id: exam.exam_id,
    seat_id: "I-02",
    event_type: "Body orientation",
    severity: 13,
    confidence: 0.90,
    timestamp: "10:46:10",
    duration: 5,
  },

  {
    event_id: "EVT-034",
    exam_id: exam.exam_id,
    seat_id: "I-02",
    event_type: "Temporal pattern",
    severity: 20,
    confidence: 0.92,
    timestamp: "10:46:18",
    duration: 10,
  },

  {
    event_id: "EVT-035",
    exam_id: exam.exam_id,
    seat_id: "J-02",
    event_type: "Repeated head turns",
    severity: 17,
    confidence: 0.93,
    timestamp: "10:46:25",
    duration: 7,
  },

  {
    event_id: "EVT-036",
    exam_id: exam.exam_id,
    seat_id: "J-02",
    event_type: "Body orientation",
    severity: 16,
    confidence: 0.91,
    timestamp: "10:46:33",
    duration: 7,
  },

  {
    event_id: "EVT-037",
    exam_id: exam.exam_id,
    seat_id: "J-02",
    event_type: "Hand anomaly",
    severity: 10,
    confidence: 0.87,
    timestamp: "10:46:41",
    duration: 4,
  },

  {
    event_id: "EVT-038",
    exam_id: exam.exam_id,
    seat_id: "J-02",
    event_type: "Temporal pattern",
    severity: 26,
    confidence: 0.95,
    timestamp: "10:46:49",
    duration: 13,
  },

  {
    event_id: "EVT-039",
    exam_id: exam.exam_id,
    seat_id: "J-05",
    event_type: "Head movement",
    severity: 12,
    confidence: 0.89,
    timestamp: "10:46:57",
    duration: 4,
  },

  {
    event_id: "EVT-040",
    exam_id: exam.exam_id,
    seat_id: "J-05",
    event_type: "Body orientation",
    severity: 10,
    confidence: 0.88,
    timestamp: "10:47:04",
    duration: 4,
  },

  {
    event_id: "EVT-041",
    exam_id: exam.exam_id,
    seat_id: "J-05",
    event_type: "Temporal pattern",
    severity: 20,
    confidence: 0.91,
    timestamp: "10:47:11",
    duration: 9,
  },

  {
    event_id: "EVT-042",
    exam_id: exam.exam_id,
    seat_id: "K-04",
    event_type: "Head turn",
    severity: 13,
    confidence: 0.89,
    timestamp: "10:47:18",
    duration: 5,
  },

  {
    event_id: "EVT-043",
    exam_id: exam.exam_id,
    seat_id: "K-04",
    event_type: "Body orientation",
    severity: 14,
    confidence: 0.90,
    timestamp: "10:47:25",
    duration: 6,
  },

  {
    event_id: "EVT-044",
    exam_id: exam.exam_id,
    seat_id: "K-04",
    event_type: "Temporal pattern",
    severity: 20,
    confidence: 0.92,
    timestamp: "10:47:33",
    duration: 10,
  },

  {
    event_id: "EVT-045",
    exam_id: exam.exam_id,
    seat_id: "L-01",
    event_type: "Head movement",
    severity: 15,
    confidence: 0.90,
    timestamp: "10:47:41",
    duration: 5,
  },

  {
    event_id: "EVT-046",
    exam_id: exam.exam_id,
    seat_id: "L-01",
    event_type: "Body orientation",
    severity: 15,
    confidence: 0.90,
    timestamp: "10:47:48",
    duration: 6,
  },

  {
    event_id: "EVT-047",
    exam_id: exam.exam_id,
    seat_id: "L-01",
    event_type: "Temporal pattern",
    severity: 20,
    confidence: 0.92,
    timestamp: "10:47:56",
    duration: 10,
  },

  {
    event_id: "EVT-048",
    exam_id: exam.exam_id,
    seat_id: "L-05",
    event_type: "Repeated head turns",
    severity: 18,
    confidence: 0.94,
    timestamp: "10:48:03",
    duration: 7,
  },

  {
    event_id: "EVT-049",
    exam_id: exam.exam_id,
    seat_id: "L-05",
    event_type: "Body orientation",
    severity: 20,
    confidence: 0.92,
    timestamp: "10:48:11",
    duration: 8,
  },

  {
    event_id: "EVT-050",
    exam_id: exam.exam_id,
    seat_id: "L-05",
    event_type: "Hand anomaly",
    severity: 10,
    confidence: 0.87,
    timestamp: "10:48:19",
    duration: 4,
  },

  {
    event_id: "EVT-051",
    exam_id: exam.exam_id,
    seat_id: "L-05",
    event_type: "Temporal pattern",
    severity: 26,
    confidence: 0.95,
    timestamp: "10:48:27",
    duration: 13,
  },
];


/* ============================================================
   RISK_STATE
   ============================================================ */

const riskStates = [
  {
    seat_id: "A-05",
    risk_score: 48,
    confidence: 0.91,
    status: "under_review",
    updated_at: "10:42:44",
  },

  {
    seat_id: "B-04",
    risk_score: 82,
    confidence: 0.91,
    status: "high_risk",
    updated_at: "10:43:02",
  },

  {
    seat_id: "C-06",
    risk_score: 44,
    confidence: 0.91,
    status: "under_review",
    updated_at: "10:43:25",
  },

  {
    seat_id: "D-03",
    risk_score: 51,
    confidence: 0.91,
    status: "under_review",
    updated_at: "10:43:47",
  },

  {
    seat_id: "E-02",
    risk_score: 46,
    confidence: 0.91,
    status: "under_review",
    updated_at: "10:44:08",
  },

  {
    seat_id: "F-02",
    risk_score: 76,
    confidence: 0.91,
    status: "high_risk",
    updated_at: "10:44:39",
  },

  {
    seat_id: "F-04",
    risk_score: 43,
    confidence: 0.91,
    status: "under_review",
    updated_at: "10:45:02",
  },

  {
    seat_id: "G-06",
    risk_score: 49,
    confidence: 0.91,
    status: "under_review",
    updated_at: "10:45:25",
  },

  {
    seat_id: "H-05",
    risk_score: 71,
    confidence: 0.91,
    status: "high_risk",
    updated_at: "10:45:56",
  },

  {
    seat_id: "I-02",
    risk_score: 45,
    confidence: 0.91,
    status: "under_review",
    updated_at: "10:46:18",
  },

  {
    seat_id: "J-02",
    risk_score: 69,
    confidence: 0.91,
    status: "high_risk",
    updated_at: "10:46:49",
  },

  {
    seat_id: "J-05",
    risk_score: 42,
    confidence: 0.91,
    status: "under_review",
    updated_at: "10:47:11",
  },

  {
    seat_id: "K-04",
    risk_score: 47,
    confidence: 0.91,
    status: "under_review",
    updated_at: "10:47:33",
  },

  {
    seat_id: "L-01",
    risk_score: 50,
    confidence: 0.91,
    status: "under_review",
    updated_at: "10:47:56",
  },

  {
    seat_id: "L-05",
    risk_score: 74,
    confidence: 0.91,
    status: "high_risk",
    updated_at: "10:48:27",
  },
];


/* ============================================================
   POSE_DATA
   ============================================================ */

const poseData = [
  {
    seat_id: "B-04",
    timestamp: "10:43:02",
    presence: true,
    confidence: 0.91,
    pose_features: {
      head_turn: true,
      body_orientation: true,
      hand_anomaly: true,
    },
  },

  {
    seat_id: "D-03",
    timestamp: "10:43:47",
    presence: true,
    confidence: 0.91,
    pose_features: {
      head_turn: true,
      body_orientation: true,
      hand_anomaly: false,
    },
  },

  {
    seat_id: "F-02",
    timestamp: "10:44:39",
    presence: true,
    confidence: 0.91,
    pose_features: {
      head_turn: true,
      body_orientation: true,
      hand_anomaly: true,
    },
  },
];


/* ============================================================
   CALIBRATION
   ============================================================ */

/* ============================================================
   HELPER FUNCTIONS
   ============================================================ */
const getRiskState = (
  seatId,
  overrides = {},
  backendStates = []
) => {
  if (overrides[seatId]?.status) {
    return {
      seat_id: seatId,
      risk_score: overrides[seatId].risk_score ?? 8,
      confidence: overrides[seatId].confidence ?? 0.91,
      status: overrides[seatId].status,
      updated_at: new Date().toISOString(),
    };
  }
  const backendState = backendStates.find(
  (item) => item.seat_id === seatId
);

if (backendState) {
  return backendState;
}

  const state = riskStates.find(
    (item) => item.seat_id === seatId
  );

  if (state) {
    return state;
  }

  return {
    seat_id: seatId,
    risk_score: 8,
    confidence: 0.91,
    status: "normal",
    updated_at: new Date().toISOString(),
  };
};


/*
 * Converts backend status names into the CSS class names
 * already used by our existing LiveMonitor.css.
 *
 * Backend:
 * normal
 * under_review
 * high_risk
 * absent
 *
 * UI:
 * normal
 * review
 * high
 * absent
 */

const getUiStatus = (status) => {
  switch (status) {
    case "under_review":
      return "review";

    case "high_risk":
      return "high";

    case "absent":
      return "absent";

    default:
      return "normal";
  }
};


const getSeatStatus = (
  seatId,
  overrides = {},
  backendStates = []
) => {
  const riskState = getRiskState(
    seatId,
    overrides,
    backendStates
  );

  return getUiStatus(riskState.status);
};


const getSeatEvents = (seatId) => {
  return behaviorEvents.filter(
    (event) => event.seat_id === seatId
  );
};


/* ============================================================
   MAIN COMPONENT
   ============================================================ */

function LiveMonitor() {
  const isChiefInvigilator =
    CURRENT_USER_ROLE === "chief";

  const isInvigilator =
    CURRENT_USER_ROLE === "invigilator";
    const [activeHallId, setActiveHallId] =
  useState("HALL-A");

const activeChiefHall =
  CHIEF_HALLS.find(
    (hall) => hall.hall_id === activeHallId
  ) || CHIEF_HALLS[0];
  const [hallConfig, setHallConfig] = useState(() => {

    try {

      const saved =
        localStorage.getItem(
          "pehraHallConfig"
        );

      if (saved) {
        return JSON.parse(saved);
      }

    } catch (error) {

      console.error(
        "Unable to load PEHRA hall configuration:",
        error
      );

    }

    return {
      total_seats: 72,
      columns_per_row: 6,
      rows: 12,
      seats: defaultSeats,
    };

  });


  const seats = hallConfig.seats || defaultSeats;


  const calibration = {
    camera_id: "CAM-HALL-A-01",
    zone: "Hall A",
    seat_ids: seats.map((seat) => seat.seat_id),
    coverage: seats.length > 0 ? 100 : 0,
    status: "ready",
  };


  const [selectedSeat, setSelectedSeat] =
    useState(
      seats[0]?.seat_id || "A-01"
    );
    useEffect(() => {

  const loadHallConfiguration = () => {

    try {

      const saved =
        localStorage.getItem(
          "pehraHallConfig"
        );

      if (saved) {

        const parsed =
          JSON.parse(saved);

        setHallConfig(parsed);

      }

    } catch (error) {

      console.error(
        "Unable to reload PEHRA hall configuration:",
        error
      );

    }

  };


  window.addEventListener(
    "storage",
    loadHallConfiguration
  );


  return () => {

    window.removeEventListener(
      "storage",
      loadHallConfiguration
    );

  };

}, []);
useEffect(() => {

  const seatExists = seats.some(
    (seat) => seat.seat_id === selectedSeat
  );

  if (!seatExists && seats.length > 0) {

    setSelectedSeat(
      seats[0].seat_id
    );

  }

}, [hallConfig]);

  /*
   * Local invigilator changes.
   * These are temporary frontend actions for Version 1.
   */
  const [seatOverrides, setSeatOverrides] = useState({});
  const [backendRiskStates, setBackendRiskStates] = useState([]);
  const [actionMessage, setActionMessage] = useState("");
  const [ledgerTx, setLedgerTx] = useState(null);
  const [ledgerEventId, setLedgerEventId] = useState(null);
  const [integrityVerification, setIntegrityVerification] = useState(null);
const [verificationLoading, setVerificationLoading] = useState(false);
const [verificationError, setVerificationError] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
/* ==========================================================
   V2 — LOAD BACKEND RISK STATES
   ========================================================== */

useEffect(() => {

  const loadBackendRiskStates = async () => {
    try {

      /* ------------------------------------------------------
         STEP 1:
         Get the current backend seat states.
         This tells us which seats actually have risk.
         ------------------------------------------------------ */

      const seatsResponse = await fetch(
        `${API_BASE_URL}/api/exams/${EXAM_ID}/seats`
      );

      if (!seatsResponse.ok) {
        console.warn(
          `Seat API returned ${seatsResponse.status}`
        );

        setBackendRiskStates([]);
        return;
      }

      const backendSeats = await seatsResponse.json();

      console.log(
        "PEHRA backend seats:",
        backendSeats
      );


      /* ------------------------------------------------------
         STEP 2:
         Only request detailed risk information for seats
         that are already flagged by the backend.
         ------------------------------------------------------ */

      const flaggedBackendSeats = backendSeats.filter(
        (seat) => {

          const status = String(
            seat.status || ""
          ).toLowerCase();

          return (
            status === "high_risk" ||
            status === "under_review" ||
            status === "high-risk" ||
            status === "under-review"
          );
        }
      );


      /* ------------------------------------------------------
         STEP 3:
         Fetch detailed risk information only for flagged seats.
         Normal seats will never generate a 404 request.
         ------------------------------------------------------ */

      const results = [];

      for (const seat of flaggedBackendSeats) {

        try {

          const response = await fetch(
            `${API_BASE_URL}/api/exams/${EXAM_ID}/risk/${seat.seat_id}`
          );

          if (!response.ok) {

            console.warn(
              `Risk API returned ${response.status} for ${seat.seat_id}`
            );

            continue;
          }

          const risk = await response.json();

          results.push(risk);

        } catch (error) {

          console.warn(
            `Unable to load risk for ${seat.seat_id}:`,
            error
          );

        }
      }


      /* ------------------------------------------------------
         STEP 4:
         Store backend risk states.
         ------------------------------------------------------ */

      console.log(
        "PEHRA backend risk states:",
        results
      );

      setBackendRiskStates(results);

    } catch (error) {

      console.error(
        "Unable to load backend risk states:",
        error
      );

      setBackendRiskStates([]);
    }
  };


  loadBackendRiskStates();

}, []);
  /* ==========================================================
     ACTION HANDLER
     ========================================================== */

  const handleSeatAction = async (action) => {
    if (!selectedSeat || reviewLoading) {
      return;
    }

    const actionMap = {
      confirmed: "confirm_incident",
      normal: "false_alarm",
      review: "keep_under_review",
    };

    const backendAction = actionMap[action];

    if (!backendAction) {
      return;
    }

    const latestEvent =
      selectedEvents[selectedEvents.length - 1];

    setReviewLoading(true);
    setReviewError("");
    setActionMessage("");

    try {
      const response = await patch(
        `/api/exams/${EXAM_ID}/reviews/${encodeURIComponent(selectedSeat)}`,
        {
          action: backendAction,
          event_id: latestEvent?.event_id ?? null,
          notes: `Reviewed from Live Monitor for seat ${selectedSeat}.`,
        }
      );

      const newStatus =
        response?.seat_status ||
        (backendAction === "confirm_incident"
          ? "high_risk"
          : backendAction === "false_alarm"
          ? "normal"
          : "under_review");

      const currentRisk = getRiskState(
        selectedSeat,
        seatOverrides,
        backendRiskStates
      );

      setSeatOverrides((previous) => ({
        ...previous,
        [selectedSeat]: {
          status: newStatus,
          risk_score: response?.risk_score ?? currentRisk.risk_score,
          confidence: response?.confidence ?? currentRisk.confidence,
        },
      }));

      // confirm_incident returns the ledger transaction metadata.
      if (backendAction === "confirm_incident") {
        setLedgerTx(response?.ledger_tx ?? null);
        setLedgerEventId(response?.event_id ?? latestEvent?.event_id ?? null);
        setIntegrityVerification(null);
        setVerificationError("");
      } else {
        setLedgerTx(null);
        setLedgerEventId(null);
        setIntegrityVerification(null);
      }

      if (backendAction === "confirm_incident") {
        setActionMessage(
          `Incident confirmed for seat ${selectedSeat}.`
        );
      } else if (backendAction === "false_alarm") {
        setActionMessage(
          `Seat ${selectedSeat} marked as a false alarm.`
        );
      } else {
        setActionMessage(
          `Seat ${selectedSeat} kept under review.`
        );
      }
    } catch (error) {
      console.error("Unable to submit review action:", error);
      setReviewError(
        error?.message ||
          "Unable to submit the review action. Please try again."
      );
    } finally {
      setReviewLoading(false);
    }
  };


  /* ==========================================================
     TRUST & INTEGRITY — VERIFY ANCHORED RECORD
     ========================================================== */
  const verifyIntegrity = async () => {
    if (!ledgerEventId || verificationLoading) return;

    setVerificationLoading(true);
    setVerificationError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/ledger/verify/${encodeURIComponent(ledgerEventId)}`
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload?.detail || `Integrity verification failed (${response.status}).`
        );
      }

      setIntegrityVerification(payload);
    } catch (error) {
      console.error("Unable to verify ledger integrity:", error);
      setIntegrityVerification(null);
      setVerificationError(
        error?.message || "Unable to verify the anchored integrity record."
      );
    } finally {
      setVerificationLoading(false);
    }
  };


  /* ==========================================================
     V2 — REVIEW ACTION WEBSOCKET
     ========================================================== */
  useEffect(() => {
    let socket;

    try {
      const wsBase = API_BASE_URL.replace(/^http/, "ws");
      socket = new WebSocket(
        `${wsBase}/ws/exams/${EXAM_ID}`
      );

      socket.onmessage = (message) => {
        try {
          const payload = JSON.parse(message.data);

          if (payload?.type !== "REVIEW_ACTION") {
            return;
          }

          const seatId = payload.seat_id;
          if (!seatId) {
            return;
          }

          const newStatus = payload.new_status ||
            (payload.action === "confirm_incident"
              ? "high_risk"
              : payload.action === "false_alarm"
              ? "normal"
              : "under_review");

          setSeatOverrides((previous) => ({
            ...previous,
            [seatId]: {
              ...(previous[seatId] || {}),
              status: newStatus,
            },
          }));

          if (payload.ledger_tx && seatId === selectedSeat) {
            setLedgerTx(payload.ledger_tx);
            setLedgerEventId(payload.event_id || null);
            setIntegrityVerification(null);
            setVerificationError("");
          }
        } catch (error) {
          console.warn("Invalid PEHRA WebSocket message:", error);
        }
      };
    } catch (error) {
      console.warn("Unable to connect to PEHRA review WebSocket:", error);
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [selectedSeat]);


  /* ==========================================================
     SELECTED SEAT DATA
     ========================================================== */
const selectedRiskState = getRiskState(
  selectedSeat,
  seatOverrides,
  backendRiskStates
);

  const selectedStatus = getUiStatus(
    selectedRiskState.status
  );

  const selectedEvents = getSeatEvents(selectedSeat);


  /* ==========================================================
     FLAGGED SEATS
     ========================================================== */

  const activeFlaggedSeatIds = Array.from(
  new Set([
    ...riskStates.map(
      (risk) => risk.seat_id
    ),

    ...backendRiskStates.map(
      (risk) => risk.seat_id
    ),
  ])
).filter((seatId) => {

  const state = getRiskState(
    seatId,
    seatOverrides,
    backendRiskStates
  );

  return (
    state.status === "under_review" ||
    state.status === "high_risk"
  );

});


  /* ==========================================================
     COUNTS
     ========================================================== */

  const highRiskCount = seats.filter((seat) => {
    const state = getRiskState(
  seat.seat_id,
  seatOverrides,
  backendRiskStates
);

    return state.status === "high_risk";
  }).length;


  const reviewCount = seats.filter((seat) => {
    const state = getRiskState(
      seat.seat_id,
      seatOverrides,
      backendRiskStates
    );

    return state.status === "under_review";
  }).length;


  const absentCount = seats.filter((seat) => {
    const state = getRiskState(
      seat.seat_id,
      seatOverrides,
      backendRiskStates
    );

    return state.status === "absent";
  }).length;


  const normalCount =
  seats.length -
  highRiskCount -
  reviewCount -
  absentCount;


  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <main className="live-monitor-page">


{/* ======================================================
    HEADER — STEP 1 UI
    ====================================================== */}

<section className="live-header live-header-v2">
{isChiefInvigilator && (
  <div className="chief-hall-switcher">

    <div className="chief-hall-switcher-header">

      <div>
        <span className="eyebrow small">
          CHIEF OVERSIGHT
        </span>

        <h3>
          Examination Halls
        </h3>
      </div>

      <span className="chief-hall-count">
        {CHIEF_HALLS.length} Halls
      </span>

    </div>


    <div className="chief-hall-list">

      {CHIEF_HALLS.map((hall) => (

        <button
          key={hall.hall_id}
          type="button"
          className={
            activeHallId === hall.hall_id
              ? "chief-hall-item active"
              : "chief-hall-item"
          }
          onClick={() => {
            setActiveHallId(hall.hall_id);

            setSelectedSeat(
              `${String.fromCharCode(65 + hall.rows - 1)}-01`
            );
          }}
        >

          <span className="chief-hall-status"></span>

          <span className="chief-hall-info">

            <strong>
              {hall.name}
            </strong>

            <span>
              {hall.total_seats} seats
            </span>

          </span>

          {activeHallId === hall.hall_id && (
            <span className="chief-hall-active">
              ACTIVE
            </span>
          )}

        </button>

      ))}

    </div>

  </div>
)}
  {/* LEFT — EXAM INFORMATION */}
  <div className="live-header-main">

    <div className="live-header-eyebrow-row">
      <span className="eyebrow">
        LIVE EXAMINATION
      </span>

      <span className="live-status-badge">
  <span className="live-status-dot"></span>
  EXAM LIVE
</span>

<span className="live-role-badge">
  {isChiefInvigilator
    ? "CHIEF INVIGILATOR"
    : "INVIGILATOR"}
</span>
    </div>

    <h1>
      {exam.name} — {exam.subject}
    </h1>

    <div className="exam-meta">

      <span>
        {isChiefInvigilator
  ? activeChiefHall.hall_id
  : exam.hall_id || "HALL-A"}
      </span>

      <span>•</span>

      <span>
        {isChiefInvigilator
  ? activeChiefHall.total_seats
  : seats.length} Seats
      </span>

      <span>•</span>

      <span>
        {exam.start_time} — {exam.end_time}
      </span>

    </div>
   <div className="monitoring-scope">

  <div className="monitoring-scope-label">
    MONITORING SCOPE
  </div>

  <div className="monitoring-scope-content">

    <span className="monitoring-scope-dot"></span>

    <div>
      <strong>
        {exam.hall_id || "HALL-A"}
      </strong>

      <span>
        Current examination hall
      </span>
    </div>

  </div>

</div>
  </div>


  {/* RIGHT — MONITORING STATUS */}
  <div className="live-header-status">

    <div className="monitoring-label">
      MONITORING STATUS
    </div>

    <div className="monitoring-value">
      <span className="monitoring-dot"></span>
      Active
    </div>

    <div className="monitoring-subtext">
      Processing locally · No identity data captured
    </div>

  </div>

</section>


{/* ======================================================
    LIVE SUMMARY — STEP 1
    ====================================================== */}

<section className="live-summary-grid">

  {/* TOTAL SEATS */}
  <div className="live-summary-card">

    <div className="summary-label">
      TOTAL SEATS
    </div>

    <div className="summary-value">
      {seats.length}
    </div>

    <div className="summary-description">
      Configured for this hall
    </div>

  </div>


  {/* NORMAL */}
  <div className="live-summary-card">

    <div className="summary-label">
      NORMAL
    </div>

    <div className="summary-value">
      {normalCount}
    </div>

    <div className="summary-description">
      No active concern
    </div>

  </div>


  {/* UNDER REVIEW */}
  <div className="live-summary-card summary-warning">

    <div className="summary-label">
      UNDER REVIEW
    </div>

    <div className="summary-value">
      {reviewCount}
    </div>

    <div className="summary-description">
      Requires attention
    </div>

  </div>


  {/* HIGH RISK */}
  <div className="live-summary-card summary-danger">

    <div className="summary-label">
      HIGH RISK
    </div>

    <div className="summary-value">
      {highRiskCount}
    </div>

    <div className="summary-description">
      Immediate review
    </div>

  </div>

</section>
```



      {/* ======================================================
          QUICK SUMMARY
          ====================================================== */}

      

      {/* ======================================================
          MAIN TWO-COLUMN AREA
          ====================================================== */}

      <section className="monitor-layout">


        {/* ====================================================
            LEFT — EXAMINATION HALL
            ==================================================== */}

        <div className="hall-panel">


          <div className="panel-header">

            <div>

              <h2>
                Examination Hall
              </h2>

              <p>
                {isChiefInvigilator
  ? `${activeChiefHall.name} · Current seating status`
  : `${exam.hall_id || "HALL-A"} · Current seating status`}
              </p>

            </div>


            <div className="legend">

              <span>

                <i className="legend-dot normal"></i>

                Normal

              </span>


              <span>

                <i className="legend-dot review"></i>

                Under Review

              </span>


              <span>

                <i className="legend-dot high"></i>

                High Risk

              </span>

            </div>

          </div>


          <div className="hall-content">




{/* ============================================================
    DYNAMIC EXAMINATION HALL SEAT MAP
    ============================================================ */}

<div className="seat-map-wrapper">

  <div className="seat-map-label">
    <span>SEATING MAP</span>
    <span>
      {hallConfig.rows} rows × {hallConfig.columns_per_row} columns
    </span>
  </div>


  <div className="seat-map-stage">

    {/* INVIGILATOR DESK */}
    <div className="invigilator-desk">
      <span className="desk-icon">▣</span>
      INVIGILATOR DESK
    </div>


    {/* COLUMN NUMBERS */}
    <div className="seat-column-header">

      <span className="row-label-spacer"></span>

      {Array.from(
        { length: hallConfig.columns_per_row },
        (_, columnIndex) => (
          <span
            className="column-number"
            key={`column-${columnIndex + 1}`}
          >
            {String(columnIndex + 1).padStart(2, "0")}
          </span>
        )
      )}

    </div>


    {/* DYNAMIC ROWS */}
    <div className="dynamic-seat-grid">

      {Array.from(
        { length: hallConfig.rows },
        (_, rowIndex) => {

          const row =
            String.fromCharCode(65 + rowIndex);

          const rowSeats =
            seats.filter(
              (seat) => seat.row === row
            );

          return (

            <div
              className="dynamic-seat-row"
              key={row}
            >

              {/* ROW LABEL */}
              <span className="seat-row-label">
                {row}
              </span>


              {/* SEATS */}
              {Array.from(
                {
                  length: hallConfig.columns_per_row,
                },
                (_, columnIndex) => {

                  const column =
                    columnIndex + 1;

                  const seat =
                    rowSeats.find(
                      (item) =>
                        Number(item.column) === column
                    );


                  /*
                   * If a seat does not exist in the
                   * backend/configuration, render an
                   * empty position instead of inventing
                   * a seat.
                   */

                  if (!seat) {

                    return (
                      <div
                        className="seat-placeholder"
                        key={`${row}-${column}`}
                      />
                    );

                  }


                  const seatId =
                    seat.seat_id;

                  const status =
                    getSeatStatus(
                      seatId,
                      seatOverrides,
                      backendRiskStates
                    );


                  const isSelected =
                    selectedSeat === seatId;


                  return (

                    <button
                      type="button"
                      key={seatId}
                      className={[
                        "dynamic-seat",
                        `seat-${status}`,
                        isSelected
                          ? "seat-selected"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => {
                        setSelectedSeat(seatId);
                        setLedgerTx(null);
                        setLedgerEventId(null);
                        setIntegrityVerification(null);
                        setVerificationError("");
                        setActionMessage("");
                      }}
                      aria-label={`Seat ${seatId}, status ${status}`}
                    >

                      <span className="seat-status-dot"></span>

                      <span className="seat-id">
                        {seatId}
                      </span>

                    </button>

                  );

                }
              )}

            </div>

          );

        }
      )}

    </div>

  </div>


  {/* MAP FOOTER */}
  <div className="seat-map-footer">

    <div>
      <strong>{seats.length}</strong>
      <span> seats configured</span>
    </div>

    <div>
      <span>Click a seat to inspect risk state</span>
    </div>

  </div>

</div>




            <div className="hall-footer">

  <span>
    {hallConfig.columns_per_row} columns
  </span>

  <span>
    {hallConfig.rows} rows
  </span>

  <span>
    {hallConfig.total_seats} seats
  </span>

</div>


          </div>

        </div>


        {/* ====================================================
            RIGHT — DETAILS
            ==================================================== */}

        <div className="details-panel">


          {/* ==================================================
              FLAGGED SEATS
              ================================================== */}

          <div className="flagged-section">


            <div className="section-title">

              <div>

                <h2>
                  Flagged Seats
                </h2>

                <p>
                  Seats requiring attention
                </p>

              </div>


              <span className="flagged-count">

                {activeFlaggedSeatIds.length}

              </span>

            </div>


            <div className="flagged-list">

              {activeFlaggedSeatIds
                .slice(0, 6)
                .map((seatId) => {

                  const risk =
                    getRiskState(
                      seatId,
                      seatOverrides,
                      backendRiskStates
                    );


                  const status =
                    getUiStatus(
                      risk.status
                    );


                  return (

                    <button
                      key={seatId}

                      className={`flagged-seat ${
                        selectedSeat === seatId
                          ? "active"
                          : ""
                      }`}

                      onClick={() => {

                        setSelectedSeat(seatId);
                        setLedgerTx(null);
                        setLedgerEventId(null);
                        setIntegrityVerification(null);
                        setVerificationError("");
                        setActionMessage("");

                      }}

                    >

                      <span
                        className={`flagged-dot ${status}`}
                      ></span>


                      <span className="flagged-seat-id">
                        {seatId}
                      </span>


                      <span
                        className={`risk-label ${status}`}
                      >

                        {risk.status === "high_risk"
                          ? "High Risk"
                          : "Review"}

                      </span>


                      <span className="arrow">
                        →
                      </span>

                    </button>

                  );

                })}

            </div>

          </div>


          {/* ==================================================
              SELECTED SEAT DETAILS
              ================================================== */}

          <div className="selected-details">


            {/* =================================================
                SELECTED SEAT HEADER
                ================================================= */}

            <div className="selected-heading">

              <div>

                <span className="eyebrow small">
                  SELECTED SEAT
                </span>

                <h2>
                  {selectedSeat}
                </h2>

              </div>


              <span
                className={`risk-badge ${selectedStatus}`}
              >

                {selectedRiskState.status ===
                "high_risk"
                  ? "High Risk"
                  : selectedRiskState.status ===
                    "under_review"
                  ? "Under Review"
                  : selectedRiskState.status ===
                    "absent"
                  ? "Absent"
                  : "Normal"}

              </span>

            </div>


            {/* =================================================
                RISK SCORE
                ================================================= */}

            <div className="risk-score-row">

              <div>

                <span className="detail-label">
                  RISK SCORE
                </span>


                <div className="score">

                  {selectedRiskState.risk_score}

                  <small>
                    /100
                  </small>

                </div>

              </div>


              <div className="confidence">

                Confidence{" "}

                <strong>
                  {Math.round(
                    selectedRiskState.confidence * 100
                  )}
                  %
                </strong>

              </div>

            </div>


            <div className="score-bar">

              <div
                style={{
                  width: `${selectedRiskState.risk_score}%`,
                }}
              ></div>

            </div>


            {/* =================================================
                STUDENT INFORMATION
                ================================================= */}

            <div className="student-info">


              <div>

                <span>
                  Identity
                </span>

                <strong>
                  Anonymous Student
                </strong>

              </div>


              <div>

                <span>
                  Seat ID
                </span>

                <strong>
                  {selectedSeat}
                </strong>

              </div>


              <div>

                <span>
                  Face Recognition
                </span>

                <strong>
                  Disabled
                </strong>

              </div>


            </div>


            {/* =================================================
    RISK EXPLANATION
    ================================================= */}

<div className="why-flagged">

  <div className="section-heading-row">

    <div>
      <span className="detail-label">
        RISK ANALYSIS
      </span>

      <h3>
        Why was this flagged?
      </h3>
    </div>

    <span className="analysis-badge">
      Multi-signal
    </span>

  </div>


  {selectedRiskState.status === "normal" ? (

    <div className="normal-status-message">

      <span className="status-dot normal"></span>

      No suspicious behaviour detected

    </div>

  ) : selectedRiskState.status === "absent" ? (

    <div className="normal-status-message">

      <span className="status-dot"></span>

      Student currently absent

    </div>

  ) : (

    <>

      <p>
        Risk is based on persistent multi-signal behaviour,
        rather than a single observation.
      </p>


      {/* -----------------------------------------------
          SIGNAL CONTRIBUTIONS
          ----------------------------------------------- */}

      <div className="reason-list">

        {selectedRiskState.contributions &&
        selectedRiskState.contributions.length > 0 ? (

          selectedRiskState.contributions.map(
            (contribution, index) => (

              <div
                className="reason"
                key={`${contribution.signal}-${index}`}
              >

                <div className="reason-header">

                  <span>
                    {contribution.signal}
                  </span>

                  <strong>
                    +{contribution.points}
                  </strong>

                </div>


                <div className="reason-bar">

                  <div
                    style={{
                      width: `${Math.min(
                        Number(contribution.points) * 4,
                        100
                      )}%`,
                    }}
                  ></div>

                </div>

              </div>

            )
          )

        ) : (

          selectedEvents
            .slice(0, 4)
            .map((event) => (

              <div
                className="reason"
                key={event.event_id}
              >

                <div className="reason-header">

                  <span>
                    {event.event_type}
                  </span>

                  <strong>
                    +{event.severity}
                  </strong>

                </div>


                <div className="reason-bar">

                  <div
                    style={{
                      width: `${Math.min(
                        Number(event.severity) * 4,
                        100
                      )}%`,
                    }}
                  ></div>

                </div>

              </div>

            ))

        )}

      </div>


      <div className="confidence-row">

        <span>
          Detection confidence
        </span>

        <strong>
          {Math.round(
            selectedRiskState.confidence * 100
          )}%
        </strong>

      </div>

    </>

  )}

</div>


{/* =================================================
    EVENT TIMELINE
    ================================================= */}

<div className="event-timeline-section">

  <div className="section-heading-row">

    <div>

      <span className="detail-label">
        RECENT ACTIVITY
      </span>

      <h3>
        Event Timeline
      </h3>

    </div>

    <span className="timeline-count">
      {selectedEvents.length}
    </span>

  </div>


  {selectedEvents.length === 0 ? (

    <div className="timeline-empty">

      No behavioural events recorded for this seat.

    </div>

  ) : (

    <div className="event-timeline">

      {selectedEvents
        .slice(0, 6)
        .map((event, index) => (

          <div
            className="timeline-item"
            key={event.event_id}
          >

            <div className="timeline-marker">

              <span></span>

              {index <
                Math.min(
                  selectedEvents.length,
                  6
                ) - 1 && (
                <i></i>
              )}

            </div>


            <div className="timeline-content">

              <div className="timeline-top">

                <strong>
                  {event.event_type}
                </strong>

                <span>
                  {event.timestamp}
                </span>

              </div>


              <div className="timeline-meta">

                <span>
                  Severity: {event.severity}
                </span>

                {event.confidence != null && (
                  <span>
                    Confidence:{" "}
                    {Math.round(
                      event.confidence * 100
                    )}%
                  </span>
                )}

              </div>

            </div>

          </div>

        ))}

    </div>

  )}

</div>


{/* =================================================
    HUMAN REVIEW
    ================================================= */}

<div className="actions">

  <div className="section-heading-row">

    <div>

      <span className="detail-label">
        HUMAN REVIEW
      </span>

      <h3>
        Invigilator Decision
      </h3>

    </div>

  </div>
  <div className={`ledger-state ${
  ledgerTx ? "anchored" : "pending"
}`}>

  <span className="ledger-state-dot"></span>

  <div>

    <strong>
      {ledgerTx
        ? "Decision anchored"
        : "Ledger anchoring pending"}
    </strong>

    <span>
      {ledgerTx
        ? "This review decision has been recorded in the integrity ledger."
        : "The final invigilator decision will be recorded as an integrity reference."
      }
    </span>

  </div>

</div>

  <p className="review-helper-text">
    Review the detected behaviour and record the
    invigilator's decision.
  </p>


  <button
    className="confirm-btn"
    onClick={() =>
      handleSeatAction("confirmed")
    }
    disabled={reviewLoading}
  >

    {reviewLoading
      ? "Saving..."
      : "Confirm Incident"}

  </button>


  <div className="secondary-actions">

    <button
      onClick={() =>
        handleSeatAction("normal")
      }
      disabled={reviewLoading}
    >
      Mark False Alarm
    </button>


    <button
      onClick={() =>
        handleSeatAction("review")
      }
      disabled={reviewLoading}
    >
      Keep Under Review
    </button>

  </div>


  {actionMessage && (

    <div className="action-message">

      <span className="privacy-dot"></span>

      {actionMessage}

    </div>

  )}


  {reviewError && (

    <div
      className="action-message"
      style={{
        color: "#b42318",
      }}
    >

      <span className="privacy-dot"></span>

      {reviewError}

    </div>

  )}
<div className="integrity-flow">

  <div className="integrity-step complete">

    <span className="integrity-step-dot"></span>

    <div>
      <strong>Behaviour detected</strong>
      <span>Risk event generated</span>
    </div>

  </div>


  <span className="integrity-connector"></span>


  <div className="integrity-step complete">

    <span className="integrity-step-dot"></span>

    <div>
      <strong>Invigilator review</strong>
      <span>Human decision recorded</span>
    </div>

  </div>


  <span className="integrity-connector"></span>


  <div
    className={`integrity-step ${
      ledgerTx ? "complete" : "pending"
    }`}
  >

    <span className="integrity-step-dot"></span>

    <div>
      <strong>Ledger record</strong>

      <span>
        {ledgerTx
          ? "Decision anchored"
          : "Awaiting anchoring"}
      </span>

    </div>

  </div>

</div>


  {ledgerTx && (

  <div className="blockchain-integrity-card">

  {/* =================================================
      TRUST & INTEGRITY HEADER
      ================================================= */}

  <div className="blockchain-header">

    <div>

      <span className="detail-label">
        TRUST & INTEGRITY
      </span>

      <h3>
        Blockchain Integrity
      </h3>

    </div>

    <span className="ledger-status">

      <span className="ledger-status-dot"></span>

      Decision Anchored

    </span>

  </div>


  {/* =================================================
      INTEGRITY MESSAGE
      ================================================= */}

  <p className="blockchain-description">

    The invigilator decision has been recorded as a
    tamper-evident examination integrity reference.

  </p>


  {/* =================================================
      INTEGRITY RECORD
      ================================================= */}

  <div className="integrity-record-section">

    <div className="integrity-section-heading">

      <span className="detail-label">
        INTEGRITY RECORD
      </span>

      <span className="integrity-record-status">
        Recorded
      </span>

    </div>


    <div className="integrity-record-grid">

      <div className="ledger-detail">

        <span>
          Seat
        </span>

        <strong>
          {selectedSeat || "—"}
        </strong>

      </div>


      <div className="ledger-detail">

        <span>
          Decision
        </span>

        <strong>
          Confirmed Incident
        </strong>

      </div>


      <div className="ledger-detail">

        <span>
          Risk Score
        </span>

        <strong>
          {selectedRiskState?.risk_score ?? "—"}
          {selectedRiskState?.risk_score != null
            ? " / 100"
            : ""}
        </strong>

      </div>


      <div className="ledger-detail">

        <span>
          Identity
        </span>

        <strong>
          Anonymous
        </strong>

      </div>

    </div>

  </div>


  {/* =================================================
      LEDGER PROOF
      ================================================= */}

  <div className="ledger-proof-section">

    <div className="integrity-section-heading">

      <span className="detail-label">
        LEDGER PROOF
      </span>

      <span className="ledger-proof-status">
        Anchored
      </span>

    </div>


    <div className="ledger-details">

      <div className="ledger-detail">

        <span>
          Transaction
        </span>

        <strong>
          {ledgerTx.tx_ref ||
            ledgerTx.tx_id ||
            "—"}
        </strong>

      </div>


      <div className="ledger-detail">

        <span>
          Block
        </span>

        <strong>
          {ledgerTx.block_ref || "—"}
        </strong>

      </div>


      <div className="ledger-detail">

        <span>
          Confirmations
        </span>

        <strong>

          {ledgerTx.node_confirmations != null
            ? ledgerTx.node_confirmations
            : "—"}

        </strong>

      </div>


      <div className="ledger-detail">

        <span>
          Chain Timestamp
        </span>

        <strong>
          {ledgerTx.chain_timestamp || "—"}
        </strong>

      </div>

    </div>

  </div>


  {/* =================================================
      VERIFICATION
      ================================================= */}

  <div className="ledger-verification">
    <div className="verification-icon">
      {integrityVerification?.status === "TAMPERED" ? "!" : "✓"}
    </div>
    <div className="verification-content">
      <strong>
        {integrityVerification
          ? integrityVerification.status === "VERIFIED"
            ? "Integrity Verified"
            : "Integrity Mismatch Detected"
          : "Integrity Verification"}
      </strong>
      <span>
        {integrityVerification
          ? integrityVerification.status === "VERIFIED"
            ? "Stored fingerprint matches the recomputed fingerprint and the ledger record."
            : "The stored fingerprint does not match the recomputed fingerprint. Review the record before trusting it."
          : "Recompute the SHA-256 fingerprint and compare it with the anchored integrity record."}
      </span>
      <button
        type="button"
        className="verify-integrity-btn"
        onClick={verifyIntegrity}
        disabled={verificationLoading || !ledgerEventId}
      >
        {verificationLoading ? "Verifying..." : "Verify Integrity"}
      </button>
    </div>
  </div>

  {integrityVerification && (
    <div className={`integrity-verification-result ${
      integrityVerification.status === "VERIFIED" ? "verified" : "tampered"
    }`}>
      <div className="verification-result-header">
        <span>VERIFICATION RESULT</span>
        <strong>{integrityVerification.status}</strong>
      </div>
      <div className="verification-hash-grid">
        <div className="ledger-detail"><span>Stored Fingerprint</span><strong>{integrityVerification.stored_hash || "—"}</strong></div>
        <div className="ledger-detail"><span>Recomputed Fingerprint</span><strong>{integrityVerification.recomputed_hash || "—"}</strong></div>
        <div className="ledger-detail"><span>Transaction</span><strong>{integrityVerification.tx_ref || ledgerTx?.tx_ref || "—"}</strong></div>
        <div className="ledger-detail"><span>Signature</span><strong>{integrityVerification.signature || "—"}</strong></div>
      </div>
      <div className="verification-check-line">
        {integrityVerification.status === "VERIFIED"
          ? "✓ Hash match confirmed — integrity record is consistent."
          : "⚠ Hash mismatch — possible tampering or record inconsistency detected."}
      </div>
    </div>
  )}

  {verificationError && (
    <div className="action-message" style={{ color: "#b42318" }}>
      <span className="privacy-dot"></span>
      {verificationError}
    </div>
  )}

{/* =================================================
      AUDIT NOTE
      ================================================= */}

  <div className="ledger-audit-note">

    <span className="privacy-dot"></span>

    Decision recorded as a tamper-evident
    examination audit reference.

  </div>

</div>
)}

</div>

            {/* =================================================
                PRIVACY NOTE
                ================================================= */}

            <div className="privacy-note">

              <span className="privacy-dot"></span>

              Processing locally · No identity data captured

            </div>


          </div>

        </div>


      </section>


    </main>
  );
}


export default LiveMonitor;
