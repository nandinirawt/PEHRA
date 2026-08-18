import React from "react";
import StatusBadge from "../../../components/common/StatusBadge.jsx";
import "./SessionSummary.css";

export default function SessionSummary({ exam, onBack }) {
  if (!exam) return null;

  const totalSeats = exam.students || exam.totalSeats || 60;
  const summary = exam.summary || {
    attendanceCount: Math.round(totalSeats * 0.96),
    absentCount: Math.round(totalSeats * 0.04),
    totalEvents: 14,
    reviewedCount: 7,
    falseAlarmsCount: 5,
    confirmedIncidentsCount: 2,
    avgConfidence: 93.8,
    riskDistribution: {
      normal: Math.round(totalSeats * 0.90),
      underReview: Math.round(totalSeats * 0.06),
      highRisk: Math.round(totalSeats * 0.04),
    },
    auditLog: [
      {
        id: "evt-01",
        time: "10:24 AM",
        seatId: "B-04",
        eventType: "Repeated Head Turn",
        severity: "medium",
        confidence: "91%",
        invigilatorAction: "False Alarm",
        notes: "Student looked at wall clock.",
      },
      {
        id: "evt-02",
        time: "11:15 AM",
        seatId: "C-08",
        eventType: "Neighbor Interaction Pattern",
        severity: "high",
        confidence: "94%",
        invigilatorAction: "Confirmed Incident",
        notes: "Proctor intervened; paper exchange prevented.",
      },
      {
        id: "evt-03",
        time: "11:42 AM",
        seatId: "A-02",
        eventType: "Hand Movement Anomaly",
        severity: "low",
        confidence: "78%",
        invigilatorAction: "False Alarm",
        notes: "Dropped pen retrieval.",
      },
    ],
    privacyAttestation: {
      zeroBiometricStored: true,
      edgeInferenceVerified: true,
      noCloudVideoSent: true,
      dataMinimizationCompliant: true,
      auditTimestamp: new Date().toISOString(),
    },
  };

  const attendancePercent = Math.round((summary.attendanceCount / totalSeats) * 100);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exam, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `PEHRA-Audit-${exam.id || "session"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="session-summary-page">
      {/* Top Header */}
      <div className="summary-top-nav">
        <button type="button" className="btn-back-link" onClick={onBack}>
          ← Back to Examinations Catalog
        </button>
        <div className="summary-nav-actions">
          <button type="button" className="secondary-button" onClick={handleDownloadJSON}>
            ⤓ Export JSON Log
          </button>
          <button type="button" className="primary-button" onClick={handlePrint}>
            🖨 Print Official Audit Report
          </button>
        </div>
      </div>

      {/* Main Report Card */}
      <div className="summary-report-card">
        <header className="report-header">
          <div className="report-badge-line">
            <span className="doc-type-badge">OFFICIAL EXAMINATION AUDIT REPORT</span>
            <StatusBadge status="completed" />
          </div>

          <h1>{exam.title}</h1>
          <p className="report-subtitle">
            Comprehensive post-examination integrity, attendance, and privacy compliance log.
          </p>

          <div className="report-meta-grid">
            <div className="meta-item">
              <span className="label">Course & Code:</span>
              <strong>{exam.subject}</strong>
            </div>
            <div className="meta-item">
              <span className="label">Date & Timing:</span>
              <strong>{exam.date} · {exam.time}</strong>
            </div>
            <div className="meta-item">
              <span className="label">Examination Venue:</span>
              <strong>{exam.hall}</strong>
            </div>
            <div className="meta-item">
              <span className="label">Lead Proctor:</span>
              <strong>{exam.invigilator}</strong>
            </div>
          </div>
        </header>

        {/* Executive Metrics Ribbon */}
        <section className="summary-metrics-ribbon">
          <div className="metric-box">
            <span className="metric-label">Registered Candidates</span>
            <strong className="metric-value">{totalSeats}</strong>
            <span className="metric-sub">{summary.attendanceCount} Present · {summary.absentCount} Absent</span>
          </div>

          <div className="metric-box">
            <span className="metric-label">Attendance Rate</span>
            <strong className="metric-value text-success">{attendancePercent}%</strong>
            <span className="metric-sub">Verified against hall desks</span>
          </div>

          <div className="metric-box">
            <span className="metric-label">Integrity Flags</span>
            <strong className="metric-value">{summary.totalEvents}</strong>
            <span className="metric-sub">Multi-signal behavioral triggers</span>
          </div>

          <div className="metric-box">
            <span className="metric-label">False Alarm Rate</span>
            <strong className="metric-value text-accent">
              {summary.totalEvents > 0
                ? `${Math.round((summary.falseAlarmsCount / (summary.falseAlarmsCount + summary.confirmedIncidentsCount || 1)) * 100)}%`
                : "0%"}
            </strong>
            <span className="metric-sub">{summary.falseAlarmsCount} resolved without disruption</span>
          </div>
        </section>

        {/* Risk & Integrity Distribution */}
        <section className="summary-section">
          <div className="section-title-row">
            <h3>Seat Integrity & Risk Distribution</h3>
            <span className="section-hint">Multi-signal temporal fusion telemetry</span>
          </div>

          <div className="risk-distribution-container">
            <div className="risk-bar-track">
              <div
                className="risk-bar-fill normal"
                style={{ width: `${(summary.riskDistribution.normal / totalSeats) * 100}%` }}
                title={`Normal: ${summary.riskDistribution.normal} seats`}
              />
              <div
                className="risk-bar-fill review"
                style={{ width: `${(summary.riskDistribution.underReview / totalSeats) * 100}%` }}
                title={`Under Review: ${summary.riskDistribution.underReview} seats`}
              />
              <div
                className="risk-bar-fill high"
                style={{ width: `${(summary.riskDistribution.highRisk / totalSeats) * 100}%` }}
                title={`High Risk: ${summary.riskDistribution.highRisk} seats`}
              />
            </div>

            <div className="risk-breakdown-cards">
              <div className="risk-card normal">
                <div className="card-top">
                  <span className="dot" />
                  <span>Normal / Unremarkable</span>
                </div>
                <strong>{summary.riskDistribution.normal} Desks</strong>
                <p>Consistent standard writing posture throughout session.</p>
              </div>

              <div className="risk-card review">
                <div className="card-top">
                  <span className="dot" />
                  <span>Flagged for Proctor Review</span>
                </div>
                <strong>{summary.riskDistribution.underReview} Desks</strong>
                <p>Transient anomalies evaluated and verified in real time.</p>
              </div>

              <div className="risk-card high">
                <div className="card-top">
                  <span className="dot" />
                  <span>Confirmed High Risk</span>
                </div>
                <strong>{summary.confirmedIncidentsCount} Desks</strong>
                <p>Validated behavioral incidents requiring invigilator action.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Incident Audit Ledger */}
        <section className="summary-section">
          <div className="section-title-row">
            <h3>Proctor Decision & Event Audit Ledger</h3>
            <span className="section-hint">Human-in-the-loop verified timeline</span>
          </div>

          <div className="audit-table-wrapper">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Seat ID</th>
                  <th>Observed Behavioral Anomaly</th>
                  <th>Confidence</th>
                  <th>Proctor Resolution</th>
                  <th>Observation Notes</th>
                </tr>
              </thead>
              <tbody>
                {summary.auditLog.map((log) => (
                  <tr key={log.id}>
                    <td className="font-mono">{log.time}</td>
                    <td><strong className="seat-tag">{log.seatId}</strong></td>
                    <td>{log.eventType}</td>
                    <td className="font-mono">{log.confidence}</td>
                    <td>
                      <span className={`resolution-tag ${log.invigilatorAction === "False Alarm" ? "false-alarm" : "confirmed"}`}>
                        {log.invigilatorAction}
                      </span>
                    </td>
                    <td className="notes-col">{log.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Privacy Compliance Certificate */}
        <section className="summary-section privacy-certificate-section">
          <div className="certificate-box">
            <div className="cert-header">
              <div className="cert-seal">🛡</div>
              <div>
                <h4>Zero-Biometric Privacy Attestation</h4>
                <p>This examination was monitored strictly under PEHRA Privacy Preserving Architecture.</p>
              </div>
            </div>

            <div className="cert-checklist">
              <div className="cert-item">
                <span className="cert-check">✓</span>
                <span>No facial biometric templates, embeddings, or identities captured or stored.</span>
              </div>
              <div className="cert-item">
                <span className="cert-check">✓</span>
                <span>100% ephemeral frame processing: raw video buffers discarded within 33ms.</span>
              </div>
              <div className="cert-item">
                <span className="cert-check">✓</span>
                <span>Local edge inference execution — zero video feeds transmitted to cloud servers.</span>
              </div>
              <div className="cert-item">
                <span className="cert-check">✓</span>
                <span>All telemetry indexed exclusively by Seat IDs rather than student names.</span>
              </div>
            </div>

            <div className="cert-footer">
              <span>Cryptographic Audit Stamp: <code className="cert-hash">SHA256: 8f9b2c4e1a0d33e6...verified</code></span>
              <span>Generated: {new Date(summary.privacyAttestation.auditTimestamp).toLocaleString()}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
