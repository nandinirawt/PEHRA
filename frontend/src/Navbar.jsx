function Navbar({ page, setPage }) {
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <header className="navbar">

      {/* BRAND */}
      <div className="brand">
        <img
          src="/pehra-navbar-logo.png"
          alt="PEHRA"
          className="brand-logo"
        />

        <span className="brand-name">
          PEHRA
        </span>
      </div>


      {/* NAVIGATION */}
      <nav className="nav-links">

        <button
          className={`nav-link-button ${
            page === "dashboard" ? "active" : ""
          }`}
          onClick={() => handlePageChange("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={`nav-link-button ${
            page === "exams" ? "active" : ""
          }`}
          onClick={() => handlePageChange("exams")}
        >
          Exams
        </button>

        <button
          className={`nav-link-button ${
            page === "live" ? "active" : ""
          }`}
          onClick={() => handlePageChange("live")}
        >
          Live Monitor
        </button>

        <button
          className={`nav-link-button ${
            page === "privacy" ? "active" : ""
          }`}
          onClick={() => handlePageChange("privacy")}
        >
          Privacy
        </button>

      </nav>


      {/* RIGHT SIDE */}
      <div className="nav-right">

        {/* Notification */}
        <button className="notification">
          ◌
          <span className="notification-dot"></span>
        </button>


        {/* Profile */}
        <div className="profile">

          <div className="avatar">
            N
          </div>

          <div className="profile-info">
            <span className="profile-name">
              Nandini
            </span>

            <span className="profile-role">
              Invigilator
            </span>
          </div>

        </div>

      </div>

    </header>
  );
}

export default Navbar;