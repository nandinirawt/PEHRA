import React, { useState, useEffect } from "react";
import StepProgressBar from "../../../components/common/StepProgressBar.jsx";
import Step1Details from "./Step1Details.jsx";
import Step2Hall from "./Step2Hall.jsx";
import Step3Seating from "./Step3Seating.jsx";
import Step4Cameras from "./Step4Cameras.jsx";
import Step5Calibration from "./Step5Calibration.jsx";
import Step6PreCheck from "./Step6PreCheck.jsx";
import { examService } from "../../../api/examService.js";
import "./ExamWizard.css";

const TOTAL_STEPS = 6;

export default function ExamWizard({ initialExamId = null, onCancel, onComplete, onStartLive }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(Boolean(initialExamId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    id: initialExamId || null,
    title: "",
    subject: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "13:00",
    hall: "Hall A",
    hallId: "hall-a",
    students: 72,
    totalSeats: 72,
    invigilator: "Prof. Nandini Rawat",
    instructions: "",
    evidenceRetention: false,
    seatingConfig: {
      rows: 8,
      columns: 9,
      aisles: [4],
      disabledSeats: [],
    },
    cameras: [
      { id: "cam-01", name: "Overhead Camera 01 (Front)", type: "edge_ai", zone: "Zone A (Front)", status: "connected", fps: 30 },
      { id: "cam-02", name: "Overhead Camera 02 (Center)", type: "edge_ai", zone: "Zone B (Center)", status: "connected", fps: 30 },
      { id: "cam-03", name: "Overhead Camera 03 (Rear)", type: "simulated", zone: "Zone C (Rear)", status: "connected", fps: 28 },
    ],
    calibration: {
      coverageScore: 100,
      blindSpotsCount: 0,
      zonesMapped: 3,
      status: "verified",
    },
  });

  // Load existing exam data if editing draft
  useEffect(() => {
    if (initialExamId) {
      examService.getExamById(initialExamId).then((exam) => {
        if (exam) {
          setFormData(exam);
          setCurrentStep(exam.currentStep || 1);
        }
        setLoading(false);
      });
    }
  }, [initialExamId]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!formData.title || !formData.title.trim()) {
        errs.title = "Examination title is required";
      }
      if (!formData.subject || !formData.subject.trim()) {
        errs.subject = "Subject & course code are required";
      }
      if (!formData.invigilator || !formData.invigilator.trim()) {
        errs.invigilator = "Invigilator name is required";
      }
      if (!formData.date) {
        errs.date = "Date is required";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const persistDraft = async (stepToSave) => {
    try {
      const payload = {
        ...formData,
        currentStep: stepToSave,
      };
      if (formData.id) {
        await examService.updateExam(formData.id, payload);
      } else {
        const created = await examService.createExam(payload);
        setFormData((prev) => ({ ...prev, id: created.id }));
      }
    } catch (err) {
      console.error("Auto-save draft failed:", err);
    }
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    const nextStep = Math.min(TOTAL_STEPS, currentStep + 1);
    setCurrentStep(nextStep);
    await persistDraft(nextStep);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSaveAndExit = async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    await persistDraft(currentStep);
    setIsSubmitting(false);
    if (onComplete) onComplete(formData);
  };

  const handleSaveReady = async () => {
    setIsSubmitting(true);
    const payload = {
      ...formData,
      status: "upcoming",
      currentStep: 6,
      progress: 100,
    };
    if (formData.id) {
      await examService.updateExam(formData.id, payload);
    } else {
      await examService.createExam(payload);
    }
    setIsSubmitting(false);
    if (onComplete) onComplete(formData);
  };

  const handleStartExam = async () => {
    setIsSubmitting(true);
    let examId = formData.id;
    if (!examId) {
      const created = await examService.createExam({
        ...formData,
        status: "live",
      });
      examId = created.id;
    } else {
      await examService.startExam(examId);
    }
    setIsSubmitting(false);
    if (onStartLive) {
      onStartLive(examId);
    } else if (onComplete) {
      onComplete(formData);
    }
  };

  if (loading) {
    return (
      <div className="wizard-loading-state">
        <div className="loading-spinner" />
        <p>Loading examination setup session...</p>
      </div>
    );
  }

  return (
    <div className="exam-wizard-wrapper">
      {/* Wizard Header */}
      <header className="wizard-top-bar">
        <div className="wizard-header-title">
          <button type="button" className="btn-back-link" onClick={onCancel}>
            ← Back to Exams Catalog
          </button>
          <h1>{formData.id ? "Continue Examination Setup" : "Create New Examination"}</h1>
        </div>

        <div className="wizard-top-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={handleSaveAndExit}
            disabled={isSubmitting}
          >
            Save Draft & Exit
          </button>
        </div>
      </header>

      {/* 6-Step Visual Progress Bar */}
      <StepProgressBar
        currentStep={currentStep}
        onStepClick={(step) => {
          if (validateStep(currentStep)) {
            setCurrentStep(step);
          }
        }}
      />

      {/* Step Viewports */}
      <main className="wizard-main-body">
        {currentStep === 1 && (
          <Step1Details
            formData={formData}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {currentStep === 2 && (
          <Step2Hall
            formData={formData}
            onChange={handleFieldChange}
          />
        )}

        {currentStep === 3 && (
          <Step3Seating
            formData={formData}
            onChange={handleFieldChange}
          />
        )}

        {currentStep === 4 && (
          <Step4Cameras
            formData={formData}
            onChange={handleFieldChange}
          />
        )}

        {currentStep === 5 && (
          <Step5Calibration
            formData={formData}
            onChange={handleFieldChange}
          />
        )}

        {currentStep === 6 && (
          <Step6PreCheck
            formData={formData}
            onStartExam={handleStartExam}
            onSaveReady={handleSaveReady}
            isSubmitting={isSubmitting}
          />
        )}
      </main>

      {/* Wizard Navigation Footer */}
      {currentStep < 6 && (
        <footer className="wizard-footer-bar">
          <div className="footer-left">
            {currentStep > 1 ? (
              <button type="button" className="secondary-button" onClick={handleBack}>
                ← Previous Step
              </button>
            ) : (
              <button type="button" className="secondary-button text-muted" onClick={onCancel}>
                Cancel
              </button>
            )}
          </div>

          <div className="footer-right">
            <span className="step-counter-label">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
            <button
              type="button"
              className="primary-button btn-next-step"
              onClick={handleNext}
            >
              Continue to Step {currentStep + 1} →
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
