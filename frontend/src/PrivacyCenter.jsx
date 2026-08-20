import "./PrivacyCenter.css";

function PrivacyCenter() {
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
          <span className="privacy-status-dot"></span>
          Privacy Protected
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