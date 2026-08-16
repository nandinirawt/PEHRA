function Navbar({ activePage, onNavigate }) {
  return (
    <header className="navbar">

      {/* Brand */}
      <div className="brand">
        <img
          src="/pehra-logo.png"
          alt="PEHRA"
          className="brand-logo"
        />

        <span className="brand-name">
          PEHRA
        </span>
      </div>


      {/* Navigation */}
      <nav className="nav-links">

        <button
          className={`nav-link-button ${
            activePage === "dashboard" ? "active" : ""
          }`}
          onClick={() => onNavigate("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={`nav-link-button ${
            activePage === "exams" ? "active" : ""
          }`}
          onClick={() => onNavigate("exams")}
        >
          Exams
        </button>

        <button
          className={`nav-link-button ${
            activePage === "live" ? "active" : ""
          }`}
          onClick={() => onNavigate("live")}
        >
          Live Monitor
        </button>

        <button
          className={`nav-link-button ${
            activePage === "privacy" ? "active" : ""
          }`}
          onClick={() => onNavigate("privacy")}
        >
          Privacy
        </button>

      </nav>


      {/* Right side */}
      <div className="nav-right">

        <button className="notification">
          <span className="notification-dot"></span>
          ◌
        </button>

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