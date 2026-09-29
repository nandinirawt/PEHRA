import React, { useEffect, useMemo, useState } from "react";

import ChiefDashboard from "./ChiefDashboard.jsx";
import IntegrityExceptions from "./IntegrityExceptions.jsx";
import IntegrityInvestigation from "./IntegrityInvestigation.jsx";

import {
  API_BASE_URL,
  formatExamDate,
  formatExamTime,
  deriveHallStatus,
  DEMO_HALLS,
} from "./chiefData";

import "./ChiefLayout.css";


export default function ChiefLayout() {

  /* ============================================================
     SHARED CHIEF STATE
  ============================================================ */

  const [
    examinations,
    setExaminations,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    currentPage,
    setCurrentPage,
  ] = useState("overview");

  const [
    selectedHall,
    setSelectedHall,
  ] = useState(null);


  /* ============================================================
     LOAD CHIEF DATA
  ============================================================ */

  useEffect(() => {

    let cancelled = false;


    const loadChiefData = async () => {

      setLoading(true);
      setError("");


      try {

        /* ------------------------------------------------------
           GET EXAMINATIONS
        ------------------------------------------------------ */

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


        /* ------------------------------------------------------
           BUILD EXAMINATION DATA
        ------------------------------------------------------ */

        const enrichedExams =
          await Promise.all(

            backendExams.map(
              async (exam) => {

                const examId =
                  exam.exam_id;


                let seatStates = [];
                let events = [];


                /* ------------------------------------------------
                   SEATS
                ------------------------------------------------ */

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

                } catch (seatError) {

                  console.warn(
                    `Could not load seats for ${examId}:`,
                    seatError
                  );

                }


                /* ------------------------------------------------
                   EVENTS
                ------------------------------------------------ */

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

                } catch (eventError) {

                  console.warn(
                    `Could not load events for ${examId}:`,
                    eventError
                  );

                }


                /* ------------------------------------------------
                   LEDGER + INTEGRITY
                ------------------------------------------------ */

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
                      !ledgerRecord
                    ) {
                      continue;
                    }


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

                  } catch (ledgerError) {

                    console.warn(
                      `Could not check ledger event ${event.event_id}:`,
                      ledgerError
                    );

                  }

                }


                /* ------------------------------------------------
                   REAL HALL
                ------------------------------------------------ */

                const hallId =
                  exam.hall_id ||
                  "UNKNOWN";


                const hallName =
                  hallId === "HALL-A"
                    ? "Hall A"
                    : hallId;


                const hallStatus =
                  deriveHallStatus({
                    seatStates,
                    integrityResults,
                  });


                const incidentCount =
                  events.length;


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
                  verifiedRecords.length
                    ? verifiedRecords[
                        verifiedRecords.length -
                          1
                      ]
                    : null;


                const lastVerified =
                  latestVerified?.chain_timestamp ||
                  latestVerified?.checked_at ||
                  "Pending";


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

                  dataMode:
                    "live",

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
                   RETURN EXAM
                ------------------------------------------------ */

                return {

                  id:
                    examId,

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

                  halls: [
                    liveHall,
                    ...DEMO_HALLS,
                  ],

                };

              }
            )
          );


        if (!cancelled) {

          setExaminations(
            enrichedExams
          );

        }

      } catch (loadError) {

        console.error(
          "Chief data loading failed:",
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


  /* ============================================================
     FIND SELECTED EXAMINATION
  ============================================================ */

  const selectedExam =
    useMemo(() => {

      if (!selectedHall) {
        return null;
      }


      return examinations.find(
        (exam) =>
          exam.halls.some(
            (hall) =>
              hall.hallId ===
              selectedHall.hallId
          )
      ) || null;

    }, [
      examinations,
      selectedHall,
    ]);


  /* ============================================================
     OPEN INVESTIGATION
  ============================================================ */

  const handleInvestigate =
    (hall) => {

      setSelectedHall(
        hall
      );

      setCurrentPage(
        "investigation"
      );

    };


  /* ============================================================
     NAVIGATION
  ============================================================ */

  const handleNavigate =
    (page) => {

      setSelectedHall(
        null
      );

      setCurrentPage(
        page
      );

    };


  /* ============================================================
     INVESTIGATION
  ============================================================ */

  if (
    currentPage ===
    "investigation"
  ) {

    return (

      <div className="chief-shell">

        <ChiefNavigation
          currentPage={
            currentPage
          }
          onNavigate={
            handleNavigate
          }
        />


        <IntegrityInvestigation
          hall={selectedHall}
          exam={selectedExam}
          onBack={() =>
            handleNavigate(
              "exceptions"
            )
          }
        />

      </div>

    );

  }


  /* ============================================================
     MAIN CHIEF NAVIGATION
  ============================================================ */

  return (

    <div className="chief-shell">

      <ChiefNavigation
        currentPage={
          currentPage
        }
        onNavigate={
          handleNavigate
        }
      />


      {currentPage ===
        "overview" && (

        <ChiefDashboard
          examinations={
            examinations
          }
          loading={
            loading
          }
          error={
            error
          }
          onInvestigate={
            handleInvestigate
          }
        />

      )}


      {currentPage ===
        "exceptions" && (

        <IntegrityExceptions
          examinations={
            examinations
          }
          onInvestigate={
            handleInvestigate
          }
        />

      )}

    </div>

  );

}


/* ============================================================
   CHIEF NAVIGATION
============================================================ */

function ChiefNavigation({
  currentPage,
  onNavigate,
}) {

  return (

    <header className="chief-navigation">

      {/* BRAND */}

      <div className="chief-nav-brand">

        <img
          src="/pehraa-logo.png"
          alt="PEHRA"
          className="chief-nav-logo"
        />


        <div className="chief-nav-divider" />


        <div className="chief-nav-title">

          <strong>
            Chief Command Center
          </strong>

          <span>
            Examination Integrity
          </span>

        </div>

      </div>


      {/* NAVIGATION */}

      <nav className="chief-nav-links">

        <button
          className={
            currentPage ===
            "overview"
              ? "active"
              : ""
          }
          onClick={() =>
            onNavigate(
              "overview"
            )
          }
        >
          Overview
        </button>


        <button
          className={
            currentPage ===
            "exceptions"
              ? "active"
              : ""
          }
          onClick={() =>
            onNavigate(
              "exceptions"
            )
          }
        >
          Integrity Exceptions
        </button>

      </nav>


      {/* ROLE */}

      <div className="chief-nav-role">

        <span className="chief-role-dot" />

        <div>

          <strong>
            Chief Invigilator
          </strong>

          <span>
            Active
          </span>

        </div>

      </div>

    </header>

  );

}