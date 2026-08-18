/**
 * PEHRA Shared JSON Contracts
 * Aligned with docs/contracts.md
 */

export const EXAM_STATUS = {
  DRAFT: "draft",
  UPCOMING: "upcoming",
  LIVE: "live",
  COMPLETED: "completed",
};

export const SEAT_STATUS = {
  NORMAL: "normal",
  UNDER_REVIEW: "under_review",
  HIGH_RISK: "high_risk",
  ABSENT: "absent",
  BLOCKED: "blocked",
};

export const CAMERA_FEED_TYPES = {
  RTSP: "rtsp",
  WEBCAM: "webcam",
  EDGE_AI: "edge_ai",
  SIMULATED: "simulated",
};

export const DEFAULT_HALLS = [
  {
    id: "hall-a",
    name: "Hall A — Main Auditorium",
    capacity: 72,
    rows: 8,
    columns: 9,
    zones: ["Front-Left", "Front-Right", "Center", "Rear-Left", "Rear-Right"],
    lightingRating: "Optimal (450 lux)",
    cameraSockets: 4,
  },
  {
    id: "hall-b",
    name: "Hall B — Computing Lab 101",
    capacity: 60,
    rows: 6,
    columns: 10,
    zones: ["Cluster A", "Cluster B", "Cluster C"],
    lightingRating: "Good (380 lux)",
    cameraSockets: 3,
  },
  {
    id: "hall-c",
    name: "Hall C — Lecture Hall 204",
    capacity: 70,
    rows: 7,
    columns: 10,
    zones: ["North Wing", "South Wing"],
    lightingRating: "Optimal (420 lux)",
    cameraSockets: 4,
  },
];
