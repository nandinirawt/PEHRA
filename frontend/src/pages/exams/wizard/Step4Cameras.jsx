import React, { useState } from "react";
import { CAMERA_FEED_TYPES } from "../../../api/contracts.js";

const DEFAULT_CAMERAS = [
  {
    id: "cam-01",
    name: "Overhead Camera 01 (Front)",
    type: "edge_ai",
    streamUrl: "rtsp://192.168.1.101:554/live/front",
    zone: "Zone A (Front)",
    status: "connected",
    fps: 30,
    resolution: "1080p",
  },
  {
    id: "cam-02",
    name: "Overhead Camera 02 (Center)",
    type: "edge_ai",
    streamUrl: "rtsp://192.168.1.102:554/live/center",
    zone: "Zone B (Center)",
    status: "connected",
    fps: 30,
    resolution: "1080p",
  },
  {
    id: "cam-03",
    name: "Overhead Camera 03 (Rear)",
    type: "simulated",
    streamUrl: "mock://feeds/rear_demo.mp4",
    zone: "Zone C (Rear)",
    status: "connected",
    fps: 28,
    resolution: "1080p",
  },
];

export default function Step4Cameras({ formData, onChange }) {
  const cameras = formData.cameras && formData.cameras.length > 0 ? formData.cameras : DEFAULT_CAMERAS;

  const [activeCamIndex, setActiveCamIndex] = useState(0);
  const [testingCamId, setTestingCamId] = useState(null);

  const updateCameras = (newCamList) => {
    onChange("cameras", newCamList);
  };

  const handleAddCamera = () => {
    const newId = `cam-${String(cameras.length + 1).padStart(2, "0")}`;
    const newCam = {
      id: newId,
      name: `Overhead Camera ${String(cameras.length + 1).padStart(2, "0")}`,
      type: "edge_ai",
      streamUrl: `rtsp://192.168.1.${100 + cameras.length + 1}:554/live`,
      zone: `Zone ${String.fromCharCode(65 + cameras.length)}`,
      status: "connected",
      fps: 30,
      resolution: "1080p",
    };
    const updated = [...cameras, newCam];
    updateCameras(updated);
    setActiveCamIndex(updated.length - 1);
  };

  const handleRemoveCamera = (id) => {
    if (cameras.length <= 1) return;
    const updated = cameras.filter((c) => c.id !== id);
    updateCameras(updated);
    setActiveCamIndex(0);
  };

  const handleCamFieldChange = (id, field, value) => {
    const updated = cameras.map((c) => (c.id === id ? { ...c, [field]: value } : c));
    updateCameras(updated);
  };

  const testConnection = (id) => {
    setTestingCamId(id);
    setTimeout(() => {
      setTestingCamId(null);
    }, 800);
  };

  const currentCam = cameras[activeCamIndex] || cameras[0];

  return (
    <div className="wizard-step-content">
      <div className="step-intro">
        <h2>Step 4: Edge Camera Stream Configuration</h2>
        <p>
          Configure and test camera sensor feeds connected to the local Edge AI inference pipeline.
        </p>
      </div>

      <div className="cameras-layout-split">
        {/* Left: Camera List & Controls */}
        <div className="cameras-list-panel">
          <div className="panel-top-bar">
            <h3>Connected Vision Nodes ({cameras.length})</h3>
            <button type="button" className="secondary-button" onClick={handleAddCamera}>
              + Add Camera Feed
            </button>
          </div>

          <div className="cameras-stack">
            {cameras.map((cam, idx) => {
              const isSelected = activeCamIndex === idx;
              return (
                <div
                  key={cam.id}
                  className={`camera-item-card ${isSelected ? "selected" : ""}`}
                  onClick={() => setActiveCamIndex(idx)}
                >
                  <div className="camera-card-top">
                    <div className="cam-title-line">
                      <span className="cam-indicator online" />
                      <strong>{cam.name}</strong>
                    </div>
                    {cameras.length > 1 && (
                      <button
                        type="button"
                        className="btn-delete-cam"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCamera(cam.id);
                        }}
                        title="Remove camera"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="cam-meta-line">
                    <span>Protocol: <strong>{cam.type.toUpperCase()}</strong></span>
                    <span>Zone: <strong>{cam.zone}</strong></span>
                    <span>{cam.fps} FPS</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Camera Inspector & Live Feed Simulator */}
        {currentCam && (
          <div className="camera-inspector-panel">
            <div className="inspector-header">
              <h4>Feed Inspector: {currentCam.name}</h4>
              <span className="badge-live-stream">● LIVE EDGE FEED</span>
            </div>

            {/* Video preview viewport */}
            <div className="camera-preview-box">
              <div className="preview-overlay-info">
                <span>{currentCam.resolution} · {currentCam.fps} FPS</span>
                <span>{currentCam.type.toUpperCase()} MODE</span>
              </div>

              <div className="simulated-feed-visual">
                <div className="feed-grid-pattern" />
                <div className="scan-line" />
                <div className="bounding-box-demo box-1">
                  <span>Person #1 [Anonymous Pose]</span>
                </div>
                <div className="bounding-box-demo box-2">
                  <span>Person #2 [Anonymous Pose]</span>
                </div>
                <div className="feed-watermark">PEHRA EDGE NODE • ANONYMOUS SENSING ACTIVE</div>
              </div>
            </div>

            {/* Form fields for the selected camera */}
            <div className="inspector-form-grid">
              <div className="form-group">
                <label>Feed Name</label>
                <input
                  type="text"
                  value={currentCam.name}
                  onChange={(e) => handleCamFieldChange(currentCam.id, "name", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Assigned Zone</label>
                <input
                  type="text"
                  value={currentCam.zone}
                  onChange={(e) => handleCamFieldChange(currentCam.id, "zone", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Stream Protocol</label>
                <select
                  value={currentCam.type}
                  onChange={(e) => handleCamFieldChange(currentCam.id, "type", e.target.value)}
                >
                  <option value={CAMERA_FEED_TYPES.EDGE_AI}>Local Edge AI Pipeline</option>
                  <option value={CAMERA_FEED_TYPES.RTSP}>RTSP Video Stream</option>
                  <option value={CAMERA_FEED_TYPES.WEBCAM}>USB / Integrated Webcam</option>
                  <option value={CAMERA_FEED_TYPES.SIMULATED}>Simulated Video Dataset (Demo)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Stream Endpoint / URL</label>
                <input
                  type="text"
                  value={currentCam.streamUrl || ""}
                  onChange={(e) => handleCamFieldChange(currentCam.id, "streamUrl", e.target.value)}
                />
              </div>
            </div>

            <div className="inspector-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => testConnection(currentCam.id)}
                disabled={testingCamId === currentCam.id}
              >
                {testingCamId === currentCam.id ? "Pinging Sensor..." : "Ping Camera & Measure FPS"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
