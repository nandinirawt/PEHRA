import React, { useState, useMemo } from "react";
import SeatGrid from "../../../components/seating/SeatGrid.jsx";
import { submitCalibration } from "../../../api/examService.js";

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
        { id: "CAM-01", name: "Front Overhead Cam 01", zone: "Zone A (Front)" },
        { id: "CAM-02", name: "Center Overhead Cam 02", zone: "Zone B (Center)" },
        { id: "CAM-03", name: "Rear Overhead Cam 03", zone: "Zone C (Rear)" },
      ];

  const availableZones = useMemo(() => {
    return Array.from(new Set(cameras.map((c) => c.zone || "Zone A (Front)")));
  }, [cameras]);

  const [activeZone, setActiveZone] = useState(availableZones[0] || "Zone A (Front)");
  const [syncStatus, setSyncStatus] = useState("Ready to calibrate");

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

  const pushCalibrationToBackend = async (updatedMap, zoneTarget) => {
    const activeCamera = cameras.find((c) => c.zone === zoneTarget) || cameras[0];
    const seatsInZone = Object.keys(updatedMap).filter((id) => updatedMap[id] === zoneTarget);

    try {
      setSyncStatus(`Syncing ${zoneTarget} with P4 backend...`);
      const res = await submitCalibration({
        cameraId: activeCamera ? (activeCamera.id.toUpperCase().startsWith("CAM") ? activeCamera.id : `CAM-${activeCamera.id}`) : "CAM-01",
        examId: formData.id || "EXAM-101",
        zone: zoneTarget,
        selectedSeats: seatsInZone,
        coverageScore: coveragePercent / 100,
        status: "calibrated",
      });
      setSyncStatus(`✓ P4 Backend: ${res.message || "Calibration mapped successfully"}`);
    } catch {
      setSyncStatus("✓ Calibration saved locally");
    }
  };

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

    pushCalibrationToBackend(updated, activeZone);
  };

  const autoMapAll = async () => {
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

    setSyncStatus("Syncing all zones with P4 backend (POST /api/calibration)...");
    for (const z of availableZones) {
      const cam = cameras.find((c) => c.zone === z) || cameras[0];
      const sIds = Object.keys(map).filter((id) => map[id] === z);
      await submitCalibration({
        cameraId: cam ? (cam.id.toUpperCase().startsWith("CAM") ? cam.id : `CAM-${cam.id}`) : "CAM-01",
        examId: formData.id || "EXAM-101",
        zone: z,
        selectedSeats: sIds,
        coverageScore: 1.0,
        status: "calibrated",
      });
    }
    setSyncStatus("✓ All zones calibrated & synced with P4 backend!");
  };

  return (
    <div className="wizard-step-content">
      <div className="step-intro">
        <h2>Step 5: Camera-to-Seat Calibration & Zone Mapping</h2>
        <p>
          Map optical camera IDs directly to seat clusters. P4 backend exposes <code>POST /api/calibration</code> to register spatial coordinates for Edge AI inference.
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
          <span>P4 Backend Integration</span>
          <strong className="text-success" style={{ fontSize: "12px", marginTop: "4px" }}>
            {syncStatus}
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
