import "./StatusPill.css";

function StatusPill({ status = "Unknown" }) {
  const normalizedStatus = status.toLowerCase();

  return (
    <span className={`status-pill ${normalizedStatus}`}>
      <span className="status-pill-dot"></span>
      {status}
    </span>
  );
}

export default StatusPill;