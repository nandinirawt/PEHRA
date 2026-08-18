import { useEffect, useState } from "react";
import "./LiveMonitor.css";
const API_BASE_URL = "http://localhost:8000";
const EXAM_ID = "EXAM-101";
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
 * No backend connection yet.
 * Version 1 uses mock data only.
 * ============================================================
 */


/* ============================================================
   EXAM
   ============================================================ */

const exam = {
  exam_id: "EXAM-MATH-001",
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

  const handleSeatAction = (action) => {

    if (action === "confirmed") {

      setActionMessage(
        `Incident confirmed for seat ${selectedSeat}.`
      );

      return;
    }


    if (action === "normal") {

      setSeatOverrides((previous) => ({
        ...previous,

        [selectedSeat]: {
          status: "normal",
          risk_score: 8,
          confidence: 0.91,
        },
      }));

      setActionMessage(
        `Seat ${selectedSeat} marked as a false alarm.`
      );

      return;
    }


    if (action === "review") {

      setSeatOverrides((previous) => ({
        ...previous,

        [selectedSeat]: {
          status: "under_review",
          risk_score:
            getRiskState(
  selectedSeat,
  previous,
  backendRiskStates
).risk_score,
          confidence:
            getRiskState(
  selectedSeat,
  previous,
  backendRiskStates
).confidence,
        },
      }));

      setActionMessage(
        `Seat ${selectedSeat} kept under review.`
      );
    }
  };


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
          HEADER
          ====================================================== */}

      <section className="live-header">

        <div>

          <span className="eyebrow">
            LIVE EXAMINATION
          </span>


          <h1>
            {exam.name} — {exam.subject}
          </h1>


          <div className="exam-meta">

            <span>Hall A</span>

            <span>•</span>

           <span>{seats.length} Seats</span>

            <span>•</span>

            <span>01:24:32 elapsed</span>

          </div>

        </div>


        <div className="monitor-status">

          <span className="status-dot normal"></span>

          Monitoring Active

        </div>

      </section>


      {/* ======================================================
          QUICK SUMMARY
          ====================================================== */}

      <section className="monitor-summary">


        <div className="summary-item">

          <span className="summary-dot normal"></span>

          <span>Normal</span>

          <strong>{normalCount}</strong>

        </div>


        <div className="summary-item">

          <span className="summary-dot review"></span>

          <span>Under Review</span>

          <strong>{reviewCount}</strong>

        </div>


        <div className="summary-item">

          <span className="summary-dot high"></span>

          <span>High Risk</span>

          <strong>{highRiskCount}</strong>

        </div>


        <div className="summary-item">

          <span className="summary-dot absent"></span>

          <span>Absent</span>

          <strong>{absentCount}</strong>

        </div>


      </section>


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
                Hall A · Current seating status
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


            <div className="invigilator-desk">

              INVIGILATOR DESK

            </div>


            <div
  className="seat-grid"
  style={{
    gridTemplateRows: `repeat(${hallConfig.rows}, auto)`,
  }}
>

  {Array.from(
    { length: hallConfig.rows },
    (_, rowIndex) => {

      const row =
        String.fromCharCode(
          65 + rowIndex
        );

      const rowSeats =
        seats.filter(
          (seat) => seat.row === row
        );

      return (

        <div
          className="seat-row"
          key={row}
        >

          <span className="row-label">
            {row}
          </span>


          {rowSeats.map((seat) => {

            const seatId =
              seat.seat_id;

            const status =
              getSeatStatus(
                seatId,
                seatOverrides,
                backendRiskStates
              );


            return (

              <button
                key={seatId}

                className={`seat ${status} ${
                  selectedSeat === seatId
                    ? "selected"
                    : ""
                }`}

                onClick={() => {

                  setSelectedSeat(
                    seatId
                  );

                  setActionMessage("");

                }}

              >

                <span
                  className={`seat-dot ${status}`}
                ></span>


                <span>
                  {seatId}
                </span>

              </button>

            );

          })}

        </div>

      );

    }
  )}

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

                        setSelectedSeat(
                          seatId
                        );

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
                WHY FLAGGED
                ================================================= */}

            <div className="why-flagged">


              {selectedRiskState.status === "normal" ? (

                <>

                  <h3>
                    No active concerns
                  </h3>


                  <p>
                    This seat is currently behaving
                    within the expected monitoring range.
                  </p>


                  <div className="normal-status-message">

                    <span className="status-dot normal"></span>

                    No suspicious behaviour detected

                  </div>

                </>

              ) : selectedRiskState.status === "absent" ? (

                <>

                  <h3>
                    Student absent
                  </h3>


                  <p>
                    No active presence detected for
                    this seat.
                  </p>

                </>

              ) : (

                <>

                  <h3>
                    Why was this flagged?
                  </h3>


                  <p>
                    Risk is based on persistent
                    multi-signal behaviour, not a
                    single moment.
                  </p>


                  <div className="reason-list">


                    {selectedEvents
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
                                  event.severity * 4,
                                  100
                                )}%`,
                              }}
                            ></div>

                          </div>


                        </div>

                      ))}


                  </div>

                </>

              )}


            </div>


            {/* =================================================
                ACTIONS
                ================================================= */}

            <div className="actions">


              <button
                className="confirm-btn"

                onClick={() =>
                  handleSeatAction(
                    "confirmed"
                  )
                }

              >
                Confirm Incident
              </button>


              <div className="secondary-actions">


                <button
                  onClick={() =>
                    handleSeatAction(
                      "normal"
                    )
                  }
                >
                  Mark False Alarm
                </button>


                <button
                  onClick={() =>
                    handleSeatAction(
                      "review"
                    )
                  }
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