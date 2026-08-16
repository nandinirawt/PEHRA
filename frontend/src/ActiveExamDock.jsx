function ActiveExamDock() {
  return (
    <div className="active-exam-dock">
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

      <div className="dock-time">
        01:24:32
      </div>
    </div>
  );
}

export default ActiveExamDock;