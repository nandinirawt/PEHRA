import React, { useMemo, useState, useEffect, useCallback } from "react";
import StatusBadge from "./components/common/StatusBadge.jsx";
import ExamWizard from "./pages/exams/wizard/ExamWizard.jsx";
import SessionSummary from "./pages/exams/summary/SessionSummary.jsx";
import { examService } from "./api/examService.js";
import "./Exams.css";

const statusConfig = {
  upcoming: {
    label: "Upcoming",
    className: "upcoming",
  },
  live: {
    label: "Live",
    className: "live",
  },
  completed: {
    label: "Completed",
    className: "completed",
  },
  draft: {
    label: "Draft",
    className: "draft",
  },
};

/*
 * Convert P4 backend exam format into the format
 * already expected by the P2 Exams UI.
 *
 * P4/backend:
 *   exam_id
 *   name
 *   start_time
 *   end_time
 *   total_seats
 *
 * P2 UI:
 *   id
 *   title
 *   time
 *   students
 */
function normalizeExam(exam) {
  return {
    ...exam,

    id: exam.id ?? exam.exam_id,
    title: exam.title ?? exam.name ?? "Untitled Examination",
    subject: exam.subject ?? "General",

    date: exam.date ?? "",

    time:
      exam.time ??
      `${exam.start_time ?? ""} – ${exam.end_time ?? ""}`,

    hall: exam.hall ?? "Hall A",

    students:
      exam.students ??
      exam.totalSeats ??
      exam.total_seats ??
      0,

    totalSeats:
      exam.totalSeats ??
      exam.total_seats ??
      exam.students ??
      0,

    status: exam.status ?? "draft",

    currentStep:
      exam.currentStep ??
      exam.current_step ??
      1,

    progress:
      exam.progress ??
      100,
  };
}

function ExamCard({
  exam,
  onContinueSetup,
  onViewSummary,
  onMonitor,
  onEditUpcoming,
}) {
  const status = statusConfig[exam.status];

  return (
    <article className={`exam-card ${exam.status}`}>
      <div className="exam-card-top">
        <div>
          <div className="exam-subject">{exam.subject}</div>
          <h3>{exam.title}</h3>
        </div>

        <StatusBadge status={exam.status} />
      </div>

      <div className="exam-details">
        <div className="detail">
          <span className="detail-label">Date</span>
          <strong>{exam.date}</strong>
        </div>

        <div className="detail">
          <span className="detail-label">Time</span>
          <strong>{exam.time}</strong>
        </div>

        <div className="detail">
          <span className="detail-label">Hall</span>
          <strong>{exam.hall}</strong>
        </div>

        <div className="detail">
          <span className="detail-label">Students</span>
          <strong>{exam.students || exam.totalSeats}</strong>
        </div>
      </div>

      {exam.status === "draft" && (
        <div className="progress-section">
          <div className="progress-header">
            <span>
              Setup Progress (Step {exam.currentStep || 1} of 6)
            </span>

            <strong>{exam.progress || 20}%</strong>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${exam.progress || 20}%`,
              }}
            />
          </div>

          <div className="progress-steps">
            <span>
              {exam.currentStep >= 1 ? "✓ Details" : "○ Details"}
            </span>

            <span>
              {exam.currentStep >= 2 ? "✓ Hall" : "○ Hall"}
            </span>

            <span>
              {exam.currentStep >= 3 ? "✓ Seating" : "○ Seating"}
            </span>

            <span>
              {exam.currentStep >= 4 ? "✓ Cameras" : "○ Cameras"}
            </span>

            <span>
              {exam.currentStep >= 5
                ? "✓ Calibration"
                : "○ Calibration"}
            </span>

            <span>
              {exam.currentStep >= 6
                ? "✓ Ready"
                : "○ Pre-Check"}
            </span>
          </div>
        </div>
      )}

      {exam.status === "upcoming" && (
        <div className="preparation-summary">
          <span>✓ Exam details</span>
          <span>✓ Hall & Seating verified</span>
          <span>✓ Camera nodes connected</span>
          <span>✓ 100% Calibrated</span>
          <span className="text-ready">
            ● Ready to Start
          </span>
        </div>
      )}

      {exam.status === "live" && (
        <div className="live-summary">
          <div>
            <span>Elapsed Time</span>
            <strong>{exam.elapsed || "00:45:10"}</strong>
          </div>

          <div>
            <span>Attended Candidates</span>
            <strong>{exam.students || 72}</strong>
          </div>

          <div>
            <span>Telemetry Pipeline</span>
            <strong style={{ color: "#10b981" }}>
              ● Active Streaming
            </strong>
          </div>
        </div>
      )}

      {exam.status === "completed" && (
        <div className="completed-summary">
          <div>
            <span>Integrity Flags</span>
            <strong>
              {exam.summary
                ? exam.summary.totalEvents
                : 14}
            </strong>
          </div>

          <div>
            <span>Human Reviewed</span>
            <strong>
              {exam.summary
                ? exam.summary.reviewedCount
                : 7}
            </strong>
          </div>

          <div>
            <span>False Alarms</span>
            <strong style={{ color: "#10b981" }}>
              {exam.summary
                ? exam.summary.falseAlarmsCount
                : 5}
            </strong>
          </div>
        </div>
      )}

      <div className="exam-card-actions">
        {exam.status === "upcoming" && (
          <>
            <button
              type="button"
              className="secondary-button"
              onClick={() => onEditUpcoming(exam.id)}
            >
              Review Config
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={() => onMonitor(exam.id)}
            >
              Start Session →
            </button>
          </>
        )}

        {exam.status === "live" && (
          <button
            type="button"
            className="primary-button wide-button"
            onClick={() => onMonitor(exam.id)}
          >
            Open Live Monitor →
          </button>
        )}

        {exam.status === "completed" && (
          <button
            type="button"
            className="secondary-button wide-button"
            onClick={() => onViewSummary(exam)}
          >
            View Session Summary →
          </button>
        )}

        {exam.status === "draft" && (
          <button
            type="button"
            className="primary-button wide-button"
            onClick={() => onContinueSetup(exam.id)}
          >
            Continue Setup (Step{" "}
            {exam.currentStep || 1}) →
          </button>
        )}
      </div>
    </article>
  );
}

export default function Exams({ onNavigate }) {
  const [viewMode, setViewMode] = useState("catalog");
  const [wizardExamId, setWizardExamId] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);

  const [examsList, setExamsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const loadExams = useCallback(async () => {
    setLoading(true);

    try {
      const data = await examService.getExams();

      const formattedExams = Array.isArray(data)
        ? data.map(normalizeExam)
        : [];

      console.log("P4 BACKEND EXAMS:", formattedExams);

      setExamsList(formattedExams);
    } catch (error) {
      console.error("Failed to load examinations:", error);
      setExamsList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const tabs = [
    { id: "all", label: "All" },
    { id: "upcoming", label: "Upcoming" },
    { id: "live", label: "Live" },
    { id: "completed", label: "Completed" },
    { id: "draft", label: "Drafts" },
  ];

  const filteredExams = useMemo(() => {
    return examsList.filter((exam) => {
      const matchesTab =
        activeTab === "all" ||
        exam.status === activeTab;

      const searchText = search.toLowerCase();

      const matchesSearch =
        (exam.title &&
          exam.title.toLowerCase().includes(searchText)) ||
        (exam.subject &&
          exam.subject.toLowerCase().includes(searchText)) ||
        (exam.hall &&
          exam.hall.toLowerCase().includes(searchText));

      const matchesFilter =
        filter === "all" ||
        exam.hall === filter;

      return (
        matchesTab &&
        matchesSearch &&
        matchesFilter
      );
    });
  }, [examsList, activeTab, search, filter]);

  const countByStatus = (status) =>
    examsList.filter(
      (exam) => exam.status === status
    ).length;

  const handleOpenNewWizard = () => {
    setWizardExamId(null);
    setViewMode("wizard");
  };

  const handleContinueSetup = (examId) => {
    setWizardExamId(examId);
    setViewMode("wizard");
  };

  const handleViewSummary = (exam) => {
    setSelectedExam(exam);
    setViewMode("summary");
  };

  const handleMonitorLive = (examId) => {
    if (onNavigate) {
      onNavigate("live", examId);
    }
  };

  const handleWizardComplete = () => {
    setViewMode("catalog");
    setWizardExamId(null);
    loadExams();
  };

  const handleWizardStartLive = (examId) => {
    setViewMode("catalog");
    loadExams();

    if (onNavigate) {
      onNavigate("live", examId);
    }
  };

  const handleResetData = () => {
    examService.resetStore();
    loadExams();
  };

  if (viewMode === "wizard") {
    return (
      <ExamWizard
        initialExamId={wizardExamId}
        onCancel={() => setViewMode("catalog")}
        onComplete={handleWizardComplete}
        onStartLive={handleWizardStartLive}
      />
    );
  }

  if (viewMode === "summary") {
    return (
      <SessionSummary
        exam={selectedExam}
        onBack={() => setViewMode("catalog")}
      />
    );
  }

  return (
    <div className="exams-page">
      <section className="exams-header">
        <div>
          <p className="eyebrow">
            EXAMINATION MANAGEMENT
          </p>

          <h1>Exams Hub</h1>

          <p className="exams-subtitle">
            Create, configure, schedule, and review
            examination sessions and integrity reports.
          </p>
        </div>

        <div className="header-actions-group">
          <button
            type="button"
            className="create-exam-button"
            onClick={handleOpenNewWizard}
          >
            + Create Examination
          </button>
        </div>
      </section>

      <section className="exam-overview">
        <div className="overview-card">
          <span>Total Exams</span>
          <strong>{examsList.length}</strong>
        </div>

        <div className="overview-card">
          <span>Upcoming</span>
          <strong>
            {countByStatus("upcoming")}
          </strong>
        </div>

        <div className="overview-card">
          <span>Live Active</span>
          <strong style={{ color: "#d97706" }}>
            {countByStatus("live")}
          </strong>
        </div>

        <div className="overview-card">
          <span>Completed Audits</span>
          <strong style={{ color: "#10b981" }}>
            {countByStatus("completed")}
          </strong>
        </div>
      </section>

      <section className="exam-toolbar">
        <div className="exam-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`exam-tab ${
                activeTab === tab.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab(tab.id)
              }
            >
              {tab.label}

              <span className="tab-count">
                {tab.id === "all"
                  ? examsList.length
                  : countByStatus(tab.id)}
              </span>
            </button>
          ))}
        </div>

        <div className="toolbar-actions">
          <input
            type="text"
            placeholder="Search examinations..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="search-input"
          />

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
            className="hall-filter"
          >
            <option value="all">All Halls</option>
            <option value="Hall A">Hall A</option>
            <option value="Hall B">Hall B</option>
            <option value="Hall C">Hall C</option>
          </select>
        </div>
      </section>

      <section className="exams-list">
        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner" />
            <p>Loading examinations...</p>
          </div>
        ) : filteredExams.length > 0 ? (
          filteredExams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onContinueSetup={handleContinueSetup}
              onViewSummary={handleViewSummary}
              onMonitor={handleMonitorLive}
              onEditUpcoming={handleContinueSetup}
            />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">⌕</div>

            <h3>No examinations found</h3>

            <p>
              Try clearing your search filters or
              create a new examination.
            </p>

            <button
              type="button"
              className="primary-button"
              style={{ marginTop: "12px" }}
              onClick={handleOpenNewWizard}
            >
              + Create Examination
            </button>
          </div>
        )}
      </section>

      <footer className="exams-catalog-footer">
        <div className="footer-reset-bar">
          <span>
            PEHRA Examination Management • Person 2
            Subsystem Active
          </span>

          <button
            type="button"
            className="btn-reset-demo"
            onClick={handleResetData}
          >
            ↻ Reset Store to Seed Mocks
          </button>
        </div>
      </footer>
    </div>
  );
}