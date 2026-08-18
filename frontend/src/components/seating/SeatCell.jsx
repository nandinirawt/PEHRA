import React from "react";

export default function SeatCell({
  seatId,
  rowLabel,
  colNumber,
  isDisabled = false,
  isSelected = false,
  zone = null,
  zoneColor = null,
  onClick,
  mode = "toggle", // 'toggle' | 'select' | 'view'
}) {
  return (
    <button
      type="button"
      className={`seat-cell ${isDisabled ? "disabled" : "active"} ${
        isSelected ? "selected" : ""
      }`}
      style={{
        borderColor: !isDisabled && zoneColor ? zoneColor : undefined,
        backgroundColor:
          !isDisabled && zoneColor ? `${zoneColor}18` : undefined,
      }}
      onClick={() => onClick && onClick(seatId, { rowLabel, colNumber, isDisabled })}
      title={`${seatId} ${isDisabled ? "(Disabled)" : zone ? `— ${zone}` : ""}`}
    >
      <span className="seat-id">{seatId}</span>
      {zone && !isDisabled && <span className="seat-zone-tag">{zone}</span>}
      {isDisabled && <span className="seat-disabled-mark">✕</span>}
    </button>
  );
}
