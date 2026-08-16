function ActiveExamDock({ onMonitor }) {
  return (
    <button
      className="active-exam-dock"
      onClick={onMonitor}
      type="button"
      aria-label="Open live monitor"
    >
      <div className="dock-status">
        <span className="dock-pulse"></span>
        LIVE
      </div>

      <div className="dock-divider"></div>

      <div className="dock-info">
        <strong>Hall A</strong>
        <span>
          Semester End Examination — Mathematics
        </span>
      </div>

      <div className="dock-students">
        72 Students
      </div>

      <div className="dock-monitor">
        Monitor →
      </div>
    </button>
  );
}

export default ActiveExamDock;