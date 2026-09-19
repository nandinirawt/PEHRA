import "./EventRow.css";

function EventRow({
  time = "",
  title = "Event",
  description = "",
  status = "normal",
}) {
  const normalizedStatus = status.toLowerCase();

  return (
    <div className="event-row">

      <div className={`event-row-dot ${normalizedStatus}`}></div>

      <div className="event-row-content">

        <div className="event-row-main">

          <strong>
            {title}
          </strong>

          {description && (
            <span>
              {description}
            </span>
          )}

        </div>

        {time && (
          <time>
            {time}
          </time>
        )}

      </div>

    </div>
  );
}

export default EventRow;