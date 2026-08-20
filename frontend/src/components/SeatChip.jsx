import "./SeatChip.css";

function SeatChip({ seat = "—", status = "normal" }) {
  const normalizedStatus = status.toLowerCase();

  return (
    <span className={`seat-chip ${normalizedStatus}`}>
      {seat}
    </span>
  );
}

export default SeatChip;