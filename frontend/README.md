# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# PEHRA — Privacy-Preserving Examination Integrity System
## Complete Architecture & Execution Plan

---

## 1. PEHRA Overview

PEHRA is an offline, privacy-first examination integrity assistant. It never identifies students by face — it tracks **Seat IDs**. Cameras feed local (edge) inference that turns a frame into anonymous pose/movement data, which a behavior engine converts into weighted, multi-signal, temporally-persistent risk scores. Risk scores surface as seat-level states (`NORMAL`, `UNDER_REVIEW`, `HIGH_RISK`) on an invigilator dashboard. A human always makes the final call — PEHRA flags "suspicious behavioral patterns," never "cheating."

The system is built as **four cooperating layers** (Edge Sensing → Behavior Intelligence → Local Backend → Frontend), each owned by a subset of the 6-person team, connected by **shared JSON contracts** that are frozen early so everyone can build in parallel against mocks.

---

## 2. System Architecture (Four Layers)

```
┌─────────────────────────────────────────────────────────┐
│ LAYER 4 — FRONTEND                                       │
│ Dashboard · Exams · Live Monitor · Privacy                │
└───────────────────────▲─────────────────────────────────┘
                         │ REST + WebSocket
┌───────────────────────┴─────────────────────────────────┐
│ LAYER 3 — LOCAL BACKEND (FastAPI + SQLite)                │
│ Exam sessions · Seats · Events · Risk state · Reviews     │
└───────────────────────▲─────────────────────────────────┘
                         │ POST pose_data / behavior_event
┌───────────────────────┴─────────────────────────────────┐
│ LAYER 2 — BEHAVIOR INTELLIGENCE (Python)                  │
│ Features → Temporal aggregation → Fusion → Risk scoring   │
└───────────────────────▲─────────────────────────────────┘
                         │ POSE_DATA stream
┌───────────────────────┴─────────────────────────────────┐
│ LAYER 1 — EDGE SENSING (Camera + local inference)         │
│ Person/pose detection → Anonymous representation →        │
│ Seat localization (via Calibration mapping)                │
└─────────────────────────────────────────────────────────┘
```

Everything runs on a local machine/mini-PC for the prototype — no cloud dependency required for the core loop.

---

## 3. Component Architecture

| Component | Responsibility | Talks to |
|---|---|---|
| **Frontend Shell** | Navbar, routing, Active Exam Dock, theme | Backend API/WS |
| **Exams Module** | Exam CRUD, creation workflow, hall/seat/camera/calibration setup UI | Backend API |
| **Live Monitor Module** | Seat map, seat detail panel, pose viz, event timeline, review actions | Backend API/WS |
| **Backend API** | Source of truth for exam/seat/event/risk state, persistence, WS broadcast | DB, all producers/consumers |
| **Edge AI Pipeline** | Camera capture → pose/keypoints → seat localization | Calibration data, Backend (POSE_DATA) |
| **Behavior Engine** | Converts POSE_DATA → BEHAVIOR_EVENT → RISK_STATE | Backend (reads/writes) |
| **Calibration Module** | Maps camera zones → Seat IDs | Edge AI, Backend |

---

## 4. Frontend Architecture

**Stack:** React + Vite + Tailwind (or plain CSS with design tokens).

**Structure:**
```
frontend/
├── src/
│   ├── app/                # routing, layout shell, navbar, Active Exam Dock
│   ├── pages/
│   │   ├── dashboard/
│   │   ├── exams/
│   │   ├── live-monitor/
│   │   └── privacy/
│   ├── components/         # shared: SeatChip, RiskBadge, StatusPill, Card
│   ├── api/                # typed API client + WS client (Person 1 owns base client)
│   ├── state/               # global state (active exam, notifications)
│   ├── mocks/               # mock data matching shared contracts
│   └── styles/              # design tokens (colors, spacing)
```

**Global elements owned by Person 1:**
- Navbar (Dashboard / Exams / Live Monitor / Privacy)
- Active Exam Dock (fixed-position, visible on all 4 pages, clickable → Live Monitor)
- Design tokens: white base, charcoal navbar, yellow/orange accent, green/orange/red status colors
- Shared components: `SeatChip`, `RiskBadge`, `StatusPill`, `EventRow`, `Card`
- API client wrapper + WebSocket hook so Person 2/3 don't each build their own

**Owned by Person 2:** `pages/exams/*` — list, filters, search, Create Examination workflow (Steps 1–6 UI), exam detail/summary view.

**Owned by Person 3:** `pages/live-monitor/*` — exam header, live stats, seating map, seat detail panel, pose visualization, event timeline, risk explanation, review actions.

---

## 5. Backend Architecture

**Stack:** Python + FastAPI + SQLite + WebSocket.

```
backend/
├── app/
│   ├── main.py
│   ├── models/          # SQLAlchemy models mirroring shared contracts
│   ├── schemas/          # Pydantic request/response schemas
│   ├── routers/
│   │   ├── exams.py
│   │   ├── seats.py
│   │   ├── calibration.py
│   │   ├── pose.py       # ingest POSE_DATA from Edge AI
│   │   ├── events.py     # ingest BEHAVIOR_EVENT from Behavior Engine
│   │   ├── risk.py       # RISK_STATE reads
│   │   └── reviews.py    # human-in-the-loop actions
│   ├── ws/                # WebSocket broadcast manager
│   ├── db.py
│   └── seed.py            # mock/demo data generator
├── tests/
└── requirements.txt
```

Backend is the single source of truth. Edge AI and Behavior Engine are **producers** that POST into it; Frontend is a **consumer** via REST (initial load) + WebSocket (live updates).

---

## 6. Edge AI Architecture

```
edge-ai/
├── capture/         # camera/video input (or mock frame generator)
├── inference/        # person detection + pose/keypoint extraction
├── representation/   # converts raw pose to anonymous feature vector
├── localization/     # maps detected person → Seat ID using calibration
├── client/           # posts POSE_DATA to backend
└── mock/             # scripted mock pose sequences for demo (head turn, hand anomaly, etc.)
```

Principle: raw frames never leave this module and are discarded immediately after inference unless an explicit, separately-flagged evidence-retention mode is enabled (see §9 Privacy Architecture). Only `POSE_DATA` crosses the boundary into the rest of the system.

---

## 7. Behavior Engine Architecture

```
behavior-engine/
├── features/          # per-frame/per-window feature extraction
├── baseline/           # per-seat/session personal baseline
├── temporal/            # sliding-window aggregation, persistence checks
├── fusion/               # multi-signal weighting → composite score
├── risk/                  # risk scoring, decay, state transition (NORMAL/UNDER_REVIEW/HIGH_RISK)
├── events/               # BEHAVIOR_EVENT generation with explanation payload
└── client/               # posts BEHAVIOR_EVENT + RISK_STATE to backend
```

**Core false-positive-reduction logic lives here:**
- A single detected action never directly flips state.
- Signals accumulate in a temporal window with a **persistence requirement** (e.g., repeated ≥3 times within N seconds).
- **Multi-signal fusion**: head turn + body orientation + hand anomaly + temporal pattern + neighbor interaction each contribute weighted points (see §15).
- **Risk decay**: score decreases over time if no new signals occur.
- **Context-aware suppression**: known benign patterns (stretching, looking at clock) reduce/ignore contribution.
- Every event stores an explanation payload so the frontend can render "Repeated head turns +18, Body orientation +20 …".

---

## 8. Calibration Architecture

```
calibration/
├── zone-mapping/     # camera zone ↔ seat grid mapping tool/logic
├── coverage-check/    # validates every seat has camera coverage
└── config/            # stores CALIBRATION contract records per exam
```

Calibration runs once per Exam Setup (Step 5) and produces `CALIBRATION` records consumed by Edge AI's `localization/` module. Owned jointly by Person 6 (logic/validation) and Person 5 (integration with edge pipeline).

---

## 9. Privacy Architecture

```
CAMERA → EDGE PROCESSING → ANONYMOUS REPRESENTATION → BEHAVIOR FEATURES → RISK EVENTS → INVIGILATOR
```

Guarantees enforced end-to-end:
- No face recognition, no face embeddings, anywhere in the pipeline.
- No student identity is ever attached to a `POSE_DATA`, `BEHAVIOR_EVENT`, or `RISK_STATE` record — only `seat_id`.
- No cloud transmission of identifiable video; processing is local.
- Raw frames are discarded after inference by default.
- If an **optional evidence-retention mode** is proposed (e.g., for confirmed high-severity incidents), it must be: (a) off by default, (b) explicitly toggled per-exam during setup, (c) clearly labeled in the UI as a distinct mode with its own retention/consent implications, (d) never enabled silently by the behavior engine itself.

The **Privacy page** (§13 below) renders this exact flow diagram plus status cards (Face Recognition: Disabled, Cloud Processing: Disabled, Identifiable Video Transmission: Disabled, Local Processing: Active, Identity Data: Not required, Data Minimization: Enabled) — pulled from a `/privacy/status` backend endpoint so it reflects the real running configuration, not a static claim.

---

## 10. Full Page Map

**Top-level navigation (exactly 4 items):**
1. Dashboard (`/`)
2. Exams (`/exams`, `/exams/:examId`, `/exams/new`)
3. Live Monitor (`/live-monitor/:examId`)
4. Privacy (`/privacy`)

**Non-navigable stages (inside the Exams workflow, not top-level):**
- Exam Setup → Hall Configuration → Seating Configuration → Camera Configuration → Calibration → Pre-Exam Check → (Start) — all steps within `/exams/new` or `/exams/:examId/setup`.
- Session Summary is rendered inside `/exams/:examId` once status = Completed (not a separate top-level "Reports" tab).

---

## 11. Exact Purpose of Every Page

| Page | Purpose | Must NOT contain |
|---|---|---|
| **Dashboard** | "What do I need to know today?" — greeting, active exam card, today's schedule, system status, recent activity | Seating map, per-student/seat risk scores, detailed alerts |
| **Exams** | Manage all examinations: list/search/filter, create, view, edit, start | Live seat-level monitoring |
| **Exam Setup (sub-flow)** | 6-step wizard: details → hall → seating → cameras → calibration → pre-exam check | — |
| **Live Monitor** | Control room: live stats, seating map, seat detail, pose viz, events, risk explanation, human review | Exam creation/editing |
| **Privacy** | Explain the privacy architecture to judges/institutions with live status | Any per-student personal data |
| **Session Summary (in Exams)** | Post-exam report: attendance, risk distribution, event summary, false alarms vs confirmed, privacy summary | — |

---

## 12. Exam Workflow

```
Select/Create Exam → Exam Setup (Details → Hall → Seating → Cameras →
Calibration → Pre-Exam Check) → Start Examination → Live Monitoring →
End Examination → Session Summary
```

Each step writes into the `EXAM` record incrementally; `status` transitions: `draft → configured → ready → live → completed`.

---

## 13. Data Flow (End-to-End)

```
Camera Frame
  → [Edge AI] pose/keypoints + seat localization
    → POST /pose  (POSE_DATA)
      → [Behavior Engine] features → temporal window → fusion
        → POST /events (BEHAVIOR_EVENT)
        → PUT /risk/:seat_id (RISK_STATE)
          → [Backend] persists + broadcasts via WebSocket
            → [Frontend Live Monitor] seat turns orange/red,
               event timeline updates, risk explanation renders
              → [Invigilator] reviews → Mark False Alarm /
                 Keep Under Review / Confirm Incident
                → PATCH /reviews/:seat_id → back into RISK_STATE history
```

---

## 14. Shared JSON / Data Contracts

These live in **`docs/contracts.md`** (mirrored as TypeScript types in `frontend/src/api/types.ts` and Pydantic schemas in `backend/app/schemas/`). **Owner: Person 1.** Any change requires a PR that Person 1 approves, and must update all three locations in the same PR.

```json
EXAM {
  exam_id, name, subject, hall_id, date,
  start_time, end_time, total_seats, status
}

SEAT {
  seat_id, row, column, status   // status: normal | under_review | high_risk | absent
}

POSE_DATA {
  seat_id, timestamp, presence, confidence, pose_features
}

BEHAVIOR_EVENT {
  event_id, exam_id, seat_id, event_type, severity,
  confidence, timestamp, duration
}

RISK_STATE {
  seat_id, risk_score, confidence, status, updated_at
}

CALIBRATION {
  camera_id, zone, seat_ids, coverage, status
}
```

**Rule:** No module invents its own field names or shapes for these entities. Mock data (used by Frontend/Backend before real Edge AI/Behavior Engine exist) must conform exactly to these shapes.

---

## 15. API Design

Base: `http://localhost:8000/api`. Auth is out of scope for hackathon (single invigilator session assumed).

| Method | Endpoint | Purpose | Owner |
|---|---|---|---|
| GET/POST | `/exams` | List / create exams | Backend |
| GET/PUT | `/exams/:id` | Read / update exam (setup steps) | Backend |
| POST | `/exams/:id/start` | Transition to live | Backend |
| POST | `/exams/:id/end` | Transition to completed | Backend |
| GET | `/exams/:id/summary` | Session summary data | Backend |
| GET/PUT | `/exams/:id/seats` | Seat grid config/status | Backend |
| POST/GET | `/exams/:id/calibration` | Store/read calibration | Backend |
| POST | `/pose` | Ingest POSE_DATA (Edge AI → Backend) | Backend + Edge AI |
| POST | `/events` | Ingest BEHAVIOR_EVENT (Behavior Engine → Backend) | Backend + Behavior Engine |
| GET | `/exams/:id/events` | Event timeline for UI | Backend |
| GET/PUT | `/exams/:id/risk/:seat_id` | Read/update risk state | Backend + Behavior Engine |
| PATCH | `/exams/:id/reviews/:seat_id` | False alarm / confirm incident / notify | Backend |
| GET | `/privacy/status` | Live privacy config status | Backend |
| WS | `/ws/exams/:id` | Live push: seat status, events, risk updates | Backend |

Example risk explanation payload (drives §7 risk explanation UI):
```json
{
  "seat_id": "B-04",
  "risk_score": 82,
  "confidence": 0.91,
  "status": "high_risk",
  "contributions": [
    {"signal": "repeated_head_turns", "points": 18},
    {"signal": "body_orientation", "points": 20},
    {"signal": "hand_anomaly", "points": 8},
    {"signal": "temporal_pattern", "points": 24},
    {"signal": "neighbor_interaction", "points": 12}
  ]
}
```

---

## 16. GitHub Structure

```
PEHRA/
├── frontend/          # Person 1 + Person 2 + Person 3
├── backend/            # Person 4
├── edge-ai/             # Person 5
├── behavior-engine/     # Person 6
├── calibration/          # Person 6 + Person 5
├── tests/                 # Person 6 + all contributors
├── docs/                   # Person 1
│   ├── contracts.md
│   ├── ARCHITECTURE.md
│   └── API.md
├── README.md
└── .gitignore
```

---

## 17. Exact Ownership of Each Folder

| Folder | Owner(s) | Notes |
|---|---|---|
| `frontend/src/app`, shared components, tokens | Person 1 | Others don't edit shell/tokens without a PR reviewed by P1 |
| `frontend/src/pages/exams` | Person 2 | — |
| `frontend/src/pages/live-monitor` | Person 3 | — |
| `frontend/src/pages/dashboard`, `privacy` | Person 1 | — |
| `backend/` | Person 4 | Sole owner of DB schema/migrations |
| `edge-ai/` | Person 5 | — |
| `behavior-engine/` | Person 6 | — |
| `calibration/` | Person 6 (logic) + Person 5 (edge integration) | — |
| `tests/` | Person 6 coordinates; all contribute tests for their own module | — |
| `docs/` | Person 1 | Contract changes require P1 sign-off |

---

## 18. Exact Responsibility of Each of the 6 Members

### Person 1 — System Architect / Integration Lead
- **Owned folder:** `frontend/src/app`, `frontend/src/components`, `frontend/src/pages/dashboard`, `frontend/src/pages/privacy`, `docs/`
- **Owned features:** Architecture, contracts, navbar, Active Exam Dock, dashboard, privacy page, API client/WS wrapper, merge policy, final integration
- **Input from:** Everyone (all modules integrate through P1's shell + contracts)
- **Output to:** Everyone (provides shared components, API client, merged main branch)
- **First task:** Freeze data contracts (`docs/contracts.md`) + repo skeleton + branch protection
- **Second task:** Build navbar, Active Exam Dock, shared components (`SeatChip`, `RiskBadge`, etc.), API client
- **Third task:** Build Dashboard + Privacy pages against mock data; set up CI-lite (lint/build check)
- **Dependencies:** None to start (defines the contracts others depend on)
- **Should NOT modify:** Page-internal logic of Exams/Live Monitor once assigned, without review from P2/P3

### Person 2 — Exams / Frontend
- **Owned folder:** `frontend/src/pages/exams`
- **Owned features:** Exams list, filters/search, Create Examination wizard (Steps 1–6), exam detail view, Session Summary UI
- **Input from:** Person 1 (shared components, API client), Person 4 (exam/seat/calibration API contract)
- **Output to:** Person 1 (integration), Person 4 (real API calls once ready)
- **First task:** Build Exams list + Create Examination wizard UI against mock `EXAM`/`SEAT` data
- **Second task:** Wire to real `/exams` endpoints once Person 4's API is ready
- **Third task:** Build Session Summary view + polish setup workflow (calibration/pre-exam-check screens)
- **Dependencies:** Shared components (P1), Exam/Seat/Calibration contracts (P1), Exam API (P4)
- **Should NOT modify:** `backend/`, `frontend/src/pages/live-monitor`

### Person 3 — Live Monitor Frontend
- **Owned folder:** `frontend/src/pages/live-monitor`
- **Owned features:** Seat map, seat detail panel, anonymous pose visualization, event timeline, risk explanation, human review actions
- **Input from:** Person 1 (shared components, WS client), Person 4 (seat/event/risk API + WS), Person 6 (risk explanation shape)
- **Output to:** Person 1 (integration), Person 4 (review actions PATCH)
- **First task:** Build seat map + seat detail panel against mock `RISK_STATE`/`BEHAVIOR_EVENT` data
- **Second task:** Wire live updates via WebSocket once Person 4's WS layer exists
- **Third task:** Build risk explanation UI + human review controls (false alarm / confirm / notify)
- **Dependencies:** Shared components (P1), Seat/Event/Risk contracts, WS client (P1), Backend WS (P4)
- **Should NOT modify:** `frontend/src/pages/exams`, `backend/`

### Person 4 — Backend
- **Owned folder:** `backend/`
- **Owned features:** All API routers, DB schema/migrations, WebSocket broadcast manager, session lifecycle, seed/mock data
- **Input from:** Person 1 (contracts), Person 5 (POSE_DATA), Person 6 (BEHAVIOR_EVENT, RISK_STATE)
- **Output to:** Person 2, Person 3 (REST/WS), Person 5, Person 6 (ingestion endpoints)
- **First task:** DB schema + `/exams`, `/seats` CRUD against contracts; seed script with mock data
- **Second task:** `/pose`, `/events`, `/risk` ingestion endpoints + WebSocket broadcast
- **Third task:** `/reviews`, `/summary`, `/privacy/status` endpoints; hardening + error handling
- **Dependencies:** Contracts (P1)
- **Should NOT modify:** Frontend code, edge-ai/behavior-engine internals (only their API surface)

### Person 5 — Edge AI / Computer Vision
- **Owned folder:** `edge-ai/`
- **Owned features:** Camera capture, person/pose detection, anonymous representation, seat localization, mock frame/pose generator
- **Input from:** Person 6 + self (calibration mapping), Person 1 (POSE_DATA contract)
- **Output to:** Person 4 (`POST /pose`), Person 6 (consumes POSE_DATA downstream)
- **First task:** Build mock pose generator producing valid `POSE_DATA` (scripted head-turn/hand-anomaly sequences) for early integration
- **Second task:** Real person detection + pose/keypoint extraction on sample video/webcam
- **Third task:** Seat localization using calibration data; replace mock with real pipeline output
- **Dependencies:** POSE_DATA contract (P1), Calibration format (P6), Backend `/pose` endpoint (P4)
- **Should NOT modify:** `backend/`, `frontend/`

### Person 6 — Behavior Engine + Calibration + Testing
- **Owned folder:** `behavior-engine/`, co-owns `calibration/`, coordinates `tests/`
- **Owned features:** Feature extraction, baseline, temporal windows, multi-signal fusion, risk scoring/decay, event generation, calibration logic, false-positive test scenarios, metrics
- **Input from:** Person 5 (POSE_DATA), Person 1 (contracts)
- **Output to:** Person 4 (`POST /events`, `PUT /risk`), Person 3 (risk explanation shape)
- **First task:** Define fusion weights + state machine (`NORMAL`/`UNDER_REVIEW`/`HIGH_RISK`) and mock event generator matching contracts
- **Second task:** Real feature extraction + temporal aggregation from Person 5's pose output
- **Third task:** False-positive test suite (normal vs suspicious scenarios from §24) + calibration validation logic
- **Dependencies:** POSE_DATA contract (P1), Edge AI output (P5), Backend ingestion endpoints (P4)
- **Should NOT modify:** `frontend/`, `backend/` internals (only calls its API)

---

## 19. Dependency Graph Between Members

```
Person 1 (contracts + shell)
   │
   ├──> Person 2 (Exams FE) ──needs Exam/Seat API──> Person 4 (Backend)
   ├──> Person 3 (Live Monitor FE) ──needs Seat/Event/Risk API + WS──> Person 4
   │
   Person 4 (Backend) <── POSE_DATA ── Person 5 (Edge AI)
   Person 4 (Backend) <── BEHAVIOR_EVENT/RISK_STATE ── Person 6 (Behavior Engine)
   Person 5 (Edge AI) <── Calibration format ── Person 6
```

**Key insight:** Person 1's contracts unblock everyone on day 1. Person 4's mock/seed data unblocks Person 2 & 3 before Person 5/6 have real pipelines. Person 5 & 6 can develop against each other using mock POSE_DATA while Person 4's real ingestion endpoints are being finished.

---

## 20. First / Second / Third Task Per Member

(Consolidated from §18 for quick reference — see §18 for full detail.)

| Person | Task 1 | Task 2 | Task 3 |
|---|---|---|---|
| P1 | Freeze contracts + repo skeleton | Navbar, Dock, shared components, API client | Dashboard + Privacy pages |
| P2 | Exams list + Create wizard UI (mock) | Wire real Exam API | Session Summary + setup polish |
| P3 | Seat map + seat panel (mock) | Wire WebSocket live updates | Risk explanation + review controls |
| P4 | Exam/Seat CRUD + seed data | Pose/Event/Risk ingestion + WS | Reviews/Summary/Privacy-status endpoints |
| P5 | Mock pose generator | Real person/pose detection | Seat localization, swap mock→real |
| P6 | Fusion weights + mock event generator | Real feature extraction + temporal logic | False-positive test suite + calibration validation |

---

## 21. Git Branching Strategy

```
main (protected — P1 approval required to merge)
 ├── feature/frontend-shell        (P1)
 ├── feature/dashboard             (P1)
 ├── feature/privacy               (P1)
 ├── feature/exams                 (P2)
 ├── feature/live-monitor          (P3)
 ├── feature/backend-<area>        (P4, e.g. backend-exams, backend-pose)
 ├── feature/edge-ai               (P5)
 └── feature/behavior-engine       (P6)
```

**Rules:**
- One feature branch per task, short-lived, branched from latest `main`.
- Every PR needs at least one review; **contract changes (`docs/contracts.md`) require Person 1's explicit approval** regardless of who else reviews.
- Merge order preference during integration phases: Backend skeleton → Frontend mocks → Edge AI mock → Behavior Engine mock → real replacements one at a time.
- Conflicts: whoever opens the PR resolves conflicts against current `main` before requesting review; shared files (contracts, shared components) are only touched via small, reviewed PRs — never bulk-refactored silently.
- Commit style: `area: short description` (e.g. `live-monitor: add seat detail panel`).
- Architecture-level changes (new page, new top-level nav item, changed contract shape) always go through Person 1.

---

## 22. Milestones (Phase Plan)

| Phase | Focus | Who works | Builds | Needs (input) | Produces (output) | Dependency |
|---|---|---|---|---|---|---|
| **1** | Architecture & contracts | P1 | This document, `contracts.md`, repo skeleton, branch protection | Problem statement | Frozen contracts, repo | None |
| **2** | Module skeletons | All | Empty-but-runnable skeleton per folder | Phase 1 contracts | Buildable skeleton per module | Phase 1 |
| **3** | Mock flows | P1–P6 | FE pages on mock data; backend API skeleton + seed; mock behavior engine + mock edge data | Phase 2 | Independently runnable, mock-driven modules | Phase 2 |
| **4** | First E2E integration | P1 (lead), all | Vertical slice per §23 below | Phase 3 outputs from P4/P5/P6 | Working mock→UI pipeline | Phase 3 |
| **5** | Real edge data | P5 (lead), P4/P6 support | Replace mock pose with real detection | Phase 4 pipeline | Real POSE_DATA flowing | Phase 4 |
| **6** | Real behavior detection | P6 (lead), P4/P5 support | Replace mock events with real fusion/scoring | Phase 5 | Real BEHAVIOR_EVENT/RISK_STATE | Phase 5 |
| **7** | False-positive testing | P6 (lead), all | Run §24 test scenarios, tune weights/thresholds | Phase 6 | FP rate metrics, tuned thresholds | Phase 6 |
| **8** | Privacy validation | P1 (lead), P5 support | Verify no identity data anywhere; finalize Privacy page | Phase 6–7 | Verified privacy claims, live status | Phase 6 |
| **9** | Final UI polish & demo | All | Visual polish, demo script, rehearsal | All prior phases | Demo-ready product | Phase 8 |

---

## 23. First Working End-to-End Demo (Vertical Slice)

Target for end of **Phase 4**:

```
Mock Camera → Mock Pose (P5 mock) → Seat B-04 (Calibration) →
Behavior Event (P6 mock: head turn + body orientation + hand anomaly) →
Risk Score = 82 (P6 fusion, even if simplified) →
Backend (P4: stores + broadcasts) →
Frontend (P3: Live Monitor) →
Seat B-04 turns orange/red, event appears in timeline,
risk explanation shows contributing signals
```

This does **not** require real computer vision yet — it proves the entire contract chain and integration works, so every subsequent phase is a "swap the mock for the real thing" operation rather than a fresh integration.

---

## 24. Testing Plan

**A. Normal behavior (must stay `NORMAL`, no cascading alert):**
Writing, looking at paper, adjusting posture, stretching, looking at clock, picking up a pen.

**B. Suspicious patterns (should trigger `UNDER_REVIEW` → possibly `HIGH_RISK` only with persistence + multiple signals):**
Repeated head turns, repeated body orientation change, hand movement anomaly, neighbor-directed behavior, prolonged unusual movement, seat absence.

**Core proof required:** one instance of a normal action (e.g., a single head turn) must never alone flip a seat to `HIGH_RISK`. This is validated by Person 6's test suite, which feeds scripted single-action sequences through the engine and asserts state stays `NORMAL`.

**Metrics tracked:**
- False Positive Rate
- Detection Rate (true suspicious patterns caught)
- Event confidence distribution
- Alert latency (frame → dashboard update)
- System uptime during a mock exam run
- Camera/seat coverage %

---

## 25. False-Positive Strategy

- **Personal/session baseline:** establish per-seat normal movement range in the first minutes of the exam.
- **Temporal windows:** evaluate signals over a rolling window (e.g., 30–60s), not per-frame.
- **Persistence requirement:** a signal must recur a minimum number of times within the window to count.
- **Multi-signal fusion:** composite score requires contributions from ≥2 independent signal types before reaching `UNDER_REVIEW`.
- **Confidence weighting:** low-confidence pose detections contribute less to the score.
- **Risk decay:** score decreases automatically if no new signals arrive, preventing stale spikes from persisting.
- **Context-aware suppression:** known-benign movement patterns (stretch, clock-check) are down-weighted or ignored.
- **Human review required:** `HIGH_RISK` is a prompt for invigilator attention, not an automatic action — resolved via Mark False Alarm / Keep Under Review / Confirm Incident.
- **Explainability:** every event/risk update carries the signal-by-signal point breakdown shown in the UI.

---

## 26. Hackathon MVP

**Must actually work:**
Dashboard, Exam creation (all 6 setup steps as UI, even if calibration/pre-exam-check logic is simplified), seating configuration, live monitoring UI, seat-level status, event generation (can be driven by mock or lightly real detection), risk score computation with explanation, human review actions, Privacy page with live status, full end-to-end integration (camera/mock → UI).

**Can be simulated:**
Multiple physical cameras (one webcam or recorded video is enough), a real large classroom (a small seat grid is fine), a complex/heavy pose model (a lightweight one, or scripted mock sequences, is enough), advanced object detection, large-scale ML training, multi-building deployment.

The demo must still make the *architectural idea* — anonymous, edge-processed, human-in-the-loop, low-false-positive integrity monitoring — completely convincing even where individual components are simplified.

---

## 27. Stretch Goals

- Real (even if lightweight) pose-estimation model replacing the mock generator entirely.
- Multi-camera calibration with actual coverage-overlap handling.
- Adaptive per-student baseline that improves over the course of the exam.
- Historical trend view across multiple exams for the same hall.
- Exportable privacy-compliance report (PDF) from the Privacy page.
- Notify-supervisor flow with a second role/persona.
- Basic auth/roles (invigilator vs supervisor).

---

## 28. Final Demo Flow

```
Dashboard (calm home screen, today's schedule)
  → Exams → open/create an exam → walk through setup steps quickly
    → Start Examination → Active Exam Dock appears globally
      → Live Monitor: seating map mostly green
        → Trigger scripted suspicious sequence on Seat B-04
          → Seat turns orange → red; event timeline updates;
             risk explanation shows signal breakdown
            → Invigilator reviews → Confirm Incident (or Mark False Alarm)
              → End Examination
                → Exams → Session Summary (attendance, risk distribution,
                   false alarms vs confirmed, privacy summary)
                  → Privacy page: show the anonymous pipeline + live status
                     to close on the core differentiator
```

---

## 29. Risks and Technical Bottlenecks

| Risk | Impact | Mitigation |
|---|---|---|
| Real pose/CV pipeline slips or underperforms | Demo forced to run fully on mocks | Vertical-slice-first plan (Phase 4) means demo works either way |
| Contract drift between modules | Integration breaks late | Contracts frozen Phase 1, changes require P1 approval |
| WebSocket complexity for live updates | Live Monitor feels laggy/broken | Start with polling fallback, upgrade to WS once stable |
| Fusion/scoring tuning takes longer than expected | Too many/few false positives in demo | Reserve Phase 7 explicitly for FP testing/tuning; keep weights configurable, not hardcoded |
| Calibration mapping is fiddly with real cameras | Seat localization inaccurate | Keep calibration UI simple (manual zone→seat assignment) for hackathon scope |
| Six people, four repos worth of surface area | Integration chaos near deadline | Person 1 as sole integration owner; frequent small PRs, not big-bang merges |
| Team member unavailable/blocked | Whole phase stalls | Mock-first strategy means each layer can proceed independently of the layer below it |

---

## 30. What NOT to Build

- No face recognition / face embeddings / identity matching, anywhere.
- No cloud upload of video or identifiable data.
- No top-level nav items beyond Dashboard / Exams / Live Monitor / Privacy (no separate Setup, Calibration, Pre-Exam Check, Reports, Analytics, Students, Cameras, Risk tabs).
- No automatic accusation/punishment logic — the system only ever proposes review states.
- No "Student is cheating" language anywhere in UI copy — only "suspicious behavioral pattern" / "behavioral incident."
- No large-scale ML training pipeline — a lightweight/pretrained or mocked model is sufficient.
- No multi-tenant/multi-institution architecture, auth system, or roles beyond a single invigilator — out of scope for hackathon.
- No enterprise infra (Kafka, microservices, Kubernetes, cloud DB) — SQLite + FastAPI + WebSocket is enough.

---

## 31. Recommended Implementation Order

1. **Person 1:** Freeze contracts + repo skeleton + branch protection (unblocks everyone).
2. **Person 4:** Backend skeleton with seed/mock data for `EXAM`/`SEAT` (unblocks P2, P3 immediately).
3. **Person 1:** Shared components + navbar + Active Exam Dock + API client (unblocks P2, P3 UI work).
4. **Person 2 & 3 (parallel):** Build pages against mock data.
5. **Person 5 & 6 (parallel):** Build mock pose generator and mock event/fusion logic against contracts, independent of frontend/backend maturity.
6. **Integration checkpoint (Phase 4):** Wire mock Edge AI → mock Behavior Engine → real Backend → real Frontend for the vertical slice (Seat B-04 demo).
7. **Person 5:** Swap mock pose for real detection.
8. **Person 6:** Swap mock events for real feature/fusion/risk logic; run false-positive test suite.
9. **Person 1 + Person 5:** Privacy validation pass.
10. **All:** Final polish, demo rehearsal, buffer for bug fixes.

---

## Technology Stack (Recap)

- **Frontend:** React + Vite + Tailwind
- **Backend:** Python + FastAPI + SQLite
- **Real-time:** WebSocket
- **Edge/CV:** Lightweight local pose/detection model (or scripted mock for demo safety)
- **Behavior Engine:** Python
- Nothing heavier than this is needed for a convincing hackathon demo.
