import React, { useEffect, useMemo, useState } from "react";
import IntegrityInvestigation from "./IntegrityInvestigation";
import "./ChiefDashboard.css";

import {
  API_BASE_URL,
  formatExamDate,
  formatExamTime,
  deriveHallStatus,
  DEMO_HALLS,
} from "./chiefData";


/* ============================================================
   STATUS CONFIGURATION
============================================================ */

const STATUS_CONFIG = {
  verified: {
    label: "VERIFIED",
    className: "verified",
    icon: "✓",
  },

  tampered: {
    label: "TAMPERED",
    className: "tampered",
    icon: "!",
  },

  under_review: {
    label: "UNDER REVIEW",
    className: "under-review",
    icon: "•",
  },

  pending: {
    label: "AWAITING VERIFICATION",
    className: "pending",
    icon: "○",
  },
};


/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }) {
  const config =
    STATUS_CONFIG[status] ||
    STATUS_CONFIG.pending;

  return (
    <span
      className={`chief-status ${config.className}`}
    >
      <span className="chief-status-icon">
        {config.icon}
      </span>

      {config.label}
    </span>
  );
}


/* ============================================================
   METRIC CARD
============================================================ */

function MetricCard({
  label,
  value,
  type,
}) {
  return (
    <div
      className={`chief-metric-card ${
        type || ""
      }`}
    >
      <div className="chief-metric-top">
        <span>{label}</span>
      </div>

      <strong>{value}</strong>
    </div>
  );
}


/* ============================================================
   HALL CARD
============================================================ */

function HallCard({
  hall,
  onInvestigate,
}) {
  return (
    <div
      className={`chief-hall-card ${
        hall.status
      }`}
    >

      {/* Header */}

      <div className="chief-hall-header">

        <div>

          <span className="chief-hall-label">
            EXAMINATION HALL
          </span>

          <h3>
            {hall.hallName}
          </h3>

        </div>

        <StatusBadge
          status={hall.status}
        />

      </div>


      {/* Details */}

      <div className="chief-hall-details">

        <div>
          <span>INVIGILATOR</span>

          <strong>
            {hall.invigilator}
          </strong>
        </div>


        <div>
          <span>SEATS</span>

          <strong>
            {hall.seats}
          </strong>
        </div>


        <div>
          <span>INCIDENTS</span>

          <strong>
            {hall.incidents}
          </strong>
        </div>

      </div>


      {/* Footer */}

      <div className="chief-hall-footer">

        <span>
          Last verification:{" "}
          <strong>
            {hall.lastVerified}
          </strong>
        </span>


        <button
          className={
            hall.status === "tampered"
              ? "chief-investigate-btn"
              : "chief-view-btn"
          }
          onClick={() =>
            onInvestigate(hall)
          }
        >

          {hall.status === "tampered"
            ? "Investigate"
            : "View Details"}

          <span>→</span>

        </button>

      </div>

    </div>
  );
}


/* ============================================================
   CHIEF DASHBOARD
============================================================ */

export default function ChiefDashboard() {

  const [
    examinations,
    setExaminations,
  ] = useState([]);

  const [
    selectedHall,
    setSelectedHall,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  /* ==========================================================
     LOAD REAL BACKEND DATA
  ========================================================== */

  useEffect(() => {

    let cancelled = false;


    const loadChiefData =
      async () => {

        setLoading(true);
        setError("");


        try {

          /* --------------------------------------------------
             STEP 1
             Get all examinations
          -------------------------------------------------- */

          const examsResponse =
            await fetch(
              `${API_BASE_URL}/api/exams`
            );


          if (!examsResponse.ok) {

            throw new Error(
              `Exam API returned ${examsResponse.status}`
            );

          }


          const examsData =
            await examsResponse.json();


          const backendExams =
            Array.isArray(examsData)
              ? examsData
              : [];


          /* --------------------------------------------------
             STEP 2
             Build each examination
          -------------------------------------------------- */

          const enrichedExams =
            await Promise.all(

              backendExams.map(
                async (exam) => {

                  const examId =
                    exam.exam_id;


                  let seatStates = [];
                  let events = [];


                  /* ------------------------------------------
                     Get current seat states
                  ------------------------------------------ */

                  try {

                    const seatsResponse =
                      await fetch(
                        `${API_BASE_URL}/api/exams/${encodeURIComponent(
                          examId
                        )}/seats`
                      );


                    if (
                      seatsResponse.ok
                    ) {

                      const seatsData =
                        await seatsResponse.json();


                      if (
                        Array.isArray(
                          seatsData
                        )
                      ) {

                        seatStates =
                          seatsData;

                      }

                    }

                  } catch (
                    seatError
                  ) {

                    console.warn(
                      `Could not load seats for ${examId}:`,
                      seatError
                    );

                  }


                  /* ------------------------------------------
                     Get examination events
                  ------------------------------------------ */

                  try {

                    const eventsResponse =
                      await fetch(
                        `${API_BASE_URL}/api/exams/${encodeURIComponent(
                          examId
                        )}/events`
                      );


                    if (
                      eventsResponse.ok
                    ) {

                      const eventsData =
                        await eventsResponse.json();


                      if (
                        Array.isArray(
                          eventsData
                        )
                      ) {

                        events =
                          eventsData;

                      }

                    }

                  } catch (
                    eventError
                  ) {

                    console.warn(
                      `Could not load events for ${examId}:`,
                      eventError
                    );

                  }


                  /* ------------------------------------------
                     STEP 3

                     Find ledger records belonging
                     to examination events.
                  ------------------------------------------ */

                  const integrityResults =
                    [];


                  for (
                    const event of events
                  ) {

                    if (
                      !event?.event_id
                    ) {
                      continue;
                    }


                    try {

                      const ledgerResponse =
                        await fetch(
                          `${API_BASE_URL}/api/exams/${encodeURIComponent(
                            examId
                          )}/ledger/${encodeURIComponent(
                            event.event_id
                          )}`
                        );


                      if (
                        !ledgerResponse.ok
                      ) {
                        continue;
                      }


                      const ledgerRecord =
                        await ledgerResponse.json();


                      if (
                        ledgerRecord
                      ) {

                        /*
                         * Verify the record
                         * independently.
                         */

                        try {

                          const verifyResponse =
                            await fetch(
                              `${API_BASE_URL}/api/ledger/verify/${encodeURIComponent(
                                event.event_id
                              )}`
                            );


                          if (
                            verifyResponse.ok
                          ) {

                            const verification =
                              await verifyResponse.json();


                            integrityResults.push({

                              ...ledgerRecord,

                              ...verification,

                              event_id:
                                event.event_id,

                            });

                          } else {

                            integrityResults.push({

                              ...ledgerRecord,

                              event_id:
                                event.event_id,

                            });

                          }

                        } catch {

                          integrityResults.push({

                            ...ledgerRecord,

                            event_id:
                              event.event_id,

                          });

                        }

                      }

                    } catch (
                      ledgerError
                    ) {

                      console.warn(
                        `Could not check ledger event ${event.event_id}:`,
                        ledgerError
                      );

                    }

                  }


                  /* ------------------------------------------------
                     STEP 4
                     Map examination to its real hall
                  ------------------------------------------------ */

                  const hallId =
                    exam.hall_id ||
                    "UNKNOWN";


                  const hallName =
                    hallId === "HALL-A"
                      ? "Hall A"
                      : hallId;


                  /* ------------------------------------------------
                     STEP 5
                     Derive REAL hall status
                  ------------------------------------------------ */

                  const hallStatus =
                    deriveHallStatus({
                      seatStates,
                      integrityResults,
                    });


                  /* ------------------------------------------------
                     Count REAL events
                  ------------------------------------------------ */

                  const incidentCount =
                    events.length;


                  /* ------------------------------------------------
                     Latest REAL verification
                  ------------------------------------------------ */

                  const verifiedRecords =
                    integrityResults.filter(
                      (record) =>
                        String(
                          record?.status ||
                            ""
                        ).toUpperCase() ===
                        "VERIFIED"
                    );


                  const latestVerified =
                    verifiedRecords.length >
                    0
                      ? verifiedRecords[
                          verifiedRecords.length -
                            1
                        ]
                      : null;


                  const lastVerified =
                    latestVerified?.chain_timestamp ||
                    latestVerified?.checked_at ||
                    "Pending";


                  /* ------------------------------------------------
                     REAL HALL OBJECT
                  ------------------------------------------------ */

                  const liveHall = {

                    hallId,

                    hallName,

                    seats:
                      exam.total_seats ??
                      seatStates.length,

                    status:
                      hallStatus,

                    invigilator:
                      "Invigilator",

                    incidents:
                      incidentCount,

                    lastVerified,

                    /*
                     * Important:
                     * This hall is connected to
                     * the real backend.
                     */
                    dataMode:
                      "live",

                    /*
                     * Real event associated with
                     * latest integrity record.
                     */
                    eventId:
                      integrityResults[
                        integrityResults.length -
                          1
                      ]?.event_id ||
                      null,

                    integrityResults,

                    events,

                    seatStates,

                  };


                  /* ------------------------------------------------
                     RETURN EXAMINATION

                     LIVE HALL + DEMO HALLS
                  ------------------------------------------------ */

                  return {

                    id: examId,

                    name:
                      exam.name,

                    subject:
                      exam.subject,

                    time:
                      formatExamTime(
                        exam.start_time,
                        exam.end_time
                      ),

                    date:
                      formatExamDate(
                        exam.date
                      ),

                    backendStatus:
                      exam.status,

                    /*
                     * Hall A = LIVE
                     * Hall B/C/D = DEMO
                     */
                    halls: [
                      liveHall,

                      ...DEMO_HALLS,
                    ],

                  };

                }
              )
            );


          /* --------------------------------------------------
             Save data
          -------------------------------------------------- */

          if (!cancelled) {

            setExaminations(
              enrichedExams
            );

          }

        } catch (
          loadError
        ) {

          console.error(
            "Chief Dashboard backend load failed:",
            loadError
          );


          if (!cancelled) {

            setError(
              "Unable to load examination data from the PEHRA backend."
            );

          }

        } finally {

          if (!cancelled) {

            setLoading(false);

          }

        }

      };


    loadChiefData();


    return () => {

      cancelled = true;

    };

  }, []);


  /* ==========================================================
     EXAMINATION-WIDE METRICS
  ========================================================== */

  const stats =
    useMemo(() => {

      const halls =
        examinations.flatMap(
          (exam) =>
            exam.halls
        );


      return {

        totalHalls:
          halls.length,

        verifiedHalls:
          halls.filter(
            (hall) =>
              hall.status ===
              "verified"
          ).length,

        underReview:
          halls.filter(
            (hall) =>
              hall.status ===
              "under_review"
          ).length,

        integrityExceptions:
          halls.filter(
            (hall) =>
              hall.status ===
              "tampered"
          ).length,

      };

    }, [examinations]);


  /* ==========================================================
     INTEGRITY EXCEPTIONS
  ========================================================== */

  const integrityExceptions =
    useMemo(() => {

      const exceptions = [];


      examinations.forEach(
        (exam) => {

          exam.halls.forEach(
            (hall) => {

              if (
                hall.status !==
                "tampered"
              ) {

                return;

              }


              /*
               * For LIVE halls, this comes
               * from the backend.
               *
               * For DEMO halls, use the
               * demo integrity information.
               */

              const mismatch =
                hall.dataMode ===
                "demo"

                  ? hall.demoIntegrity ||
                    null

                  : hall.integrityResults?.find(
                      (result) =>
                        String(
                          result?.status ||
                            ""
                        ).toUpperCase() ===
                        "TAMPERED"
                    ) || null;


              exceptions.push({

                id:
                  `${exam.id}-${hall.hallId}`,

                hallId:
                  hall.hallId,

                hall:
                  hall.hallName,

                severity:
                  "tampered",

                examination:
                  exam.name,

                issue:
                  "Ledger integrity verification failed",

                detectedAt:
                  hall.lastVerified,

                mismatch,

                dataMode:
                  hall.dataMode,

              });

            }
          );

        }
      );


      return exceptions;

    }, [examinations]);


  /* ==========================================================
     OPEN INVESTIGATION
  ========================================================== */

  const handleInvestigate =
    (hall) => {

      setSelectedHall(
        hall
      );

    };


  /* ==========================================================
     INVESTIGATION PAGE
  ========================================================== */

  if (selectedHall) {

    const selectedExam =
      examinations.find(
        (exam) =>
          exam.halls.some(
            (hall) =>
              hall.hallId ===
              selectedHall.hallId
          )
      );


    return (

      <IntegrityInvestigation
        hall={selectedHall}
        exam={selectedExam}
        onBack={() =>
          setSelectedHall(null)
        }
      />

    );

  }


  /* ==========================================================
     MAIN DASHBOARD
  ========================================================== */

  return (

    <main className="chief-dashboard">


      {/* ======================================================
         HEADER
      ======================================================= */}

      <section className="chief-page-header">

        <div>

          <span className="chief-eyebrow">
            PEHRA · CHIEF INVIGILATOR
          </span>


          <h1>
            Examination Integrity
          </h1>


          <p>
            Command center for
            examination-wide integrity
            monitoring, verification and
            review.
          </p>

        </div>


        <div className="chief-date-card">

          <span>
            TODAY
          </span>


          <strong>
            {examinations[0]?.date ||
              "Loading..."}
          </strong>

        </div>

      </section>


      {/* ======================================================
         ERROR
      ======================================================= */}

      {error && (

        <section className="chief-section">

          <div className="chief-exception-panel">

            <div className="chief-exception-row">

              <div className="exception-icon">
                !
              </div>


              <div className="exception-main">

                <strong>
                  Backend connection unavailable
                </strong>


                <p>
                  {error}
                </p>


                <span className="exception-meta">
                  Make sure FastAPI is running on
                  localhost:8000.
                </span>

              </div>

            </div>

          </div>

        </section>

      )}


      {/* ======================================================
         METRICS
      ======================================================= */}

      <section className="chief-metrics">

        <MetricCard
          label="TOTAL HALLS"
          value={
            loading
              ? "—"
              : stats.totalHalls
          }
          type="neutral"
        />


        <MetricCard
          label="VERIFIED"
          value={
            loading
              ? "—"
              : stats.verifiedHalls
          }
          type="verified"
        />


        <MetricCard
          label="UNDER REVIEW"
          value={
            loading
              ? "—"
              : stats.underReview
          }
          type="review"
        />


        <MetricCard
          label="INTEGRITY EXCEPTIONS"
          value={
            loading
              ? "—"
              : stats.integrityExceptions
          }
          type="tampered"
        />

      </section>


      {/* ======================================================
         EXAMINATION OVERVIEW
      ======================================================= */}

      <section className="chief-section">

        <div className="chief-section-heading">

          <div>

            <span className="chief-section-eyebrow">
              TODAY'S SCHEDULE
            </span>


            <h2>
              Examination Overview
            </h2>

          </div>


          <button
            className="chief-secondary-btn"
          >
            View All Examinations →
          </button>

        </div>


        {/* LOADING */}

        {loading ? (

          <div className="chief-exam-block">

            <div className="chief-exam-header">

              <div>

                <span className="chief-exam-code">
                  LOADING
                </span>


                <h3>
                  Loading examinations...
                </h3>


                <p>
                  Fetching live data from
                  the PEHRA backend.
                </p>

              </div>

            </div>

          </div>


        ) : examinations.length ===
          0 ? (

          /* NO EXAMINATIONS */

          <div className="chief-exam-block">

            <div className="chief-exam-header">

              <div>

                <span className="chief-exam-code">
                  NO EXAMINATIONS
                </span>


                <h3>
                  No examination data
                  available
                </h3>


                <p>
                  The backend currently
                  returned no examination
                  records.
                </p>

              </div>

            </div>

          </div>


        ) : (

          /* EXAMINATIONS */

          examinations.map(
            (exam) => (

              <div
                className="chief-exam-block"
                key={exam.id}
              >

                <div className="chief-exam-header">

                  <div>

                    <span className="chief-exam-code">
                      {exam.id}
                    </span>


                    <h3>
                      {exam.name}
                    </h3>


                    <p>
                      {exam.subject} ·{" "}
                      {exam.time}
                    </p>

                  </div>


                  <div className="chief-exam-hall-count">

                    <strong>
                      {exam.halls.length}
                    </strong>


                    <span>
                      Halls
                    </span>

                  </div>

                </div>


                {/* HALL GRID */}

                <div className="chief-hall-grid">

                  {exam.halls.map(
                    (hall) => (

                      <HallCard
                        key={
                          hall.hallId
                        }
                        hall={hall}
                        onInvestigate={
                          handleInvestigate
                        }
                      />

                    )
                  )}

                </div>

              </div>

            )
          )

        )}

      </section>


      {/* ======================================================
         INTEGRITY EXCEPTIONS
      ======================================================= */}

      <section className="chief-section">

        <div className="chief-section-heading">

          <div>

            <span className="chief-section-eyebrow">
              REQUIRES ATTENTION
            </span>


            <h2>
              Integrity Exceptions
            </h2>

          </div>


          <span className="chief-exception-count">

            {integrityExceptions.length}
            {" "}
            Open

          </span>

        </div>


        <div className="chief-exception-panel">

          {integrityExceptions.length ===
          0 ? (

            <div className="chief-exception-row">

              <div className="exception-icon">
                ✓
              </div>


              <div className="exception-main">

                <strong>
                  No integrity exceptions
                </strong>


                <p>
                  No tampered ledger
                  verification has been
                  returned by the backend
                  or demo monitoring layer.
                </p>


                <span className="exception-meta">
                  Examination integrity
                  monitoring is active.
                </span>

              </div>

            </div>

          ) : (

            integrityExceptions.map(
              (exception) => (

                <div
                  className="chief-exception-row"
                  key={exception.id}
                >

                  <div className="exception-icon">
                    !
                  </div>


                  <div className="exception-main">

                    <div className="exception-title-row">

                      <strong>
                        {exception.hall}
                      </strong>


                      <span className="exception-severity">

                        {exception.severity.toUpperCase()}

                      </span>

                    </div>


                    <p>
                      {exception.examination}
                    </p>


                    <span className="exception-meta">

                      {exception.issue}
                      {" · "}
                      {exception.detectedAt}

                    </span>

                  </div>


                  <button
                    className="chief-investigate-btn"
                    onClick={() =>
                      handleInvestigate({
                        hallId:
                          exception.hallId,

                        hallName:
                          exception.hall,

                        status:
                          "tampered",

                        dataMode:
                          exception.dataMode,

                        mismatch:
                          exception.mismatch,

                      })
                    }
                  >

                    Open Investigation →

                  </button>

                </div>

              )
            )

          )}

        </div>

      </section>


      {/* ======================================================
         FOOTER
      ======================================================= */}

      <footer className="chief-footer">

        <span className="chief-footer-dot"></span>


        <span>
          PEHRA · Privacy-preserving
          examination integrity system
        </span>


        <span className="chief-footer-role">
          Chief Invigilator Access
        </span>

      </footer>

    </main>
  );
}