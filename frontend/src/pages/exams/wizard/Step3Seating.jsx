import React from "react";
import SeatGrid from "../../../components/seating/SeatGrid.jsx";

const ROW_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function Step3Seating({ formData, onChange }) {
  const seatingConfig = formData.seatingConfig || {
    rows: 6,
    columns: 10,
    aisles: [5],
    disabledSeats: [],
  };

  const rows = seatingConfig.rows || 6;
  const columns = seatingConfig.columns || 10;
  const aisles = seatingConfig.aisles || [];
  const disabledSeats = seatingConfig.disabledSeats || [];

  const totalSlots = rows * columns;
  const activeDesks = totalSlots - disabledSeats.length;

  const updateConfig = (patch) => {
    const updated = {
      ...seatingConfig,
      ...patch,
    };
    onChange("seatingConfig", updated);
    onChange("totalSeats", (updated.rows || rows) * (updated.columns || columns) - (updated.disabledSeats || disabledSeats).length);
    onChange("students", (updated.rows || rows) * (updated.columns || columns) - (updated.disabledSeats || disabledSeats).length);
  };

  const handleToggleSeat = (seatId) => {
    let nextDisabled;
    if (disabledSeats.includes(seatId)) {
      nextDisabled = disabledSeats.filter((s) => s !== seatId);
    } else {
      nextDisabled = [...disabledSeats, seatId];
    }
    updateConfig({ disabledSeats: nextDisabled });
  };

  const handleRowsChange = (val) => {
    const r = Math.max(2, Math.min(16, Number(val) || 2));
    updateConfig({ rows: r });
  };

  const handleColsChange = (val) => {
    const c = Math.max(2, Math.min(16, Number(val) || 2));
    updateConfig({ columns: c });
  };

  const toggleAisle = (colIndex) => {
    let nextAisles;
    if (aisles.includes(colIndex)) {
      nextAisles = aisles.filter((a) => a !== colIndex);
    } else {
      nextAisles = [...aisles, colIndex].sort((a, b) => a - b);
    }
    updateConfig({ aisles: nextAisles });
  };

  const applyStaggeredPattern = () => {
    const staggered = [];
    for (let r = 0; r < rows; r++) {
      const rowChar = ROW_LETTERS[r];
      for (let c = 1; c <= columns; c++) {
        if ((r + c) % 2 === 1) {
          staggered.push(`${rowChar}-${String(c).padStart(2, "0")}`);
        }
      }
    }
    updateConfig({ disabledSeats: staggered });
  };

  const clearDisabled = () => {
    updateConfig({ disabledSeats: [] });
  };

  return (
    <div className="wizard-step-content">
      <div className="step-intro">
        <h2>Step 3: Seating Grid & Desk Configuration</h2>
        <p>
          Configure the hall desk layout. Click individual desks to toggle disabled/empty spots or
          manage aisles.
        </p>
      </div>

      <div className="seating-controls-bar">
        <div className="control-group">
          <label>Rows:</label>
          <input
            type="number"
            min="2"
            max="16"
            value={rows}
            onChange={(e) => handleRowsChange(e.target.value)}
          />
        </div>

        <div className="control-group">
          <label>Columns:</label>
          <input
            type="number"
            min="2"
            max="16"
            value={columns}
            onChange={(e) => handleColsChange(e.target.value)}
          />
        </div>

        <div className="control-group aisle-selector">
          <label>Aisle Spacers (after column):</label>
          <div className="aisle-chips">
            {Array.from({ length: columns - 1 }, (_, i) => i + 1).map((col) => (
              <button
                key={col}
                type="button"
                className={`aisle-chip ${aisles.includes(col) ? "active" : ""}`}
                onClick={() => toggleAisle(col)}
              >
                Col {col}
              </button>
            ))}
          </div>
        </div>

        <div className="quick-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={applyStaggeredPattern}
            title="Disable alternating seats for social distancing"
          >
            Staggered Pattern
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={clearDisabled}
          >
            Reset All Active
          </button>
        </div>
      </div>

      {/* Seating Stats Banner */}
      <div className="seating-stats-banner">
        <div className="stat-pill">
          <span>Active Desks:</span>
          <strong>{activeDesks}</strong>
        </div>
        <div className="stat-pill">
          <span>Disabled/Buffer:</span>
          <strong>{disabledSeats.length}</strong>
        </div>
        <div className="stat-pill">
          <span>Total Grid Slots:</span>
          <strong>{totalSlots}</strong>
        </div>
        <div className="stat-hint">
          💡 Click any seat tile in the grid below to toggle its active/disabled state.
        </div>
      </div>

      {/* Interactive Seating Matrix */}
      <div className="seating-grid-canvas">
        <SeatGrid
          rows={rows}
          columns={columns}
          aisles={aisles}
          disabledSeats={disabledSeats}
          onToggleSeat={handleToggleSeat}
          mode="toggle"
        />
      </div>
    </div>
  );
}
