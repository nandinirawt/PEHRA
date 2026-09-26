import "./ActiveExamDock.css";

function ActiveExamDock({ onMonitor, onOpenMonitor }) {
  const handleMonitor = onOpenMonitor || onMonitor;

  return (
    <button
      className="active-exam-dock"
      onClick={handleMonitor}
      type="button"
      aria-label="Open Live Monitor"
    >
      {/* Live status */}
      <div className="dock-status">
        <span className="dock-pulse"></span>
        <span>LIVE</span>
      </div>

      {/* Divider */}
      <div className="dock-divider"></div>

      {/* Exam information */}
      <div className="dock-info">
        <strong>Hall A</strong>
        <span>Semester End Examination — Mathematics</span>
      </div>

      {/* Students */}
      <div className="dock-students">
        72 Students
      </div>

      {/* Time */}
      <div className="dock-time">
        01:24:32
      </div>

      {/* Monitor */}
      <div className="dock-monitor">
        Monitor →
      </div>
    </button>
  );
}

export default ActiveExamDock;
