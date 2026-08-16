import { useMemo, useState } from "react";
import "./Exams.css";

const exams = [
  {
    id: 1,
    title: "Semester End Examination — Mathematics",
    subject: "Mathematics",
    date: "18 Aug 2026",
    time: "10:00 AM – 01:00 PM",
    hall: "Hall A",
    students: 72,
    status: "upcoming",
    progress: 100,
  },
  {
    id: 2,
    title: "Digital Electronics — Internal Assessment",
    subject: "Digital Electronics",
    date: "19 Aug 2026",
    time: "09:00 AM – 11:00 AM",
    hall: "Hall B",
    students: 60,
    status: "upcoming",
    progress: 80,
  },
  {
    id: 3,
    title: "Data Structures — Semester Examination",
    subject: "Data Structures",
    date: "16 Aug 2026",
    time: "02:00 PM – 05:00 PM",
    hall: "Hall A",
    students: 68,
    status: "live",
    progress: 100,
    elapsed: "01:24:32",
  },
  {
    id: 4,
    title: "Database Systems — Mid Semester",
    subject: "Database Systems",
    date: "15 Aug 2026",
    time: "02:00 PM – 04:00 PM",
    hall: "Hall C",
    students: 70,
    status: "completed",
    events: 17,
    reviewed: 8,
    falseAlarms: 5,
  },
  {
    id: 5,
    title: "Computer Networks — Internal Assessment",
    subject: "Computer Networks",
    date: "14 Aug 2026",
    time: "11:00 AM – 01:00 PM",
    hall: "Hall B",
    students: 64,
    status: "completed",
    events: 12,
    reviewed: 6,
    falseAlarms: 4,
  },
  {
    id: 6,
    title: "Operating Systems — Semester Examination",
    subject: "Operating Systems",
    date: "20 Aug 2026",
    time: "10:00 AM – 01:00 PM",
    hall: "Hall A",
    students: 72,
    status: "draft",
    progress: 65,
  },
];

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

function ExamCard({ exam }) {
  const status = statusConfig[exam.status];

  return (
    <article className={`exam-card ${exam.status}`}>
      <div className="exam-card-top">
        <div>
          <div className="exam-subject">{exam.subject}</div>
          <h3>{exam.title}</h3>
        </div>

        <span className={`exam-status ${status.className}`}>
          <span className="status-indicator" />
          {status.label}
        </span>
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
          <strong>{exam.students}</strong>
        </div>
      </div>

      {exam.status === "draft" && (
        <div className="progress-section">
          <div className="progress-header">
            <span>Preparation</span>
            <strong>{exam.progress}%</strong>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${exam.progress}%` }}
            />
          </div>

          <div className="progress-steps">
            <span>✓ Exam details</span>
            <span>✓ Seating</span>
            <span>⚠ Calibration</span>
          </div>
        </div>
      )}

      {exam.status === "upcoming" && (
        <div className="preparation-summary">
          <span>✓ Exam details</span>
          <span>✓ Seating</span>
          <span>✓ Camera setup</span>
          {exam.progress === 100 ? (
            <span>✓ Ready</span>
          ) : (
            <span>⚠ Setup incomplete</span>
          )}
        </div>
      )}

      {exam.status === "live" && (
        <div className="live-summary">
          <div>
            <span>Elapsed</span>
            <strong>{exam.elapsed}</strong>
          </div>

          <div>
            <span>Students</span>
            <strong>{exam.students}</strong>
          </div>

          <div>
            <span>Monitoring</span>
            <strong>Active</strong>
          </div>
        </div>
      )}

      {exam.status === "completed" && (
        <div className="completed-summary">
          <div>
            <span>Events</span>
            <strong>{exam.events}</strong>
          </div>

          <div>
            <span>Reviewed</span>
            <strong>{exam.reviewed}</strong>
          </div>

          <div>
            <span>False alarms</span>
            <strong>{exam.falseAlarms}</strong>
          </div>
        </div>
      )}

      <div className="exam-card-actions">
        {exam.status === "upcoming" && (
          <>
            <button className="secondary-button">View Details</button>
            <button className="primary-button">Edit</button>
          </>
        )}

        {exam.status === "live" && (
          <button className="primary-button wide-button">
            Open Live Monitor →
          </button>
        )}

        {exam.status === "completed" && (
          <button className="secondary-button wide-button">
            View Session Summary →
          </button>
        )}

        {exam.status === "draft" && (
          <button className="primary-button wide-button">
            Continue Setup →
          </button>
        )}
      </div>
    </article>
  );
}

function Exams({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const tabs = [
    { id: "all", label: "All" },
    { id: "upcoming", label: "Upcoming" },
    { id: "live", label: "Live" },
    { id: "completed", label: "Completed" },
    { id: "draft", label: "Drafts" },
  ];

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesTab =
        activeTab === "all" || exam.status === activeTab;

      const searchText = search.toLowerCase();

      const matchesSearch =
        exam.title.toLowerCase().includes(searchText) ||
        exam.subject.toLowerCase().includes(searchText) ||
        exam.hall.toLowerCase().includes(searchText);

      const matchesFilter =
        filter === "all" || exam.hall === filter;

      return matchesTab && matchesSearch && matchesFilter;
    });
  }, [activeTab, search, filter]);

  const countByStatus = (status) =>
    exams.filter((exam) => exam.status === status).length;

  return (
    <div className="exams-page">
      <section className="exams-header">
        <div>
          <p className="eyebrow">EXAMINATION MANAGEMENT</p>

          <h1>Exams</h1>

          <p className="exams-subtitle">
            Manage your examinations, schedules and sessions.
          </p>
        </div>

        <button className="create-exam-button">
          + Create Examination
        </button>
      </section>

      <section className="exam-overview">
        <div className="overview-card">
          <span>Total Exams</span>
          <strong>{exams.length}</strong>
        </div>

        <div className="overview-card">
          <span>Upcoming</span>
          <strong>{countByStatus("upcoming")}</strong>
        </div>

        <div className="overview-card">
          <span>Live</span>
          <strong>{countByStatus("live")}</strong>
        </div>

        <div className="overview-card">
          <span>Completed</span>
          <strong>{countByStatus("completed")}</strong>
        </div>
      </section>

      <section className="exam-toolbar">
        <div className="exam-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`exam-tab ${
                activeTab === tab.id ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="toolbar-actions">
          <input
            type="text"
            placeholder="Search examinations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
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
        {filteredExams.length > 0 ? (
          filteredExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">⌕</div>
            <h3>No examinations found</h3>
            <p>
              Try changing your search or filter.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Exams;