import React from "react";

const STEPS = [
  { step: 1, title: "Details", desc: "Basic Info" },
  { step: 2, title: "Hall", desc: "Environment" },
  { step: 3, title: "Seating", desc: "Grid & Desks" },
  { step: 4, title: "Cameras", desc: "Feed Streams" },
  { step: 5, title: "Calibration", desc: "Zone Mapping" },
  { step: 6, title: "Pre-Check", desc: "Audit & Launch" },
];

export default function StepProgressBar({ currentStep = 1, onStepClick }) {
  return (
    <div className="wizard-step-progress">
      {STEPS.map((s, idx) => {
        const isCompleted = currentStep > s.step;
        const isActive = currentStep === s.step;
        const isPending = currentStep < s.step;

        return (
          <div
            key={s.step}
            className={`wizard-step-item ${
              isCompleted ? "completed" : isActive ? "active" : "pending"
            }`}
            onClick={() => {
              if (isCompleted && onStepClick) {
                onStepClick(s.step);
              }
            }}
            style={{ cursor: isCompleted ? "pointer" : "default" }}
          >
            <div className="step-circle">
              {isCompleted ? "✓" : s.step}
            </div>
            <div className="step-label-group">
              <span className="step-number">Step {s.step}</span>
              <span className="step-title">{s.title}</span>
            </div>
            {idx < STEPS.length - 1 && <div className="step-connector" />}
          </div>
        );
      })}
    </div>
  );
}
