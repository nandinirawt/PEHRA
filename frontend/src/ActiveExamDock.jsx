import "./ActiveExamDock.css";

function ActiveExamDock({ onOpenMonitor }) {
  return (
    <button
      className="active-exam-dock"
      onClick={onOpenMonitor}
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

        <span>
          Semester End Examination — Mathematics
        </span>
      </div>

      {/* Students */}
      <div className="dock-students">
        72 Students
      </div>

      {/* Time */}
      <div className="dock-time">
        01:24:32
      </div>
    </button>
  );
}

export default ActiveExamDock;