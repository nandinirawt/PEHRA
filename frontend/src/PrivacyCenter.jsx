import { useEffect, useState } from "react";
import "./PrivacyCenter.css";

function PrivacyCenter({
  exam = {},
  hallConfig = {},
  seats = [],
  selectedEvents = [],
  integrityRecord = null,
}) {
  // =========================================================
  // INTEGRITY / LEDGER STATE
  // =========================================================

  const [integrityStatus, setIntegrityStatus] = useState("CHECKING");
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationError, setVerificationError] = useState("");
  const [storedIntegrityRecord, setStoredIntegrityRecord] = useState(null);

  const API_BASE_URL = "http://localhost:8000";

  // =========================================================
  // LOAD LATEST INTEGRITY RECORD
  // =========================================================

  useEffect(() => {
    const savedRecord = localStorage.getItem("pehraIntegrityRecord");

    if (!savedRecord) {
      setStoredIntegrityRecord(null);
      setVerificationResult(null);
      setIntegrityStatus("PENDING");
      return;
    }

    try {
      const record = JSON.parse(savedRecord);

      if (!record?.event_id) {
        setStoredIntegrityRecord(null);
        setVerificationResult(null);
        setIntegrityStatus("PENDING");
        return;
      }

      setStoredIntegrityRecord(record);
    } catch (error) {
      console.error("Invalid PEHRA integrity record:", error);

      setStoredIntegrityRecord(null);
      setVerificationResult(null);
      setIntegrityStatus("ERROR");
      setVerificationError("Invalid integrity record.");
    }
  }, []);

  // =========================================================
  // EVENT ID USED FOR VERIFICATION
  // =========================================================

  const eventId =
    storedIntegrityRecord?.event_id ||
    integrityRecord?.event_id ||
    selectedEvents?.[selectedEvents.length - 1]?.event_id ||
    null;

  // =========================================================
  // VERIFY LEDGER INTEGRITY
  // =========================================================

  const verifyIntegrity = async () => {
    if (!eventId) {
      setIntegrityStatus("PENDING");
      setVerificationResult(null);
      return;
    }

    try {
      setIntegrityStatus("CHECKING");
      setVerificationError("");

      const response = await fetch(
        `${API_BASE_URL}/api/ledger/verify/${encodeURIComponent(eventId)}`
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            `Integrity verification failed (${response.status}).`
        );
      }

      setVerificationResult(data);
      setIntegrityStatus(data?.status || "UNKNOWN");
    } catch (error) {
      console.error("Integrity verification failed:", error);

      setVerificationResult(null);
      setIntegrityStatus("ERROR");
      setVerificationError(
        error?.message ||
          "Unable to verify the anchored integrity record."
      );
    }
  };

  // =========================================================
  // AUTOMATIC VERIFICATION
  // =========================================================

  useEffect(() => {
    if (!eventId) {
      setIntegrityStatus("PENDING");
      return;
    }

    verifyIntegrity();
  }, [eventId]);

  // =========================================================
  // STATUS HELPERS
  // =========================================================

  const isVerified = integrityStatus === "VERIFIED";
  const isTampered = integrityStatus === "TAMPERED";

  const isChecking =
    integrityStatus === "CHECKING" ||
    integrityStatus === "PENDING";

  const statusClass = isTampered
    ? "tampered"
    : isVerified
      ? "verified"
      : "checking";

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <main className="privacy-page">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <section className="privacy-header">
        <div>
          <span className="privacy-eyebrow">
            PRIVACY & SECURITY
          </span>

          <h1>Privacy Center</h1>

          <p>
            Understand how PEHRA handles examination monitoring data
            while protecting student privacy.
          </p>
        </div>

        <div className="privacy-status">
          <div className="privacy-status-title">
            <span className="privacy-status-dot"></span>

            <strong>
              Privacy Protected
            </strong>
          </div>

          <div className="privacy-status-details">
            <span>
              <b>✓</b>
              Local processing
            </span>

            <span>
              <b>✓</b>
              Identity not captured
            </span>

            <span>
              <b>✓</b>
              Face recognition disabled
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRIVACY SUMMARY
      ====================================================== */}

      <section className="privacy-summary">

        <div className="privacy-summary-card">
          <span className="privacy-card-dot green"></span>

          <div>
            <span>Identity Data</span>
            <strong>Not Captured</strong>
          </div>
        </div>

        <div className="privacy-summary-card">
          <span className="privacy-card-dot green"></span>

          <div>
            <span>Face Recognition</span>
            <strong>Disabled</strong>
          </div>
        </div>

        <div className="privacy-summary-card">
          <span className="privacy-card-dot green"></span>

          <div>
            <span>Processing</span>
            <strong>Local</strong>
          </div>
        </div>

        <div className="privacy-summary-card">
          <span className="privacy-card-dot green"></span>

          <div>
            <span>Student Identity</span>
            <strong>Anonymous</strong>
          </div>
        </div>

      </section>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <section className="privacy-grid">

        {/* WHAT PEHRA MONITORS */}

        <div className="privacy-panel">

          <div className="privacy-panel-header">

            <div>
              <h2>What PEHRA monitors</h2>

              <p>
                PEHRA focuses on examination behaviour and seating
                information required for invigilation.
              </p>
            </div>

            <span className="panel-icon green-icon">
              ✓
            </span>

          </div>

          <div className="privacy-list">

            <div className="privacy-list-item">

              <div className="list-icon">
                ✓
              </div>

              <div>
                <strong>Seat status</strong>

                <p>
                  Normal, under review, high-risk and absent states
                  associated with anonymous seat IDs.
                </p>
              </div>

            </div>

            <div className="privacy-list-item">

              <div className="list-icon">
                ✓
              </div>

              <div>
                <strong>Behaviour signals</strong>

                <p>
                  Signals such as head movement, body orientation and
                  temporal behaviour patterns.
                </p>
              </div>

            </div>

            <div className="privacy-list-item">

              <div className="list-icon">
                ✓
              </div>

              <div>
                <strong>Risk information</strong>

                <p>
                  Risk scores, confidence values and detected events
                  used by the invigilator.
                </p>
              </div>

            </div>

            <div className="privacy-list-item">

              <div className="list-icon">
                ✓
              </div>

              <div>
                <strong>Camera coverage</strong>

                <p>
                  Camera zones and their mapping to anonymous exam
                  seat IDs.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* WHAT PEHRA DOES NOT CAPTURE */}

        <div className="privacy-panel">

          <div className="privacy-panel-header">

            <div>
              <h2>What PEHRA does not capture</h2>

              <p>
                Privacy-sensitive identity information is intentionally
                excluded from the monitoring interface.
              </p>
            </div>

            <span className="panel-icon">
              —
            </span>

          </div>

          <div className="privacy-list">

            <div className="privacy-list-item">

              <div className="list-icon muted">
                ×
              </div>

              <div>
                <strong>No student names</strong>

                <p>
                  Monitoring uses anonymous seat identifiers instead
                  of displaying student names.
                </p>
              </div>

            </div>

            <div className="privacy-list-item">

              <div className="list-icon muted">
                ×
              </div>

              <div>
                <strong>No facial identification</strong>

                <p>
                  Face recognition is disabled in the current
                  monitoring configuration.
                </p>
              </div>

            </div>

            <div className="privacy-list-item">

              <div className="list-icon muted">
                ×
              </div>

              <div>
                <strong>No identity profiles</strong>

                <p>
                  The interface does not create student identity
                  profiles from monitoring activity.
                </p>
              </div>

            </div>

            <div className="privacy-list-item">

              <div className="list-icon muted">
                ×
              </div>

              <div>
                <strong>No unnecessary personal information</strong>

                <p>
                  The monitoring workflow is designed around the
                  examination seat rather than personal identity.
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          LOCAL PROCESSING
      ====================================================== */}

      <section className="privacy-processing">

        <div className="processing-icon">
          ✓
        </div>

        <div>

          <h2>Processing locally</h2>

          <p>
            PEHRA is designed to process examination monitoring
            information locally wherever possible. The monitoring
            interface works with anonymous seat IDs and does not
            require student identity information to display risk
            information.
          </p>

        </div>

        <span className="processing-badge">
          Privacy First
        </span>

      </section>

      {/* =====================================================
          INTEGRITY & LEDGER
      ====================================================== */}

      <section className="integrity-panel">

        {/* HEADER */}

        <div className="integrity-header">

          <div>

            <span className="privacy-eyebrow">
              CHAIN OF CUSTODY
            </span>

            <h2>
              Integrity & Ledger
            </h2>

            <p>
              Confirmed examination records are fingerprinted and
              anchored to the integrity ledger for later verification.
            </p>

          </div>

          <div className={`integrity-status ${statusClass}`}>

            <span className="integrity-status-dot"></span>

            <div>

              <strong>
                {isTampered
                  ? "TAMPERED"
                  : isVerified
                    ? "VERIFIED"
                    : isChecking
                      ? "CHECKING"
                      : "ERROR"}
              </strong>

              <span>
                {isTampered
                  ? "Integrity check failed"
                  : isVerified
                    ? "Integrity check passed"
                    : isChecking
                      ? "Verifying record..."
                      : "Unable to verify record"}
              </span>

            </div>

          </div>

        </div>

        {/* =================================================
            TAMPER ALERT
        ================================================== */}

        {isTampered && (
          <div className="integrity-tamper-alert">

            <div className="tamper-alert-icon">
              !
            </div>

            <div>

              <strong>
                INTEGRITY COMPROMISED
              </strong>

              <p>
                The stored examination fingerprint does not match
                the recomputed fingerprint. The record may have been
                modified after it was anchored to the integrity ledger.
              </p>

              {verificationResult?.stored_hash && (
                <div className="tamper-hashes">

                  <div>
                    <span>
                      Stored hash
                    </span>

                    <code>
                      {verificationResult.stored_hash}
                    </code>
                  </div>

                  <div>
                    <span>
                      Recomputed hash
                    </span>

                    <code>
                      {verificationResult.recomputed_hash}
                    </code>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

        {/* =================================================
            VERIFICATION FLOW
        ================================================== */}

        <div className="integrity-flow">

          <div className="integrity-step">

            <span className="integrity-step-number">
              01
            </span>

            <div className="integrity-step-icon">
              ✓
            </div>

            <strong>
              Exam Record
            </strong>

            <span>
              Confirmed incident
            </span>

          </div>

          <div className="integrity-connector">
            →
          </div>

          <div className="integrity-step">

            <span className="integrity-step-number">
              02
            </span>

            <div className="integrity-step-icon">
              #
            </div>

            <strong>
              Fingerprint
            </strong>

            <span>
              Integrity hash generated
            </span>

          </div>

          <div className="integrity-connector">
            →
          </div>

          <div className="integrity-step">

            <span className="integrity-step-number">
              03
            </span>

            <div className="integrity-step-icon">
              ◈
            </div>

            <strong>
              Ledger
            </strong>

            <span>
              Record anchored
            </span>

          </div>

          <div className="integrity-connector">
            →
          </div>

          <div
            className={`integrity-step ${
              isTampered
                ? "tampered-step"
                : isVerified
                  ? "verified-step"
                  : ""
            }`}
          >

            <span className="integrity-step-number">
              04
            </span>

            <div className="integrity-step-icon">
              {isTampered
                ? "!"
                : isVerified
                  ? "✓"
                  : "…"}
            </div>

            <strong>
              {isTampered
                ? "Tampered"
                : isVerified
                  ? "Verified"
                  : "Checking"}
            </strong>

            <span>
              {isTampered
                ? "Fingerprint mismatch detected"
                : isVerified
                  ? "Record integrity confirmed"
                  : "Verifying record integrity"}
            </span>

          </div>

        </div>

        {/* =================================================
            LEDGER DETAILS
        ================================================== */}

        <div className="ledger-details">

          <div className="ledger-detail">

            <span>
              INTEGRITY STATUS
            </span>

            <strong
              className={
                isTampered
                  ? "tampered-text"
                  : isVerified
                    ? "verified-text"
                    : ""
              }
            >
              {isTampered
                ? "TAMPERED"
                : isVerified
                  ? "VERIFIED"
                  : isChecking
                    ? "CHECKING"
                    : "ERROR"}
            </strong>

          </div>

          <div className="ledger-detail">

            <span>
              RECORD FINGERPRINT
            </span>

            <strong className="ledger-mono">

              {verificationResult?.stored_hash
                ? `${verificationResult.stored_hash.slice(
                    0,
                    12
                  )}...${verificationResult.stored_hash.slice(-8)}`
                : "Pending"}

            </strong>

          </div>

          <div className="ledger-detail">

            <span>
              TRANSACTION
            </span>

            <strong className="ledger-mono">

              {verificationResult?.tx_ref ||
                storedIntegrityRecord?.ledger_tx?.tx_ref ||
                storedIntegrityRecord?.ledger_tx?.tx_id ||
                "Pending"}

            </strong>

          </div>

          <div className="ledger-detail">

            <span>
              BLOCK
            </span>

            <strong className="ledger-mono">

              {verificationResult?.block_ref ||
                storedIntegrityRecord?.ledger_tx?.block_ref ||
                "Pending"}

            </strong>

          </div>

          <div className="ledger-detail">

            <span>
              CONFIRMATIONS
            </span>

            <strong>

              {verificationResult?.node_confirmations != null
                ? `${verificationResult.node_confirmations} confirmation${
                    verificationResult.node_confirmations === 1
                      ? ""
                      : "s"
                  }`
                : storedIntegrityRecord?.ledger_tx
                    ?.node_confirmations != null
                  ? `${storedIntegrityRecord.ledger_tx.node_confirmations} confirmation${
                      storedIntegrityRecord.ledger_tx
                        .node_confirmations === 1
                        ? ""
                        : "s"
                    }`
                  : "N/A"}

            </strong>

          </div>

          <div className="ledger-detail">
                    <span>
  CHAIN TIMESTAMP
</span>
            <strong className="ledger-mono">
  {storedIntegrityRecord?.ledger_tx?.chain_timestamp ||
    verificationResult?.chain_timestamp ||
    "Pending"}
</strong>

          </div>

        </div>

        {/* =================================================
            MANUAL VERIFY BUTTON
        ================================================== */}

        <div className="ledger-verification-action">

          <button
            type="button"
            className="verify-integrity-btn"
            onClick={verifyIntegrity}
            disabled={!eventId || integrityStatus === "CHECKING"}
          >
            {integrityStatus === "CHECKING"
              ? "Verifying..."
              : "Verify Integrity"}
          </button>

        </div>

        {/* =================================================
            VERIFICATION RESULT
        ================================================== */}

        {verificationResult && (
          <div
            className={`integrity-verification-result ${
              integrityStatus === "VERIFIED"
                ? "verified"
                : "tampered"
            }`}
          >

            <div className="verification-result-header">

              <span>
                VERIFICATION RESULT
              </span>

              <strong>
                {verificationResult.status}
              </strong>

            </div>

            <div className="verification-hash-grid">

              <div className="ledger-detail">

                <span>
                  Stored Fingerprint
                </span>

                <strong>
                  {verificationResult.stored_hash || "—"}
                </strong>

              </div>

              <div className="ledger-detail">

                <span>
                  Recomputed Fingerprint
                </span>

                <strong>
                  {verificationResult.recomputed_hash || "—"}
                </strong>

              </div>

              <div className="ledger-detail">

                <span>
                  Transaction
                </span>

                <strong>
                  {verificationResult.tx_ref ||
                    storedIntegrityRecord?.ledger_tx?.tx_ref ||
                    "—"}
                </strong>

              </div>

              <div className="ledger-detail">

                <span>
                  Signature
                </span>

                <strong>
                  {verificationResult.signature || "—"}
                </strong>

              </div>

            </div>

            <div className="verification-check-line">

              {verificationResult.status === "VERIFIED"
                ? "✓ Hash match confirmed — integrity record is consistent."
                : "⚠ Hash mismatch — possible tampering or record inconsistency detected."}

            </div>

          </div>
        )}

        {/* =================================================
            VERIFICATION ERROR
        ================================================== */}

        {verificationError && (
          <div
            className="action-message"
            style={{ color: "#b42318" }}
          >
            <span className="privacy-dot"></span>
            {verificationError}
          </div>
        )}

        {/* =================================================
            PRIVACY EXPLANATION
        ================================================== */}

        <div className="ledger-privacy-note">

          <span className="ledger-privacy-icon">
            ✓
          </span>

          <div>

            <strong>
              Integrity proof, not identity storage
            </strong>

            <p>
              The ledger representation is used to verify the
              integrity of examination records. It does not store
              student names, facial identities or raw examination
              footage.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          SESSION INTEGRITY CERTIFICATE
      ====================================================== */}

      <section className="certificate-panel">

        <div className="certificate-header">

          <div>

            <span className="privacy-eyebrow">
              SESSION INTEGRITY
            </span>

            <h2>
              Integrity Certificate
            </h2>

            <p>
              A tamper-evident summary of the examination session
              generated after the monitoring session is completed.
            </p>

          </div>

          <div className="certificate-status">

            <span className="certificate-check">
              {isTampered
                ? "!"
                : isVerified
                  ? "✓"
                  : "…"}
            </span>

            <div>

              <strong
                className={
                  isTampered
                    ? "certificate-tampered"
                    : isVerified
                      ? "certificate-verified"
                      : ""
                }
              >
                {isTampered
                  ? "TAMPERED"
                  : isVerified
                    ? "VERIFIED"
                    : isChecking
                      ? "CHECKING"
                      : "ERROR"}
              </strong>

              <span>
                {isTampered
                  ? "Session integrity compromised"
                  : isVerified
                    ? "Session integrity confirmed"
                    : isChecking
                      ? "Checking session integrity"
                      : "Unable to verify session"}
              </span>

            </div>

          </div>

        </div>

        {/* CERTIFICATE BODY */}

        <div className="certificate-body">

          <div className="certificate-main">

            <div className="certificate-icon">
              ✓
            </div>

            <div>

              <span className="certificate-label">
                PEHRA SESSION
              </span>

              <h3>
                Examination Integrity Certificate
              </h3>

              <p>
                This certificate represents the integrity state of
                the completed examination monitoring session.
              </p>

            </div>

          </div>

          {/* SESSION INFORMATION */}

          <div className="certificate-grid">

            <div className="certificate-field">

              <span>
                EXAMINATION
              </span>

              <strong>
                {exam?.name || "Examination"}
              </strong>

            </div>

            <div className="certificate-field">

              <span>
                HALL
              </span>

              <strong>
                {exam?.hall_id ||
                  hallConfig?.hall_id ||
                  "HALL-A"}
              </strong>

            </div>

            <div className="certificate-field">

              <span>
                SESSION DATE
              </span>

              <strong>
                {exam?.date || "15 Aug 2026"}
              </strong>

            </div>

            <div className="certificate-field">

              <span>
                MONITORED SEATS
              </span>

              <strong>
                {seats?.length || 0}
              </strong>

            </div>

            <div className="certificate-field">

              <span>
                INCIDENTS REVIEWED
              </span>

              <strong>
                {selectedEvents?.length || 0}
              </strong>

            </div>

            <div className="certificate-field">

              <span>
                INTEGRITY STATE
              </span>

              <strong
                className={
                  isTampered
                    ? "certificate-tampered"
                    : isVerified
                      ? "certificate-verified"
                      : ""
                }
              >
                {isTampered
                  ? "TAMPERED"
                  : isVerified
                    ? "VERIFIED"
                    : isChecking
                      ? "CHECKING"
                      : "ERROR"}
              </strong>

            </div>

          </div>

          {/* CERTIFICATE FINGERPRINT */}

          <div className="certificate-fingerprint">

            <div>

              <span>
                SESSION FINGERPRINT
              </span>

              <strong className="ledger-mono">

                {verificationResult?.stored_hash ||
                  integrityRecord?.fingerprint ||
                  "Pending integrity record"}

              </strong>

            </div>

            <div className="fingerprint-status">

              {isTampered
                ? "⚠ Integrity compromised"
                : isVerified
                  ? "✓ Ledger verified"
                  : "⏳ Verification pending"}

            </div>

          </div>

          {/* FOOTER */}

          <div className="certificate-footer">

            <span>
              Generated from examination integrity record
            </span>

            <span>
              No student identity data included
            </span>

          </div>

        </div>

      </section>

      {/* =====================================================
          DATA PRINCIPLES
      ====================================================== */}

      <section className="privacy-panel privacy-principles">

        <div className="privacy-panel-header">

          <div>

            <h2>
              Privacy principles
            </h2>

            <p>
              The V1 monitoring workflow follows these principles.
            </p>

          </div>

        </div>

        <div className="principles-grid">

          <div className="principle">

            <span>
              01
            </span>

            <h3>
              Anonymous by design
            </h3>

            <p>
              Seats are represented using anonymous identifiers
              instead of student names.
            </p>

          </div>

          <div className="principle">

            <span>
              02
            </span>

            <h3>
              Minimum necessary data
            </h3>

            <p>
              The interface focuses on information required for
              examination monitoring.
            </p>

          </div>

          <div className="principle">

            <span>
              03
            </span>

            <h3>
              Human oversight
            </h3>

            <p>
              Risk signals support the invigilator rather than
              automatically deciding an incident.
            </p>

          </div>

          <div className="principle">

            <span>
              04
            </span>

            <h3>
              Transparent monitoring
            </h3>

            <p>
              Invigilators can see why a seat has been flagged and
              review the underlying signals.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER NOTE
      ====================================================== */}

      <div className="privacy-footer-note">

        <span className="privacy-footer-dot"></span>

        <span>
          PEHRA V1 · Anonymous monitoring · No identity data captured
        </span>

      </div>

    </main>
  );
}

export default PrivacyCenter;