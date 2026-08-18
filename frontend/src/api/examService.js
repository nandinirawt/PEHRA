/**
 * PEHRA Exam Service
 * Handles API calls to backend (/api/exams) with transparent LocalStorage + Mock fallback.
 * Ensures the app works 100% reliably in development, testing, and offline hackathon demos.
 */

import { INITIAL_EXAMS } from "./mockData.js";
import { DEFAULT_HALLS } from "./contracts.js";

const STORAGE_KEY = "pehra_exams_store_v1";
const API_BASE_URL = "http://localhost:8000/api";

function loadLocalExams() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.warn("Could not read localStorage, using default mock data:", err);
  }
  saveLocalExams(INITIAL_EXAMS);
  return INITIAL_EXAMS;
}

function saveLocalExams(exams) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
  } catch (err) {
    console.error("Could not write to localStorage:", err);
  }
}

export const examService = {
  /**
   * Fetch all exams
   */
  async getExams() {
    try {
      const response = await fetch(`${API_BASE_URL}/exams`, {
        signal: AbortSignal.timeout(1200),
      });
      if (response.ok) {
        const liveData = await response.json();
        saveLocalExams(liveData);
        return liveData;
      }
    } catch {
      // Backend not running or offline; fall back to local mock data silently
    }
    return loadLocalExams();
  },

  /**
   * Fetch single exam by ID
   */
  async getExamById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/exams/${id}`, {
        signal: AbortSignal.timeout(1200),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }
    const exams = loadLocalExams();
    return exams.find((e) => e.id === id) || null;
  },

  /**
   * Create or save an exam draft
   */
  async createExam(examData) {
    const newExam = {
      id: `exam-${Date.now()}`,
      title: examData.title || "Untitled Examination",
      subject: examData.subject || "General",
      date: examData.date || new Date().toISOString().split("T")[0],
      startTime: examData.startTime || "10:00",
      endTime: examData.endTime || "13:00",
      time: `${examData.startTime || "10:00 AM"} – ${examData.endTime || "01:00 PM"}`,
      hall: examData.hall || "Hall A",
      hallId: examData.hallId || "hall-a",
      students: Number(examData.students) || 60,
      totalSeats: Number(examData.totalSeats) || 60,
      invigilator: examData.invigilator || "Current Invigilator",
      status: "draft",
      currentStep: 1,
      progress: 15,
      instructions: examData.instructions || "",
      evidenceRetention: Boolean(examData.evidenceRetention),
      seatingConfig: examData.seatingConfig || {
        rows: 6,
        columns: 10,
        aisles: [5],
        disabledSeats: [],
      },
      cameras: examData.cameras || [],
      calibration: examData.calibration || {
        coverageScore: 0,
        blindSpotsCount: 0,
        zonesMapped: 0,
        status: "pending",
      },
      ...examData,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/exams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExam),
        signal: AbortSignal.timeout(1200),
      });
      if (response.ok) {
        const saved = await response.json();
        const exams = loadLocalExams();
        saveLocalExams([saved, ...exams]);
        return saved;
      }
    } catch {
      // Fallback
    }

    const exams = loadLocalExams();
    const updated = [newExam, ...exams];
    saveLocalExams(updated);
    return newExam;
  },

  /**
   * Update an existing exam with new step data
   */
  async updateExam(id, patch) {
    const exams = loadLocalExams();
    const index = exams.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const updated = {
      ...exams[index],
      ...patch,
    };

    // Calculate progress percentage based on currentStep
    if (updated.currentStep) {
      updated.progress = Math.min(100, Math.round((updated.currentStep / 6) * 100));
    }

    exams[index] = updated;
    saveLocalExams(exams);

    try {
      await fetch(`${API_BASE_URL}/exams/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
        signal: AbortSignal.timeout(1200),
      });
    } catch {
      // Offline fallback
    }

    return updated;
  },

  /**
   * Transition exam to LIVE
   */
  async startExam(id) {
    const patch = {
      status: "live",
      currentStep: 6,
      progress: 100,
      elapsed: "00:00:01",
      startedAt: new Date().toISOString(),
    };
    return this.updateExam(id, patch);
  },

  /**
   * Transition exam to COMPLETED with sample report
   */
  async endExam(id) {
    const exam = await this.getExamById(id);
    const total = exam ? exam.students || 60 : 60;
    const patch = {
      status: "completed",
      progress: 100,
      completedAt: new Date().toISOString(),
      summary: {
        attendanceCount: Math.round(total * 0.96),
        absentCount: Math.round(total * 0.04),
        totalEvents: 14,
        reviewedCount: 7,
        falseAlarmsCount: 5,
        confirmedIncidentsCount: 2,
        avgConfidence: 93.8,
        riskDistribution: {
          normal: Math.round(total * 0.90),
          underReview: Math.round(total * 0.06),
          highRisk: Math.round(total * 0.04),
        },
        auditLog: [
          {
            id: "evt-live-1",
            time: "Session Log",
            seatId: "B-04",
            eventType: "Repeated Head Turns + Hand Anomaly",
            severity: "high",
            confidence: "91%",
            invigilatorAction: "Confirmed Incident",
            notes: "Review conducted at desk; verified unusual interaction.",
          },
          {
            id: "evt-live-2",
            time: "Session Log",
            seatId: "A-06",
            eventType: "Head Movement Pattern",
            severity: "medium",
            confidence: "82%",
            invigilatorAction: "False Alarm",
            notes: "Checking wall clock / ambient stretch.",
          },
        ],
        privacyAttestation: {
          zeroBiometricStored: true,
          edgeInferenceVerified: true,
          noCloudVideoSent: true,
          dataMinimizationCompliant: true,
          auditTimestamp: new Date().toISOString(),
        },
      },
    };
    return this.updateExam(id, patch);
  },

  /**
   * Delete an exam (e.g. discard draft)
   */
  async deleteExam(id) {
    const exams = loadLocalExams();
    const filtered = exams.filter((e) => e.id !== id);
    saveLocalExams(filtered);
    try {
      await fetch(`${API_BASE_URL}/exams/${id}`, {
        method: "DELETE",
        signal: AbortSignal.timeout(1200),
      });
    } catch {
      // Fallback
    }
    return true;
  },

  /**
   * Reset store to initial seed data
   */
  resetStore() {
    saveLocalExams(INITIAL_EXAMS);
    return INITIAL_EXAMS;
  },

  /**
   * Get list of preset halls
   */
  getHalls() {
    return DEFAULT_HALLS;
  },
};
