// frontend/src/chief/chiefData.js

/*
 * Chief Invigilator data layer
 *
 * Hall A uses the real PEHRA FastAPI backend.
 * Additional halls are frontend-only demonstration data
 * used to showcase the Chief Invigilator overview.
 */

export const API_BASE_URL = "http://localhost:8000";

/*
 * ============================================================
 * REAL / LIVE CONFIGURATION
 * ============================================================
 */

export const LIVE_EXAM_ID = "EXAM-101";
export const LIVE_HALL_ID = "HALL-A";


/*
 * ============================================================
 * DEMO HALL CONFIGURATION
 * ============================================================
 *
 * These halls are NOT connected to the backend.
 *
 * They exist only to demonstrate how the Chief Invigilator
 * dashboard can oversee multiple examination halls.
 *
 * Hall A is intentionally excluded because it comes from
 * the real backend.
 */

export const DEMO_HALLS = [
  {
    hallId: "HALL-B",
    hallName: "Hall B",
    seats: 60,
    status: "tampered",
    invigilator: "Invigilator",
    incidents: 2,
    lastVerified: "10:42 AM",

    dataMode: "demo",

    demoIntegrity: {
      status: "TAMPERED",

      storedFingerprint:
        "8f42a7c1d93e4b52a81d7f20c4e9b613",

      recomputedFingerprint:
        "7a13c9e42b68d015f4a82791c3d5e204",

      recordId: "DEMO-HALL-B-001",

      transaction:
        "0x8d41a9c72e5f1034b6c82d91e4a7f205",

      blockReference: "block-149221972",

      signature:
        "sig-session-DEMO-B-8f42a7c1",

      confirmations: 3,

      chainTimestamp:
        "2026-10-24T10:44:12Z",
    },
  },

  {
    hallId: "HALL-C",
    hallName: "Hall C",
    seats: 48,
    status: "verified",
    invigilator: "Invigilator",
    incidents: 0,
    lastVerified: "10:38 AM",

    dataMode: "demo",

    demoIntegrity: {
      status: "VERIFIED",

      storedFingerprint:
        "c82f91a43b7d0e52f1a63c9d8472b105",

      recomputedFingerprint:
        "c82f91a43b7d0e52f1a63c9d8472b105",

      recordId: "DEMO-HALL-C-001",

      transaction:
        "0x4f91c8a27d3e1056b9a42c71e8d5302f",

      blockReference: "block-149221968",

      signature:
        "sig-session-DEMO-C-c82f91a4",

      confirmations: 3,

      chainTimestamp:
        "2026-10-24T10:38:27Z",
    },
  },

  {
    hallId: "HALL-D",
    hallName: "Hall D",
    seats: 72,
    status: "under_review",
    invigilator: "Invigilator",
    incidents: 1,
    lastVerified: "Pending",

    dataMode: "demo",

    demoIntegrity: {
      status: "UNDER_REVIEW",

      storedFingerprint:
        "Pending",

      recomputedFingerprint:
        "Pending",

      recordId: "Pending",

      transaction: "Pending",

      blockReference: "Pending",

      signature: "Pending",

      confirmations: "Pending",

      chainTimestamp: "Pending",
    },
  },
];


/*
 * ============================================================
 * DATE FORMATTING
 * ============================================================
 *
 * Format backend date:
 * 2026-10-24
 *
 * →
 *
 * 24 October 2026
 */

export function formatExamDate(date) {
  if (!date) {
    return "Date unavailable";
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}


/*
 * ============================================================
 * TIME FORMATTING
 * ============================================================
 */

export function formatExamTime(startTime, endTime) {
  if (!startTime || !endTime) {
    return "Time unavailable";
  }

  return `${startTime} – ${endTime}`;
}


/*
 * ============================================================
 * REAL HALL STATUS DERIVATION
 * ============================================================
 *
 * This function is ONLY used for backend-connected data.
 *
 * We intentionally do NOT call a normal live hall
 * "VERIFIED" unless an integrity record actually exists.
 */

export function deriveHallStatus({
  seatStates = [],
  integrityResults = [],
}) {
  /*
   * A tampered verification is the strongest integrity
   * exception.
   */

  if (
    integrityResults.some(
      (result) =>
        String(result?.status || "").toUpperCase() ===
        "TAMPERED"
    )
  ) {
    return "tampered";
  }


  /*
   * If any monitored seat is under review,
   * reflect that at hall level.
   */

  if (
    seatStates.some(
      (seat) =>
        String(seat?.status || "").toLowerCase() ===
        "under_review"
    )
  ) {
    return "under_review";
  }


  /*
   * If a verified integrity record exists,
   * the hall can be shown as verified.
   */

  if (
    integrityResults.some(
      (result) =>
        String(result?.status || "").toUpperCase() ===
        "VERIFIED"
    )
  ) {
    return "verified";
  }


  /*
   * No integrity evidence yet.
   */

  return "pending";
}