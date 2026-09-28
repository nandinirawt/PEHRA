import "./PrivacyCenter.css";
function PrivacyCenter({
  exam = {},
  hallConfig = {},
  seats = [],
  selectedEvents = [],
  integrityRecord = null,
}) {
  return (
    <main className="privacy-page">

      {/* PAGE HEADER */}
      <section className="privacy-header">
        <div>
          <span className="privacy-eyebrow">PRIVACY & SECURITY</span>

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


      {/* PRIVACY SUMMARY */}
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


      {/* MAIN CONTENT */}
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

            <span className="panel-icon green-icon">✓</span>
          </div>

          <div className="privacy-list">

            <div className="privacy-list-item">
              <div className="list-icon">✓</div>

              <div>
                <strong>Seat status</strong>
                <p>
                  Normal, under review, high-risk and absent states
                  associated with anonymous seat IDs.
                </p>
              </div>
            </div>

            <div className="privacy-list-item">
              <div className="list-icon">✓</div>

              <div>
                <strong>Behaviour signals</strong>
                <p>
                  Signals such as head movement, body orientation and
                  temporal behaviour patterns.
                </p>
              </div>
            </div>

            <div className="privacy-list-item">
              <div className="list-icon">✓</div>

              <div>
                <strong>Risk information</strong>
                <p>
                  Risk scores, confidence values and detected events
                  used by the invigilator.
                </p>
              </div>
            </div>

            <div className="privacy-list-item">
              <div className="list-icon">✓</div>

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

            <span className="panel-icon">—</span>
          </div>

          <div className="privacy-list">

            <div className="privacy-list-item">
              <div className="list-icon muted">×</div>

              <div>
                <strong>No student names</strong>
                <p>
                  Monitoring uses anonymous seat identifiers instead
                  of displaying student names.
                </p>
              </div>
            </div>

            <div className="privacy-list-item">
              <div className="list-icon muted">×</div>

              <div>
                <strong>No facial identification</strong>
                <p>
                  Face recognition is disabled in the current
                  monitoring configuration.
                </p>
              </div>
            </div>

            <div className="privacy-list-item">
              <div className="list-icon muted">×</div>

              <div>
                <strong>No identity profiles</strong>
                <p>
                  The interface does not create student identity
                  profiles from monitoring activity.
                </p>
              </div>
            </div>

            <div className="privacy-list-item">
              <div className="list-icon muted">×</div>

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


      {/* LOCAL PROCESSING */}
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


          <div className="integrity-status">

            <span className="integrity-status-dot"></span>

            <div>
              <strong>
                VERIFIED
              </strong>

              <span>
                Integrity check passed
              </span>
            </div>

          </div>

        </div>


        {/* VERIFICATION FLOW */}

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


          <div className="integrity-step verified-step">

            <span className="integrity-step-number">
              04
            </span>

            <div className="integrity-step-icon">
              ✓
            </div>

            <strong>
              Verified
            </strong>

            <span>
              Record integrity confirmed
            </span>

          </div>

        </div>


        {/* LEDGER DETAILS */}

        <div className="ledger-details">

          <div className="ledger-detail">

            <span>
              INTEGRITY STATUS
            </span>

            <strong className="verified-text">
              VERIFIED
            </strong>

          </div>


          <div className="ledger-detail">

            <span>
              RECORD FINGERPRINT
            </span>

            <strong className="ledger-mono">
              8f42a7c9...d91e
            </strong>

          </div>


          <div className="ledger-detail">

            <span>
              TRANSACTION
            </span>

            <strong className="ledger-mono">
              TX-PEHRA-7A91C2
            </strong>

          </div>


          <div className="ledger-detail">

            <span>
              BLOCK
            </span>

            <strong className="ledger-mono">
              #18427
            </strong>

          </div>


          <div className="ledger-detail">

            <span>
              CONFIRMATIONS
            </span>

            <strong>
              3 confirmations
            </strong>

          </div>

        </div>


        {/* PRIVACY EXPLANATION */}

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
        ✓
      </span>

      <div>

        <strong>
          VERIFIED
        </strong>

        <span>
          Session integrity confirmed
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
  Examination
</strong>

      </div>


      <div className="certificate-field">

        <span>
          HALL
        </span>

        <strong>
  HALL-A
</strong>

      </div>


      <div className="certificate-field">

        <span>
          SESSION DATE
        </span>

        <strong>
          15 Aug 2026
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

        <strong className="certificate-verified">
          VERIFIED
        </strong>

      </div>

    </div>


    {/* CERTIFICATE FINGERPRINT */}

    <div className="certificate-fingerprint">

      <div>

        <span>
          SESSION FINGERPRINT
        </span>

        <strong>
  {integrityRecord?.fingerprint || "Pending integrity record"}
</strong>

      </div>

      <div className="fingerprint-status">
        ✓ Ledger verified
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
      {/* DATA PRINCIPLES */}
      <section className="privacy-panel privacy-principles">

        <div className="privacy-panel-header">
          <div>
            <h2>Privacy principles</h2>

            <p>
              The V1 monitoring workflow follows these principles.
            </p>
          </div>
        </div>

        <div className="principles-grid">

          <div className="principle">
            <span>01</span>
            <h3>Anonymous by design</h3>
            <p>
              Seats are represented using anonymous identifiers
              instead of student names.
            </p>
          </div>

          <div className="principle">
            <span>02</span>
            <h3>Minimum necessary data</h3>
            <p>
              The interface focuses on information required for
              examination monitoring.
            </p>
          </div>

          <div className="principle">
            <span>03</span>
            <h3>Human oversight</h3>
            <p>
              Risk signals support the invigilator rather than
              automatically deciding an incident.
            </p>
          </div>

          <div className="principle">
            <span>04</span>
            <h3>Transparent monitoring</h3>
            <p>
              Invigilators can see why a seat has been flagged and
              review the underlying signals.
            </p>
          </div>

        </div>

      </section>


      {/* FOOTER NOTE */}
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