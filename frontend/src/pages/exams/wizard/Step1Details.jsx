import React from "react";

export default function Step1Details({ formData, onChange, errors = {} }) {
  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return null;
    const [startH, startM] = formData.startTime.split(":").map(Number);
    const [endH, endM] = formData.endTime.split(":").map(Number);
    const totalMinutes = endH * 60 + endM - (startH * 60 + startM);
    if (totalMinutes <= 0) return null;
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs > 0 ? `${hrs} hr ` : ""}${mins > 0 ? `${mins} min` : ""}`;
  };

  const duration = calculateDuration();

  return (
    <div className="wizard-step-content">
      <div className="step-intro">
        <h2>Step 1: Examination Details</h2>
        <p>Define the essential academic and scheduling metadata for this examination session.</p>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label htmlFor="title">
            Examination Title <span className="required">*</span>
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g. Semester End Examination — Mathematics"
            value={formData.title || ""}
            onChange={(e) => onChange("title", e.target.value)}
            className={errors.title ? "input-error" : ""}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="subject">
            Subject & Course Code <span className="required">*</span>
          </label>
          <input
            id="subject"
            type="text"
            placeholder="e.g. Mathematics (MATH-401)"
            value={formData.subject || ""}
            onChange={(e) => onChange("subject", e.target.value)}
            className={errors.subject ? "input-error" : ""}
          />
          {errors.subject && <span className="error-text">{errors.subject}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="invigilator">
            Lead Invigilator / Proctor <span className="required">*</span>
          </label>
          <input
            id="invigilator"
            type="text"
            placeholder="e.g. Prof. Nandini Rawat"
            value={formData.invigilator || ""}
            onChange={(e) => onChange("invigilator", e.target.value)}
            className={errors.invigilator ? "input-error" : ""}
          />
          {errors.invigilator && <span className="error-text">{errors.invigilator}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="date">
            Examination Date <span className="required">*</span>
          </label>
          <input
            id="date"
            type="date"
            value={formData.date || ""}
            onChange={(e) => onChange("date", e.target.value)}
            className={errors.date ? "input-error" : ""}
          />
          {errors.date && <span className="error-text">{errors.date}</span>}
        </div>

        <div className="form-group time-range-group">
          <label>Schedule & Duration</label>
          <div className="time-inputs-row">
            <div>
              <span className="sub-label">Start Time</span>
              <input
                type="time"
                value={formData.startTime || "10:00"}
                onChange={(e) => onChange("startTime", e.target.value)}
              />
            </div>
            <span className="time-separator">to</span>
            <div>
              <span className="sub-label">End Time</span>
              <input
                type="time"
                value={formData.endTime || "13:00"}
                onChange={(e) => onChange("endTime", e.target.value)}
              />
            </div>
          </div>
          {duration && (
            <span className="duration-badge">⏱ Estimated Duration: {duration}</span>
          )}
        </div>

        <div className="form-group full-width">
          <label htmlFor="instructions">Special Invigilation Instructions</label>
          <textarea
            id="instructions"
            rows="3"
            placeholder="e.g. Non-programmable calculators permitted. No smartwatches. Offline environment enforced."
            value={formData.instructions || ""}
            onChange={(e) => onChange("instructions", e.target.value)}
          />
        </div>

        <div className="form-group full-width privacy-toggle-box">
          <div className="privacy-toggle-header">
            <div>
              <strong>Optional Incident Evidence Retention Mode</strong>
              <p>
                By default, PEHRA operates with 100% ephemeral processing (raw video frames are
                instantly discarded after anonymous pose extraction). Toggling this on keeps local
                short-window encrypted pose logs ONLY for confirmed high-risk incidents.
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={Boolean(formData.evidenceRetention)}
                onChange={(e) => onChange("evidenceRetention", e.target.checked)}
              />
              <span className="slider round" />
            </label>
          </div>
          <div className="privacy-badge-note">
            <span>🛡 Privacy Guarantee: Zero facial recognition or biometric embeddings are ever stored.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
