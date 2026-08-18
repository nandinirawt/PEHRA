import React from "react";
import { DEFAULT_HALLS } from "../../../api/contracts.js";

export default function Step2Hall({ formData, onChange }) {
  const selectedHallId = formData.hallId || "hall-a";

  const handleSelectPreset = (hall) => {
    onChange("hallId", hall.id);
    onChange("hall", hall.name.split("—")[0].trim());
    onChange("students", hall.capacity);
    onChange("totalSeats", hall.capacity);

    // Update seating config to match hall presets
    onChange("seatingConfig", {
      rows: hall.rows,
      columns: hall.columns,
      aisles: hall.columns > 8 ? [Math.floor(hall.columns / 2)] : [],
      disabledSeats: [],
    });
  };

  return (
    <div className="wizard-step-content">
      <div className="step-intro">
        <h2>Step 2: Hall & Environmental Configuration</h2>
        <p>Select the physical examination venue or configure custom hall dimensions.</p>
      </div>

      <div className="halls-preset-grid">
        {DEFAULT_HALLS.map((hall) => {
          const isSelected = selectedHallId === hall.id;
          return (
            <div
              key={hall.id}
              className={`hall-card ${isSelected ? "selected" : ""}`}
              onClick={() => handleSelectPreset(hall)}
            >
              <div className="hall-card-header">
                <span className="hall-name">{hall.name}</span>
                <span className={`hall-radio ${isSelected ? "checked" : ""}`} />
              </div>

              <div className="hall-specs">
                <div className="spec-item">
                  <span className="spec-label">Capacity</span>
                  <strong>{hall.capacity} Desks</strong>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Layout</span>
                  <strong>{hall.rows} Rows × {hall.columns} Cols</strong>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Lighting</span>
                  <strong>{hall.lightingRating}</strong>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Cam Mounts</span>
                  <strong>{hall.cameraSockets} Sockets</strong>
                </div>
              </div>

              <div className="hall-zones-list">
                <span className="zones-label">Coverage Zones:</span>
                <div className="zone-pills">
                  {hall.zones.map((z) => (
                    <span key={z} className="zone-pill">{z}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="environmental-check-box">
        <div className="check-item">
          <span className="check-icon">✓</span>
          <div>
            <strong>Ambient Lighting Check</strong>
            <p>Indoor illumination verified within standard examination range (380–500 lux).</p>
          </div>
        </div>
        <div className="check-item">
          <span className="check-icon">✓</span>
          <div>
            <strong>Acoustic & Vibration Thresholds</strong>
            <p>Background environmental noise baseline calibrated to normal silence levels.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
