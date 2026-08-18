import React from "react";

const STATUS_CONFIG = {
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

export default function StatusBadge({ status = "draft" }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  return (
    <span className={`exam-status ${config.className}`}>
      <span className="status-indicator" />
      {config.label}
    </span>
  );
}
