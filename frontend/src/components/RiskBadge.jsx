import "./RiskBadge.css";

function RiskBadge({ level = "Unknown" }) {
  const normalizedLevel = level.toLowerCase();

  return (
    <span className={`risk-badge ${normalizedLevel}`}>
      {level}
    </span>
  );
}

export default RiskBadge;