/**
 * PEHRA - P2 Exam Service
 *
 * P2 responsibility:
 * - Exam Management
 * - Exam Setup Wizard
 * - Exam lifecycle
 * - Exam Summary
 * - Calibration integration with P4
 *
 * P4 backend endpoints consumed by P2:
 *
 * EXAMS
 * GET    /api/exams
 * POST   /api/exams
 * GET    /api/exams/{exam_id}
 * PUT    /api/exams/{exam_id}
 * POST   /api/exams/{exam_id}/start
 * POST   /api/exams/{exam_id}/end
 * GET    /api/exams/{exam_id}/summary
 *
 * CALIBRATION
 * GET    /api/exams/{exam_id}/calibration
 * POST   /api/exams/{exam_id}/calibration
 *
 * P2 does NOT modify P4 backend code or database.
 */

import { INITIAL_EXAMS } from "./mockData.js";
import { DEFAULT_HALLS } from "./contracts.js";

const STORAGE_KEY = "pehra_exams_store_v1";
const CALIB_STORAGE_KEY = "pehra_calibration_store_v1";

const API_BASE = "http://localhost:8000";
const REQUEST_TIMEOUT = 3000;

/* =========================================================
   Utility helpers
   ========================================================= */

function createTimeoutSignal() {
  if (typeof AbortSignal !== "undefined" && AbortSignal.timeout) {
    return AbortSignal.timeout(REQUEST_TIMEOUT);
  }

  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  return controller.signal;
}

/**
 * Convert P4 backend exam format to the format expected by P2 UI.
 *
 * P4:
 * {
 *   exam_id,
 *   name,
 *   subject,
 *   hall_id,
 *   date,
 *   start_time,
 *   end_time,
 *   total_seats,
 *   status
 * }
 *
 * P2 UI:
 * {
 *   id,
 *   title,
 *   subject,
 *   hallId,
 *   hall,
 *   date,
 *   startTime,
 *   endTime,
 *   time,
 *   students,
 *   totalSeats,
 *   status
 * }
 */
function mapBackendExamToP2(exam) {
  if (!exam) return null;

  return {
    ...exam,

    id: exam.exam_id ?? exam.id,
    title: exam.name ?? exam.title ?? "Untitled Examination",

    subject: exam.subject ?? "General",

    hallId: exam.hall_id ?? exam.hallId ?? "hall-a",
    hall: exam.hall ?? exam.hall_id ?? exam.hallId ?? "Hall A",

    date: exam.date ?? "",

    startTime: exam.start_time ?? exam.startTime ?? "10:00",
    endTime: exam.end_time ?? exam.endTime ?? "13:00",

    time:
      exam.time ??
      `${exam.start_time ?? exam.startTime ?? "10:00"} – ${
        exam.end_time ?? exam.endTime ?? "13:00"
      }`,

    students:
      Number(exam.total_seats ?? exam.students ?? exam.totalSeats ?? 0),

    totalSeats:
      Number(exam.total_seats ?? exam.totalSeats ?? exam.students ?? 0),

    status: exam.status ?? "draft",

    currentStep: exam.currentStep ?? 6,
    progress: exam.progress ?? 100,

    instructions: exam.instructions ?? "",

    evidenceRetention: Boolean(exam.evidenceRetention),

    seatingConfig: exam.seatingConfig ?? {
      rows: 6,
      columns: 10,
      aisles: [5],
      disabledSeats: [],
    },

    cameras: exam.cameras ?? [],

    calibration: exam.calibration ?? {
      coverageScore: 0,
      blindSpotsCount: 0,
      zonesMapped: 0,
      status: "pending",
    },

    summary: exam.summary ?? null,
  };
}

/**
 * Convert P2 exam object to the exact P4 EXAM contract.
 *
 * P4 expects:
 * exam_id
 * name
 * subject
 * hall_id
 * date
 * start_time
 * end_time
 * total_seats
 * status
 */
function mapP2ExamToBackend(exam) {
  return {
    exam_id: exam.exam_id ?? exam.id,
    name: exam.name ?? exam.title ?? "Untitled Examination",
    subject: exam.subject ?? "General",

    hall_id:
      exam.hall_id ??
      exam.hallId ??
      exam.hall ??
      "hall-a",

    date: exam.date ?? new Date().toISOString().split("T")[0],

    start_time:
      exam.start_time ??
      exam.startTime ??
      "10:00",

    end_time:
      exam.end_time ??
      exam.endTime ??
      "13:00",

    total_seats: Number(
      exam.total_seats ??
        exam.totalSeats ??
        exam.students ??
        60
    ),

    status: exam.status ?? "draft",
  };
}

/**
 * Convert calibration data from P2 naming conventions
 * into P4's calibration contract.
 */
function mapCalibrationToBackend(calibrationData, examId) {
  const coverageValue =
    typeof calibrationData.coverageScore === "number"
      ? calibrationData.coverageScore > 1
        ? calibrationData.coverageScore / 100
        : calibrationData.coverageScore
      : typeof calibrationData.coverage === "number"
      ? calibrationData.coverage > 1
        ? calibrationData.coverage / 100
        : calibrationData.coverage
      : 0;

  return {
    camera_id:
      calibrationData.cameraId ??
      calibrationData.camera_id ??
      "CAM-01",

    exam_id:
      calibrationData.examId ??
      calibrationData.exam_id ??
      examId,

    zone:
      calibrationData.zone ??
      "Zone-A",

    seat_ids:
      calibrationData.selectedSeats ??
      calibrationData.seat_ids ??
      [],

    coverage: coverageValue,

    status:
      calibrationData.status ??
      "calibrated",
  };
}

/* =========================================================
   Local storage helpers
   ========================================================= */

function loadLocalExams() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn(
      "Could not read localStorage. Using default mock data.",
      error
    );
  }

  const initial = INITIAL_EXAMS.map(mapBackendExamToP2);

  saveLocalExams(initial);

  return initial;
}

function saveLocalExams(exams) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(exams)
    );
  } catch (error) {
    console.error(
      "Could not write exams to localStorage:",
      error
    );
  }
}

function saveLocalCalibration(calibration) {
  try {
    localStorage.setItem(
      CALIB_STORAGE_KEY,
      JSON.stringify(calibration)
    );
  } catch (error) {
    console.error(
      "Could not write calibration to localStorage:",
      error
    );
  }
}

function loadLocalCalibration() {
  try {
    const stored =
      localStorage.getItem(CALIB_STORAGE_KEY);

    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn(
      "Could not read local calibration storage:",
      error
    );
  }

  return null;
}

/* =========================================================
   Exam Service
   ========================================================= */

export const examService = {
  /* -------------------------------------------------------
     GET ALL EXAMS
     GET /api/exams
     ------------------------------------------------------- */

  getExams: async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/exams`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: createTimeoutSignal(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `GET /api/exams failed: ${response.status}`
        );
      }

      const backendExams = await response.json();

      const mappedExams = Array.isArray(backendExams)
        ? backendExams.map(mapBackendExamToP2)
        : [];

      saveLocalExams(mappedExams);

      return mappedExams;
    } catch (error) {
      console.warn(
        "Could not fetch exams from P4 backend. Using local/mock data.",
        error
      );

      return loadLocalExams();
    }
  },

  /* -------------------------------------------------------
     GET ONE EXAM
     GET /api/exams/{exam_id}
     ------------------------------------------------------- */

  getExamById: async (id) => {
    if (!id) {
      return null;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/exams/${encodeURIComponent(id)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: createTimeoutSignal(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `GET /api/exams/${id} failed: ${response.status}`
        );
      }

      const backendExam = await response.json();

      return mapBackendExamToP2(backendExam);
    } catch (error) {
      console.warn(
        `Could not fetch exam ${id} from P4 backend. Using local data.`,
        error
      );

      const exams = loadLocalExams();

      return (
        exams.find(
          (exam) =>
            exam.id === id ||
            exam.exam_id === id
        ) ?? null
      );
    }
  },

  /* -------------------------------------------------------
     CREATE EXAM
     POST /api/exams
     ------------------------------------------------------- */

  createExam: async (examData = {}) => {
    const p2Exam = {
      id:
        examData.id ??
        examData.exam_id ??
        `exam-${Date.now()}`,

      title:
        examData.title ??
        examData.name ??
        "Untitled Examination",

      subject:
        examData.subject ??
        "General",

      date:
        examData.date ??
        new Date().toISOString().split("T")[0],

      startTime:
        examData.startTime ??
        examData.start_time ??
        "10:00",

      endTime:
        examData.endTime ??
        examData.end_time ??
        "13:00",

      hall:
        examData.hall ??
        examData.hallId ??
        examData.hall_id ??
        "Hall A",

      hallId:
        examData.hallId ??
        examData.hall_id ??
        "hall-a",

      students:
        Number(
          examData.students ??
            examData.totalSeats ??
            examData.total_seats ??
            60
        ),

      totalSeats:
        Number(
          examData.totalSeats ??
            examData.total_seats ??
            examData.students ??
            60
        ),

      status:
        examData.status ??
        "draft",

      currentStep:
        examData.currentStep ??
        1,

      progress:
        examData.progress ??
        20,

      instructions:
        examData.instructions ??
        "",

      evidenceRetention:
        Boolean(examData.evidenceRetention),

      seatingConfig:
        examData.seatingConfig ?? {
          rows: 6,
          columns: 10,
          aisles: [5],
          disabledSeats: [],
        },

      cameras:
        examData.cameras ??
        [],

      calibration:
        examData.calibration ?? {
          coverageScore: 0,
          blindSpotsCount: 0,
          zonesMapped: 0,
          status: "pending",
        },

      summary:
        examData.summary ??
        null,
    };

    const backendPayload =
      mapP2ExamToBackend(p2Exam);

    try {
      const response = await fetch(
        `${API_BASE}/api/exams`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(backendPayload),
          signal: createTimeoutSignal(),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `POST /api/exams failed: ${response.status} ${errorText}`
        );
      }

      const savedBackendExam =
        await response.json();

      const savedExam =
        mapBackendExamToP2(savedBackendExam);

      const exams = loadLocalExams();

      saveLocalExams([
        savedExam,
        ...exams.filter(
          (exam) => exam.id !== savedExam.id
        ),
      ]);

      return savedExam;
    } catch (error) {
      console.warn(
        "Could not create exam on P4 backend. Saving locally.",
        error
      );

      const exams = loadLocalExams();

      const updated = [
        p2Exam,
        ...exams.filter(
          (exam) => exam.id !== p2Exam.id
        ),
      ];

      saveLocalExams(updated);

      return p2Exam;
    }
  },

  /* -------------------------------------------------------
     UPDATE EXAM
     PUT /api/exams/{exam_id}
     ------------------------------------------------------- */

  updateExam: async (id, patch = {}) => {
    if (!id) {
      return null;
    }

    const exams = loadLocalExams();

    const index = exams.findIndex(
      (exam) =>
        exam.id === id ||
        exam.exam_id === id
    );

    /*
     * If the exam isn't in local storage, try getting
     * the current version from the backend.
     */
    let currentExam =
      index !== -1
        ? exams[index]
        : await examService.getExamById(id);

    if (!currentExam) {
      console.warn(
        `Cannot update exam ${id}: exam not found.`
      );

      return null;
    }

    /*
     * Merge P2's changes with the existing exam first.
     */
    const updatedP2Exam = {
      ...currentExam,
      ...patch,
      id:
        currentExam.id ??
        currentExam.exam_id ??
        id,
    };

    /*
     * Keep the wizard progress calculation.
     */
    if (updatedP2Exam.currentStep) {
      updatedP2Exam.progress = Math.min(
        100,
        Math.round(
          (updatedP2Exam.currentStep / 6) * 100
        )
      );
    }

    /*
     * Save locally immediately so the P2 UI remains
     * responsive even if the backend is unavailable.
     */
    if (index !== -1) {
      exams[index] = updatedP2Exam;
    } else {
      exams.push(updatedP2Exam);
    }

    saveLocalExams(exams);

    /*
     * Send the COMPLETE P4 EXAM contract.
     *
     * P4's PUT endpoint expects ExamCreate, not a
     * partial PATCH object.
     */
    const backendPayload =
      mapP2ExamToBackend(updatedP2Exam);

    try {
      const response = await fetch(
        `${API_BASE}/api/exams/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(backendPayload),
          signal: createTimeoutSignal(),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `PUT /api/exams/${id} failed: ${response.status} ${errorText}`
        );
      }

      const backendUpdated =
        await response.json();

      const finalExam =
        mapBackendExamToP2(backendUpdated);

      /*
       * Preserve P2-only wizard information that isn't
       * part of P4's EXAM contract.
       */
      const mergedFinalExam = {
        ...updatedP2Exam,
        ...finalExam,
        currentStep:
          updatedP2Exam.currentStep ??
          finalExam.currentStep,

        progress:
          updatedP2Exam.progress ??
          finalExam.progress,

        seatingConfig:
          updatedP2Exam.seatingConfig ??
          finalExam.seatingConfig,

        cameras:
          updatedP2Exam.cameras ??
          finalExam.cameras,

        calibration:
          updatedP2Exam.calibration ??
          finalExam.calibration,
      };

      const refreshedExams =
        loadLocalExams();

      const refreshedIndex =
        refreshedExams.findIndex(
          (exam) => exam.id === id
        );

      if (refreshedIndex !== -1) {
        refreshedExams[refreshedIndex] =
          mergedFinalExam;
      } else {
        refreshedExams.push(
          mergedFinalExam
        );
      }

      saveLocalExams(refreshedExams);

      return mergedFinalExam;
    } catch (error) {
      console.warn(
        `Could not update exam ${id} on P4 backend. Local copy retained.`,
        error
      );

      return updatedP2Exam;
    }
  },

  /* -------------------------------------------------------
     START EXAM
     POST /api/exams/{exam_id}/start
     ------------------------------------------------------- */

  startExam: async (id) => {
    if (!id) {
      return null;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/exams/${encodeURIComponent(id)}/start`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          signal: createTimeoutSignal(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `POST /api/exams/${id}/start failed: ${response.status}`
        );
      }

      const result =
        await response.json();

      /*
       * Keep P2 local state synchronized.
       */
      const localExam =
        await examService.getExamById(id);

      if (localExam) {
        const updated = {
          ...localExam,
          status: "live",
          startedAt:
            new Date().toISOString(),
          elapsed:
            localExam.elapsed ??
            "00:00:01",
        };

        const exams =
          loadLocalExams();

        const index =
          exams.findIndex(
            (exam) => exam.id === id
          );

        if (index !== -1) {
          exams[index] = updated;
        } else {
          exams.push(updated);
        }

        saveLocalExams(exams);

        return {
          ...updated,
          ...result,
        };
      }

      return result;
    } catch (error) {
      console.warn(
        `Could not start exam ${id} on P4 backend. Using local fallback.`,
        error
      );

      const exam =
        await examService.getExamById(id);

      if (!exam) {
        return null;
      }

      const patch = {
        status: "live",
        currentStep: 6,
        progress: 100,
        elapsed: "00:00:01",
        startedAt:
          new Date().toISOString(),
      };

      return examService.updateExam(
        id,
        patch
      );
    }
  },

  /* -------------------------------------------------------
     END EXAM
     POST /api/exams/{exam_id}/end
     ------------------------------------------------------- */

  endExam: async (id) => {
    if (!id) {
      return null;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/exams/${encodeURIComponent(id)}/end`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          signal: createTimeoutSignal(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `POST /api/exams/${id}/end failed: ${response.status}`
        );
      }

      const result =
        await response.json();

      const localExam =
        await examService.getExamById(id);

      if (localExam) {
        const updated = {
          ...localExam,
          status: "completed",
          progress: 100,
          completedAt:
            new Date().toISOString(),
        };

        const exams =
          loadLocalExams();

        const index =
          exams.findIndex(
            (exam) => exam.id === id
          );

        if (index !== -1) {
          exams[index] = updated;
        } else {
          exams.push(updated);
        }

        saveLocalExams(exams);

        return {
          ...updated,
          ...result,
        };
      }

      return result;
    } catch (error) {
      console.warn(
        `Could not end exam ${id} on P4 backend. Using local fallback.`,
        error
      );

      const exam =
        await examService.getExamById(id);

      if (!exam) {
        return null;
      }

      return examService.updateExam(
        id,
        {
          status: "completed",
          progress: 100,
          completedAt:
            new Date().toISOString(),
        }
      );
    }
  },

  /* -------------------------------------------------------
     GET EXAM SUMMARY
     GET /api/exams/{exam_id}/summary
     ------------------------------------------------------- */

  getExamSummary: async (id) => {
    if (!id) {
      return null;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/exams/${encodeURIComponent(id)}/summary`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: createTimeoutSignal(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `GET /api/exams/${id}/summary failed: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.warn(
        `Could not fetch summary for exam ${id}.`,
        error
      );

      /*
       * If backend is unavailable, return whatever summary
       * is already present in the local P2 exam.
       */
      const exam =
        await examService.getExamById(id);

      return exam?.summary ?? null;
    }
  },

  /* =======================================================
     CALIBRATION - P4 INTEGRATION
     ======================================================= */

  /* -------------------------------------------------------
     GET CALIBRATION
     GET /api/exams/{exam_id}/calibration
     ------------------------------------------------------- */

  getCalibration: async (examId) => {
    if (!examId) {
      return [];
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/exams/${encodeURIComponent(
          examId
        )}/calibration`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: createTimeoutSignal(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `GET /api/exams/${examId}/calibration failed: ${response.status}`
        );
      }

      const calibration =
        await response.json();

      saveLocalCalibration({
        examId,
        records: calibration,
      });

      return calibration;
    } catch (error) {
      console.warn(
        `Could not fetch calibration for exam ${examId}. Using local calibration.`,
        error
      );

      const stored =
        loadLocalCalibration();

      if (
        stored &&
        stored.examId === examId
      ) {
        return stored.records ?? [];
      }

      return [];
    }
  },

  /* -------------------------------------------------------
     SUBMIT CALIBRATION
     POST /api/exams/{exam_id}/calibration
     ------------------------------------------------------- */

  submitCalibration: async (
    examId,
    calibrationData = {}
  ) => {
    if (!examId) {
      throw new Error(
        "examId is required for calibration."
      );
    }

    const payload =
      mapCalibrationToBackend(
        calibrationData,
        examId
      );

    /*
     * Ensure the URL exam_id is authoritative.
     *
     * We don't want a stale/different exam ID inside
     * calibrationData to accidentally target another exam.
     */
    payload.exam_id = examId;

    try {
      const response = await fetch(
        `${API_BASE}/api/exams/${encodeURIComponent(
          examId
        )}/calibration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
          signal: createTimeoutSignal(),
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          `POST /api/exams/${examId}/calibration failed: ${response.status} ${errorText}`
        );
      }

      const saved =
        await response.json();

      saveLocalCalibration({
        examId,
        records: [saved],
      });

      return saved;
    } catch (error) {
      console.warn(
        `Could not submit calibration for exam ${examId}. Saving locally.`,
        error
      );

      saveLocalCalibration({
        examId,
        records: [payload],
      });

      return {
        ...payload,
        local: true,
        message:
          "Calibration saved locally because the P4 backend is unavailable.",
      };
    }
  },

  /*
   * Alias used by existing P2 code.
   *
   * Existing callers may already call:
   * examService.saveCalibration(...)
   *
   * We keep that compatibility.
   */
  saveCalibration: async (
    examId,
    calibrationData
  ) => {
    return examService.submitCalibration(
      examId,
      calibrationData
    );
  },

  /* =======================================================
     LOCAL / P2 UTILITIES
     ======================================================= */

  resetStore: () => {
    const initial =
      INITIAL_EXAMS.map(
        mapBackendExamToP2
      );

    saveLocalExams(initial);

    return initial;
  },

  getHalls: () => {
    return DEFAULT_HALLS;
  },
};

/* =========================================================
   Named exports for compatibility
   ========================================================= */

export const submitCalibration =
  examService.submitCalibration;

export const getCalibration =
  examService.getCalibration;

export const getExamSummary =
  examService.getExamSummary;
export const fetchPrivacyStatus = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/privacy/status`);

    if (!response.ok) {
      throw new Error(
        `GET /api/privacy/status failed: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.warn(
      "Privacy status endpoint unavailable:",
      error
    );

    return {
      privacy_mode: "edge_anonymized",
      raw_feed_stored: false,
      retention_policy: "ephemeral_only",
      status: "compliant",
      face_recognition: "Disabled",
      cloud_processing: "Disabled",
      identifiable_video_transmission: "Disabled",
      local_processing: "Active",
      identity_data: "Not Required",
      data_minimization: "Enforced",
      evidence_retention_mode: "Off by default",
    };
  }
};