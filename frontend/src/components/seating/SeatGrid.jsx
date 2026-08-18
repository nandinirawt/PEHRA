import React from "react";
import SeatCell from "./SeatCell.jsx";

const ROW_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function SeatGrid({
  rows = 6,
  columns = 10,
  aisles = [5],
  disabledSeats = [],
  zoneAssignments = {}, // { "A-01": "Zone A", "A-02": "Zone A" }
  zoneColors = {}, // { "Zone A": "#ffad1f", "Zone B": "#3b82f6" }
  onToggleSeat,
  onSelectSeat,
  selectedSeats = [],
  readOnly = false,
  mode = "toggle", // 'toggle' | 'select' | 'view'
}) {
  const rowList = Array.from({ length: Math.min(rows, 26) }, (_, i) => ROW_LETTERS[i]);
  const colList = Array.from({ length: columns }, (_, i) => i + 1);

  return (
    <div className="seat-grid-container">
      {/* Front of Hall indicator */}
      <div className="podium-indicator">
        <span className="podium-line" />
        <span className="podium-text">FRONT OF HALL / INVIGILATOR PODIUM</span>
        <span className="podium-line" />
      </div>

      <div className="seat-matrix-wrapper">
        <div className="seat-matrix">
          {rowList.map((rowLabel) => (
            <div key={rowLabel} className="seat-row">
              <span className="row-header">{rowLabel}</span>

              <div className="row-seats">
                {colList.map((colNum) => {
                  const seatId = `${rowLabel}-${String(colNum).padStart(2, "0")}`;
                  const isDisabled = disabledSeats.includes(seatId);
                  const isSelected = selectedSeats.includes(seatId);
                  const zone = zoneAssignments[seatId] || null;
                  const zoneColor = zone ? zoneColors[zone] : null;
                  const isAisleAfter = aisles.includes(colNum);

                  return (
                    <React.Fragment key={seatId}>
                      <SeatCell
                        seatId={seatId}
                        rowLabel={rowLabel}
                        colNumber={colNum}
                        isDisabled={isDisabled}
                        isSelected={isSelected}
                        zone={zone}
                        zoneColor={zoneColor}
                        mode={mode}
                        onClick={(id) => {
                          if (readOnly) return;
                          if (mode === "toggle" && onToggleSeat) {
                            onToggleSeat(id);
                          } else if (mode === "select" && onSelectSeat) {
                            onSelectSeat(id);
                          }
                        }}
                      />
                      {isAisleAfter && <div className="aisle-spacer" title="Aisle" />}
                    </React.Fragment>
                  );
                })}
              </div>

              <span className="row-header end">{rowLabel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
