import React, { useState, useMemo } from "react";
import SeatGrid from "../../../components/seating/SeatGrid.jsx";

const ZONE_PALETTE = {
  "Zone A (Front)": "#ffad1f",
  "Zone B (Center)": "#3b82f6",
  "Zone C (Rear)": "#8b5cf6",
  "Zone D (Side)": "#10b981",
};

const ROW_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function Step5Calibration({ formData, onChange }) {
  const seatingConfig = formData.seatingConfig || { rows: 6, columns: 10, aisles: [5], disabledSeats: [] };
  const rows = seatingConfig.rows || 6;
  const columns = seatingConfig.columns || 10;
  const disabledSeats = seatingConfig.disabledSeats || [];

  const cameras = formData.cameras && formData.cameras.length > 0
    ? formData.cameras
    : [
        { id: "cam-01", zone: "Zone A (Front)" },
        { id: "cam-02", zone: "Zone B (Center)" },
        { id: "cam-03", zone: "Zone C (Rear)" },
      ];

  const availableZones = useMemo(() => {
    return Array.from(new Set(cameras.map((c) => c.zone || "Zone A (Front)")));
  }, [cameras]);

  const [activeZone, setActiveZone] = useState(availableZones[0] || "Zone A (Front)");

  // Zone assignments stored in calibration.zoneMap
  const initialMap = useMemo(() => {
    if (formData.calibration && formData.calibration.zoneMap) {
      return formData.calibration.zoneMap;
    }
    // Auto-generate sensible default mapping based on rows
    const map = {};
    const zoneCount = Math.max(1, availableZones.length);
    const rowsPerZone = Math.ceil(rows / zoneCount);

    for (let r = 0; r < rows; r++) {
      const rowChar = ROW_LETTERS[r];
      const zoneIdx = Math.min(Math.floor(r / rowsPerZone), zoneCount - 1);
      const zoneName = availableZones[zoneIdx] || availableZones[0];

      for (let c = 1; c <= columns; c++) {
        const seatId = `${rowChar}-${String(c).padStart(2, "0")}`;
        if (!disabledSeats.includes(seatId)) {
          map[seatId] = zoneName;
        }
      }
    }
    return map;
  }, [formData.calibration, availableZones, rows, columns, disabledSeats]);

  const [zoneMap, setZoneMap] = useState(initialMap);

  // Compute coverage stats
  const totalActiveSeats = rows * columns - disabledSeats.length;
  const mappedCount = Object.keys(zoneMap).filter((id) => !disabledSeats.includes(id)).length;
  const coveragePercent = totalActiveSeats > 0 ? Math.round((mappedCount / totalActiveSeats) * 100) : 100;
  const unmappedSeats = totalActiveSeats - mappedCount;

  const handleSeatClick = (seatId) => {
    if (disabledSeats.includes(seatId)) return;
    const updated = {
      ...zoneMap,
      [seatId]: activeZone,
    };
    setZoneMap(updated);
    onChange("calibration", {
      ...formData.calibration,
      zoneMap: updated,
      coverageScore: coveragePercent,
      blindSpotsCount: Math.max(0, unmappedSeats),
      zonesMapped: availableZones.length,
      status: unmappedSeats === 0 ? "verified" : "needs_attention",
    });
  };

  const autoMapAll = () => {
    const map = {};
    const zoneCount = Math.max(1, availableZones.length);
    const rowsPerZone = Math.ceil(rows / zoneCount);

    for (let r = 0; r < rows; r++) {
      const rowChar = ROW_LETTERS[r];
      const zoneIdx = Math.min(Math.floor(r / rowsPerZone), zoneCount - 1);
      const zoneName = availableZones[zoneIdx] || availableZones[0];

      for (let c = 1; c <= columns; c++) {
        const seatId = `${rowChar}-${String(c).padStart(2, "0")}`;
        if (!disabledSeats.includes(seatId)) {
          map[seatId] = zoneName;
        }
      }
    }
    setZoneMap(map);
    onChange("calibration", {
      ...formData.calibration,
      zoneMap: map,
      coverageScore: 100,
      blindSpotsCount: 0,
      zonesMapped: availableZones.length,
      status: "verified",
    });
  };

  return (
    <div className="wizard-step-content">
      <div className="step-intro">
        <h2>Step 5: Camera-to-Seat Calibration</h2>
        <p>
          Map optical camera zones directly to seat clusters. Edge AI uses this spatial mapping to localize anonymous pose telemetry to exact Seat IDs.
        </p>
      </div>

      {/* Zone selection bar */}
      <div className="calibration-top-bar">
        <div className="zone-selector-group">
          <label>Select Target Zone to Paint Desks:</label>
          <div className="zone-buttons">
            {availableZones.map((zone) => {
              const color = ZONE_PALETTE[zone] || "#ffad1f";
              const isCurrent = activeZone === zone;
              return (
                <button
                  key={zone}
                  type="button"
                  className={`btn-zone-choice ${isCurrent ? "active" : ""}`}
                  style={{
                    borderColor: color,
                    backgroundColor: isCurrent ? color : "transparent",
                    color: isCurrent ? "#ffffff" : "#222222",
                  }}
                  onClick={() => setActiveZone(zone)}
                >
                  <span className="dot" style={{ backgroundColor: isCurrent ? "#ffffff" : color }} />
                  {zone}
                </button>
              );
            })}
          </div>
        </div>

        <button type="button" className="secondary-button" onClick={autoMapAll}>
          ⚡ Auto-Map All by Proximity
        </button>
      </div>

      {/* Calibration metrics */}
      <div className="calibration-metrics-row">
        <div className="calib-metric-card">
          <span>Camera Coverage</span>
          <strong className={coveragePercent === 100 ? "text-success" : "text-warning"}>
            {coveragePercent}%
          </strong>
        </div>
        <div className="calib-metric-card">
          <span>Mapped Desks</span>
          <strong>{mappedCount} / {totalActiveSeats}</strong>
        </div>
        <div className="calib-metric-card">
          <span>Uncovered Blind Spots</span>
          <strong>{unmappedSeats}</strong>
        </div>
        <div className="calib-metric-card">
          <span>Spatial Matrix Status</span>
          <strong className="text-success">
            {unmappedSeats === 0 ? "✓ Verified" : "⚠ Review Mapping"}
          </strong>
        </div>
      </div>

      {/* Grid Canvas with zone highlights */}
      <div className="calibration-grid-canvas">
        <SeatGrid
          rows={rows}
          columns={columns}
          aisles={seatingConfig.aisles || []}
          disabledSeats={disabledSeats}
          zoneAssignments={zoneMap}
          zoneColors={ZONE_PALETTE}
          onSelectSeat={handleSeatClick}
          mode="select"
        />
      </div>
    </div>
  );
}
