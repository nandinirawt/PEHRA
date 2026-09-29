import React, { useEffect, useState } from "react";
import "./IntegrityInvestigation.css";

const API_BASE_URL = "http://localhost:8000";


/* ============================================================
   STATUS CONFIG
============================================================ */

const STATUS_CONFIG = {
  VERIFIED: {
    label: "VERIFIED",
    className: "verified",
    icon: "✓",
  },

  TAMPERED: {
    label: "TAMPERED",
    className: "tampered",
    icon: "!",
  },

  UNDER_REVIEW: {
    label: "UNDER REVIEW",
    className: "under-review",
    icon: "•",
  },

  PENDING: {
    label: "AWAITING VERIFICATION",
    className: "pending",
    icon: "○",
  },

  ERROR: {
    label: "VERIFICATION ERROR",
    className: "error",
    icon: "!",
  },
};


/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }) {

  const normalized =
    String(status || "PENDING")
      .toUpperCase()
      .replace(/\s+/g, "_");


  const config =
    STATUS_CONFIG[normalized] ||
    STATUS_CONFIG.PENDING;


  return (
    <span
      className={`investigation-status ${config.className}`}
    >

      <span className="investigation-status-icon">
        {config.icon}
      </span>

      {config.label}

    </span>
  );
}


/* ============================================================
   DETAIL ITEM
============================================================ */

function DetailItem({
  label,
  value,
  mono = false,
}) {

  return (
    <div className="investigation-detail-item">

      <span className="investigation-detail-label">
        {label}
      </span>

      <strong
        className={
          mono
            ? "investigation-detail-value mono"
            : "investigation-detail-value"
        }
      >
        {value || "Pending"}
      </strong>

    </div>
  );
}


/* ============================================================
   FINGERPRINT COMPARISON
============================================================ */

function FingerprintComparison({
  stored,
  recomputed,
  status,
}) {

  const isTampered =
    String(status || "").toUpperCase() ===
    "TAMPERED";


  const isVerified =
    String(status || "").toUpperCase() ===
    "VERIFIED";


  return (
    <div className="fingerprint-comparison">

      <div className="fingerprint-header">

        <div>

          <span className="investigation-eyebrow">
            CONTENT INTEGRITY
          </span>

          <h3>
            Cryptographic Fingerprint Comparison
          </h3>

        </div>


        {isTampered && (
          <span className="fingerprint-warning">
            HASH MISMATCH
          </span>
        )}


        {isVerified && (
          <span className="fingerprint-success">
            HASH MATCH
          </span>
        )}

      </div>


      <div className="fingerprint-grid">

        <div
          className={`fingerprint-box ${
            isTampered
              ? "mismatch"
              : ""
          }`}
        >

          <span>
            STORED FINGERPRINT
          </span>


          <code>
            {stored || "Pending"}
          </code>

        </div>


        <div className="fingerprint-arrow">
          →
        </div>


        <div
          className={`fingerprint-box ${
            isTampered
              ? "mismatch"
              : ""
          }`}
        >

          <span>
            RECOMPUTED FINGERPRINT
          </span>


          <code>
            {recomputed || "Pending"}
          </code>

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function IntegrityInvestigation({
  hall,
  exam,
  onBack,
}) {

  /* ----------------------------------------------------------
     Determine whether this is a demo hall
  ---------------------------------------------------------- */

  const isDemoHall =
    hall?.dataMode === "demo";


  const eventId =
    hall?.eventId ||
    null;


  /* ----------------------------------------------------------
     LIVE STATE
  ---------------------------------------------------------- */

  const [
    verificationResult,
    setVerificationResult,
  ] = useState(null);


  const [
    ledgerRecord,
    setLedgerRecord,
  ] = useState(null);


  const [
    verificationStatus,
    setVerificationStatus,
  ] = useState(
    isDemoHall
      ? String(
          hall?.demoIntegrity?.status ||
            hall?.status ||
            "PENDING"
        ).toUpperCase()
      : eventId
        ? "CHECKING"
        : "PENDING"
  );


  const [
    verificationError,
    setVerificationError,
  ] = useState("");


  const [
    note,
    setNote,
  ] = useState("");


  const [
    noteSaved,
    setNoteSaved,
  ] = useState(false);


  /* ==========================================================
     DEMO DATA
  ========================================================== */

  useEffect(() => {

    if (!isDemoHall) {
      return;
    }


    /*
     * Demo data is frontend-only.
     * No backend call is made.
     */

    const demo =
      hall?.demoIntegrity;


    if (!demo) {

      setVerificationStatus(
        String(
          hall?.status ||
            "PENDING"
        ).toUpperCase()
      );

      return;

    }


    setVerificationStatus(
      String(
        demo.status ||
          hall.status ||
          "PENDING"
      ).toUpperCase()
    );


    setVerificationResult({

      status:
        demo.status,

      stored_hash:
        demo.storedFingerprint,

      recomputed_hash:
        demo.recomputedFingerprint,

      tx_ref:
        demo.transaction,

      block_ref:
        demo.blockReference,

      signature:
        demo.signature,

      node_confirmations:
        demo.confirmations,

      chain_timestamp:
        demo.chainTimestamp,

      record_id:
        demo.recordId,

      demo: true,

    });


    setLedgerRecord({

      status:
        demo.status,

      content_hash:
        demo.storedFingerprint,

      transaction:
        demo.transaction,

      block_ref:
        demo.blockReference,

      signature:
        demo.signature,

      node_confirmations:
        demo.confirmations,

      chain_timestamp:
        demo.chainTimestamp,

      record_id:
        demo.recordId,

      demo: true,

    });


    setVerificationError("");

  }, [
    isDemoHall,
    hall,
  ]);


  /* ==========================================================
     LIVE BACKEND VERIFICATION
  ========================================================== */

  const verifyIntegrity =
    async () => {

      /*
       * Demo halls NEVER call the backend.
       */

      if (isDemoHall) {

        const demo =
          hall?.demoIntegrity;


        if (!demo) {

          setVerificationStatus(
            "PENDING"
          );

          return;

        }


        setVerificationStatus(
          String(
            demo.status ||
              "PENDING"
          ).toUpperCase()
        );


        setVerificationResult({

          status:
            demo.status,

          stored_hash:
            demo.storedFingerprint,

          recomputed_hash:
            demo.recomputedFingerprint,

          tx_ref:
            demo.transaction,

          block_ref:
            demo.blockReference,

          signature:
            demo.signature,

          node_confirmations:
            demo.confirmations,

          chain_timestamp:
            demo.chainTimestamp,

          record_id:
            demo.recordId,

          demo: true,

        });


        setVerificationError("");

        return;

      }


      /* ------------------------------------------------------
         LIVE HALL
      ------------------------------------------------------ */

      if (!eventId) {

        setVerificationStatus(
          "PENDING"
        );

        setVerificationResult(
          null
        );

        setLedgerRecord(
          null
        );

        setVerificationError(
          "No ledger event is currently associated with this hall."
        );

        return;

      }


      setVerificationStatus(
        "CHECKING"
      );

      setVerificationError("");


      try {

        /* ----------------------------------------------------
           Get stored ledger record
        ---------------------------------------------------- */

        const ledgerResponse =
          await fetch(
            `${API_BASE_URL}/api/exams/${encodeURIComponent(
              exam?.id
            )}/ledger/${encodeURIComponent(
              eventId
            )}`
          );


        let ledgerData =
          null;


        if (
          ledgerResponse.ok
        ) {

          ledgerData =
            await ledgerResponse.json();

          setLedgerRecord(
            ledgerData
          );

        }


        /* ----------------------------------------------------
           Verify cryptographic integrity
        ---------------------------------------------------- */

        const verifyResponse =
          await fetch(
            `${API_BASE_URL}/api/ledger/verify/${encodeURIComponent(
              eventId
            )}`
          );


        if (
          !verifyResponse.ok
        ) {

          throw new Error(
            `Integrity verification returned ${verifyResponse.status}`
          );

        }


        const verificationData =
          await verifyResponse.json();


        /*
         * Normalize backend fields.
         */

        const normalized = {

          ...ledgerData,

          ...verificationData,

          tx_ref:
            verificationData?.tx_ref ??
            verificationData?.ledger_tx?.tx_id ??
            ledgerData?.tx_ref ??
            ledgerData?.ledger_tx?.tx_id ??
            null,

          node_confirmations:
            verificationData?.node_confirmations ??
            verificationData?.ledger_tx?.node_confirmations ??
            ledgerData?.node_confirmations ??
            ledgerData?.ledger_tx?.node_confirmations ??
            null,

          block_ref:
            verificationData?.block_ref ??
            verificationData?.ledger_tx?.block_ref ??
            ledgerData?.block_ref ??
            ledgerData?.ledger_tx?.block_ref ??
            null,

          signature:
            verificationData?.signature ??
            ledgerData?.signature ??
            null,

          chain_timestamp:
            verificationData?.chain_timestamp ??
            verificationData?.ledger_tx?.chain_timestamp ??
            ledgerData?.chain_timestamp ??
            ledgerData?.ledger_tx?.chain_timestamp ??
            null,

        };


        setVerificationResult(
          normalized
        );


        const normalizedStatus =
          String(
            verificationData?.status ||
              ledgerData?.status ||
              ""
          ).toUpperCase();


        if (
          normalizedStatus ===
          "VERIFIED"
        ) {

          setVerificationStatus(
            "VERIFIED"
          );

        } else if (
          normalizedStatus ===
          "TAMPERED"
        ) {

          setVerificationStatus(
            "TAMPERED"
          );

        } else if (
          normalizedStatus ===
          "UNDER_REVIEW"
        ) {

          setVerificationStatus(
            "UNDER_REVIEW"
          );

        } else {

          /*
           * If backend does not explicitly
           * return a status, use hash match.
           */

          const stored =
            verificationData?.stored_hash ??
            verificationData?.storedHash ??
            ledgerData?.content_hash ??
            ledgerData?.contentHash ??
            null;


          const recomputed =
            verificationData?.computed_hash ??
            verificationData?.recomputed_hash ??
            verificationData?.recomputedHash ??
            null;


          if (
            stored &&
            recomputed
          ) {

            setVerificationStatus(
              stored === recomputed
                ? "VERIFIED"
                : "TAMPERED"
            );

          } else {

            setVerificationStatus(
              "PENDING"
            );

          }

        }

      } catch (
        error
      ) {

        console.error(
          "Integrity verification failed:",
          error
        );


        setVerificationStatus(
          "ERROR"
        );


        setVerificationError(
          error?.message ||
            "Unable to verify ledger integrity."
        );

      }

    };


  /* ==========================================================
     INITIAL VERIFICATION
  ========================================================== */

  useEffect(() => {

    if (isDemoHall) {
      return;
    }


    if (eventId) {

      verifyIntegrity();

    } else {

      setVerificationStatus(
        "PENDING"
      );

    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    eventId,
    isDemoHall,
    exam?.id,
  ]);


  /* ==========================================================
     DISPLAY VALUES
  ========================================================== */

  const result =
    verificationResult ||
    {};


  const storedFingerprint =
    result?.stored_hash ??
    result?.storedHash ??
    result?.content_hash ??
    result?.contentHash ??
    ledgerRecord?.content_hash ??
    ledgerRecord?.contentHash ??
    "Pending";


  const recomputedFingerprint =
    result?.computed_hash ??
    result?.recomputed_hash ??
    result?.recomputedHash ??
    result?.computedHash ??
    "Pending";


  const transaction =
    result?.tx_ref ??
    result?.ledger_tx?.tx_id ??
    ledgerRecord?.tx_ref ??
    ledgerRecord?.ledger_tx?.tx_id ??
    ledgerRecord?.transaction ??
    "Pending";


  const blockReference =
    result?.block_ref ??
    result?.ledger_tx?.block_ref ??
    ledgerRecord?.block_ref ??
    ledgerRecord?.ledger_tx?.block_ref ??
    ledgerRecord?.blockReference ??
    "Pending";


  const signature =
    result?.signature ??
    ledgerRecord?.signature ??
    "Pending";


  const confirmations =
    result?.node_confirmations ??
    result?.ledger_tx?.node_confirmations ??
    ledgerRecord?.node_confirmations ??
    ledgerRecord?.ledger_tx?.node_confirmations ??
    "Pending";


  const chainTimestamp =
    result?.chain_timestamp ??
    result?.ledger_tx?.chain_timestamp ??
    ledgerRecord?.chain_timestamp ??
    ledgerRecord?.ledger_tx?.chain_timestamp ??
    "Pending";


  const recordId =
    result?.record_id ??
    ledgerRecord?.record_id ??
    hall?.demoIntegrity?.recordId ??
    "Pending";


  /* ==========================================================
     HASH MATCH
  ========================================================== */

  const hashesMatch =
    storedFingerprint !== "Pending" &&
    recomputedFingerprint !== "Pending" &&
    storedFingerprint ===
      recomputedFingerprint;


  /* ==========================================================
     SAVE LOCAL INVESTIGATION NOTE
  ========================================================== */

  const handleSaveNote =
    () => {

      /*
       * This note is intentionally local
       * to the Chief Investigator UI.
       *
       * It does not modify the backend
       * review/ledger record.
       */

      setNoteSaved(
        true
      );


      setTimeout(() => {

        setNoteSaved(
          false
        );

      }, 2500);

    };


  /* ==========================================================
     BACK
  ========================================================== */

  const handleBack =
    () => {

      if (
        typeof onBack ===
        "function"
      ) {

        onBack();

      }

    };


  /* ==========================================================
     RENDER
  ========================================================== */

  return (

    <main className="integrity-investigation">


      {/* ======================================================
         TOP BAR
      ======================================================= */}

      <header className="investigation-header">

        <button
          className="investigation-back-btn"
          onClick={handleBack}
        >
          ← Back to Command Center
        </button>


        <div className="investigation-header-right">

          {isDemoHall && (

            <span className="investigation-demo-badge">
              DEMO · SHOWCASE DATA
            </span>

          )}

          {!isDemoHall && (

            <span className="investigation-live-badge">
              LIVE · BACKEND VERIFIED
            </span>

          )}

        </div>

      </header>


      {/* ======================================================
         TITLE
      ======================================================= */}

      <section className="investigation-title-section">

        <div>

          <span className="investigation-eyebrow">
            INTEGRITY INVESTIGATION
          </span>


          <h1>
            {hall?.hallName ||
              hall?.hallId ||
              "Examination Hall"}
          </h1>


          <p>

            {exam?.name ||
              "Examination"}

            {" · "}

            {exam?.subject ||
              "Examination Integrity"}

          </p>

        </div>


        <StatusBadge
          status={
            verificationStatus
          }
        />

      </section>


      {/* ======================================================
         DEMO NOTICE
      ======================================================= */}

      {isDemoHall && (

        <section className="investigation-demo-notice">

          <div className="demo-notice-icon">
            i
          </div>


          <div>

            <strong>
              Showcase / Demo Record
            </strong>


            <p>
              This hall uses frontend demo
              data for the presentation flow.
              It is not a live backend ledger
              record.
            </p>

          </div>

        </section>

      )}


      {/* ======================================================
         TAMPER ALERT
      ======================================================= */}

      {verificationStatus ===
        "TAMPERED" && (

        <section className="investigation-alert tampered">

          <div className="investigation-alert-icon">
            !
          </div>


          <div>

            <strong>
              Ledger Integrity Exception Detected
            </strong>


            <p>
              The stored content fingerprint
              does not match the recomputed
              fingerprint. The record requires
              investigation before being treated
              as verified.
            </p>

          </div>

        </section>

      )}


      {/* ======================================================
         VERIFIED MESSAGE
      ======================================================= */}

      {verificationStatus ===
        "VERIFIED" && (

        <section className="investigation-alert verified">

          <div className="investigation-alert-icon">
            ✓
          </div>


          <div>

            <strong>
              Ledger Integrity Verified
            </strong>


            <p>
              The stored fingerprint matches
              the recomputed fingerprint for
              this examination record.
            </p>

          </div>

        </section>

      )}


      {/* ======================================================
         UNDER REVIEW
      ======================================================= */}

      {verificationStatus ===
        "UNDER_REVIEW" && (

        <section className="investigation-alert review">

          <div className="investigation-alert-icon">
            •
          </div>


          <div>

            <strong>
              Examination Record Under Review
            </strong>


            <p>
              The record has not yet reached
              a final integrity verification
              state.
            </p>

          </div>

        </section>

      )}


      {/* ======================================================
         ERROR
      ======================================================= */}

      {verificationStatus ===
        "ERROR" && (

        <section className="investigation-alert error">

          <div className="investigation-alert-icon">
            !
          </div>


          <div>

            <strong>
              Verification Could Not Be Completed
            </strong>


            <p>
              {verificationError ||
                "The ledger verification service returned an error."}
            </p>

          </div>

        </section>

      )}


      {/* ======================================================
         MAIN CONTENT
      ======================================================= */}

      <div className="investigation-content">


        {/* ====================================================
           LEFT COLUMN
        ===================================================== */}

        <section className="investigation-main-panel">


          {/* ==================================================
             CRYPTOGRAPHIC COMPARISON
          =================================================== */}

          <FingerprintComparison
            stored={
              storedFingerprint
            }
            recomputed={
              recomputedFingerprint
            }
            status={
              verificationStatus
            }
          />


          {/* ==================================================
             LEDGER DETAILS
          =================================================== */}

          <div className="investigation-card">

            <div className="investigation-card-header">

              <div>

                <span className="investigation-eyebrow">
                  DISTRIBUTED LEDGER
                </span>


                <h3>
                  Ledger Anchoring Details
                </h3>

              </div>


              <span className="ledger-state">
                {isDemoHall
                  ? "SHOWCASE"
                  : "CONNECTED"}
              </span>

            </div>


            <div className="investigation-detail-grid">

              <DetailItem
                label="RECORD ID"
                value={recordId}
                mono
              />


              <DetailItem
                label="TRANSACTION"
                value={transaction}
                mono
              />


              <DetailItem
                label="BLOCK REFERENCE"
                value={blockReference}
                mono
              />


              <DetailItem
                label="SIGNATURE"
                value={signature}
                mono
              />


              <DetailItem
                label="NODE CONFIRMATIONS"
                value={
                  confirmations
                }
              />


              <DetailItem
                label="CHAIN TIMESTAMP"
                value={
                  chainTimestamp
                }
              />

            </div>

          </div>


          {/* ==================================================
             VERIFICATION RESULT
          =================================================== */}

          <div className="investigation-card">

            <div className="investigation-card-header">

              <div>

                <span className="investigation-eyebrow">
                  VERIFICATION RESULT
                </span>


                <h3>
                  Integrity Check
                </h3>

              </div>

            </div>


            <div className="verification-result-row">

              <div
                className={`verification-result-icon ${
                  verificationStatus
                    .toLowerCase()
                }`}
              >

                {verificationStatus ===
                  "VERIFIED"
                  ? "✓"
                  : verificationStatus ===
                      "TAMPERED"
                    ? "!"
                    : verificationStatus ===
                        "UNDER_REVIEW"
                      ? "•"
                      : "○"}

              </div>


              <div>

                <strong>
                  {verificationStatus ===
                  "VERIFIED"
                    ? "Hashes Match"

                    : verificationStatus ===
                        "TAMPERED"
                      ? "Hashes Do Not Match"

                      : verificationStatus ===
                          "UNDER_REVIEW"
                        ? "Verification Pending"

                        : verificationStatus ===
                            "CHECKING"
                          ? "Checking Integrity"

                          : "Verification Pending"}
                </strong>


                <p>

                  {hashesMatch
                    ? "The stored and recomputed fingerprints are identical."
                    : verificationStatus ===
                        "TAMPERED"
                      ? "The stored and recomputed fingerprints are different."
                      : verificationStatus ===
                          "UNDER_REVIEW"
                        ? "A final integrity decision is not yet available."
                        : "The system does not currently have enough information to establish a final match."}

                </p>

              </div>

            </div>


            {!isDemoHall && (

              <button
                className="investigation-verify-btn"
                onClick={
                  verifyIntegrity
                }
                disabled={
                  verificationStatus ===
                  "CHECKING"
                }
              >

                {verificationStatus ===
                "CHECKING"
                  ? "Verifying..."
                  : "Verify Integrity Again"}

              </button>

            )}

          </div>


          {/* ==================================================
             INVESTIGATION NOTES
          =================================================== */}

          <div className="investigation-card">

            <div className="investigation-card-header">

              <div>

                <span className="investigation-eyebrow">
                  CHIEF REVIEW
                </span>


                <h3>
                  Investigation Notes
                </h3>

              </div>

            </div>


            <textarea
              className="investigation-notes"
              placeholder="Record observations, findings or follow-up actions..."
              value={note}
              onChange={(event) =>
                setNote(
                  event.target.value
                )
              }
            />


            <div className="investigation-notes-footer">

              <span>
                Notes are stored locally
                in this investigation view.
              </span>


              <button
                className="investigation-save-btn"
                onClick={
                  handleSaveNote
                }
              >

                {noteSaved
                  ? "Saved ✓"
                  : "Save Note"}

              </button>

            </div>

          </div>

        </section>


        {/* ====================================================
           RIGHT SIDEBAR
        ===================================================== */}

        <aside className="investigation-sidebar">


          {/* ==================================================
             HALL SUMMARY
          =================================================== */}

          <div className="investigation-sidebar-card">

            <span className="investigation-eyebrow">
              HALL SUMMARY
            </span>


            <h3>
              {hall?.hallName ||
                hall?.hallId ||
                "Hall"}
            </h3>


            <div className="sidebar-summary-list">

              <div>

                <span>
                  Status
                </span>

                <StatusBadge
                  status={
                    verificationStatus
                  }
                />

              </div>


              <div>

                <span>
                  Seats
                </span>

                <strong>
                  {hall?.seats ??
                    "—"}
                </strong>

              </div>


              <div>

                <span>
                  Incidents
                </span>

                <strong>
                  {hall?.incidents ??
                    0}
                </strong>

              </div>


              <div>

                <span>
                  Last Verified
                </span>

                <strong>
                  {hall?.lastVerified ||
                    "Pending"}
                </strong>

              </div>

            </div>

          </div>


          {/* ==================================================
             DATA SOURCE
          =================================================== */}

          <div className="investigation-sidebar-card">

            <span className="investigation-eyebrow">
              DATA SOURCE
            </span>


            <div className="data-source-row">

              <div
                className={`data-source-dot ${
                  isDemoHall
                    ? "demo"
                    : "live"
                }`}
              />


              <div>

                <strong>
                  {isDemoHall
                    ? "Frontend Demo Data"
                    : "PEHRA Backend"}
                </strong>


                <span>
                  {isDemoHall
                    ? "Showcase record"
                    : "Live API + ledger verification"}
                </span>

              </div>

            </div>

          </div>


          {/* ==================================================
             ACTION SUMMARY
          =================================================== */}

          <div className="investigation-sidebar-card">

            <span className="investigation-eyebrow">
              CHIEF ACTION
            </span>


            <h3>

              {verificationStatus ===
              "TAMPERED"
                ? "Investigation Required"

                : verificationStatus ===
                    "VERIFIED"
                  ? "No Integrity Exception"

                  : "Continue Review"}

            </h3>


            <p className="sidebar-action-text">

              {verificationStatus ===
              "TAMPERED"

                ? "Compare the fingerprints, inspect the ledger anchoring details and document the investigation outcome."

                : verificationStatus ===
                    "VERIFIED"

                  ? "The ledger record currently passes the cryptographic integrity check."

                  : "Review the available examination information and record the appropriate investigation notes."}

            </p>

          </div>


        </aside>

      </div>


      {/* ======================================================
         FOOTER
      ======================================================= */}

      <footer className="investigation-footer">

        <span className="investigation-footer-dot" />


        <span>
          PEHRA · Examination Integrity
          Investigation
        </span>


        <span>
          {isDemoHall
            ? "SHOWCASE MODE"
            : "LIVE VERIFICATION MODE"}
        </span>

      </footer>

    </main>
  );
}