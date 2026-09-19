import { useState } from "react";
import "./Login.css";
import loginIllustration from "./assets/login-illustration.png";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4 7l8 6 8-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function EyeIcon({ visible }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <circle
        cx="12"
        cy="12"
        r="2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      {!visible && (
        <path
          d="M4 4l16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        />
      )}
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3l7 3v5c0 4.7-2.8 8-7 10-4.2-2-7-5.3-7-10V6l7-3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      <path
        d="M9 12l2 2 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    // Temporary frontend login.
    // Real backend authentication will be connected later.
    onLogin();
  };

  return (
    <main className="login-page">

      <section className="login-shell">

        {/* LEFT SIDE */}

        <div className="login-visual-panel">

          <img
            src={loginIllustration}
            alt="PEHRA examination monitoring"
            className="login-illustration"
          />

        </div>


        {/* RIGHT SIDE */}

        <div className="login-content">

          <div className="login-content-inner">

            {/* PEHRA LOGO */}

            <div className="login-logo-section">

              <img
                src="/pehraa-logo.png"
                alt="PEHRA"
                className="login-logo"
              />

              <div className="login-divider"></div>

            </div>


            {/* HEADING */}

            <div className="login-heading">

              <h1>
                Welcome back
              </h1>

              <p>
                Sign in to access PEHRA.
              </p>

            </div>


            {/* FORM */}

            <form
              className="login-form"
              onSubmit={handleSubmit}
            >

              {/* EMAIL */}

              <div className="login-field">

                <label htmlFor="email">
                  Email
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    <MailIcon />
                  </span>

                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your college email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    autoComplete="email"
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div className="login-field">

                <label htmlFor="password">
                  Password
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    <LockIcon />
                  </span>

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-eye"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <EyeIcon visible={showPassword} />
                  </button>

                </div>

              </div>


              {/* REMEMBER ME + FORGOT PASSWORD */}

              <div className="login-options">

                <label className="remember-option">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
                  />

                  <span>
                    Remember me
                  </span>

                </label>

                <button
                  type="button"
                  className="forgot-button"
                >
                  Forgot password?
                </button>

              </div>


              {/* ERROR */}

              {error && (
                <p className="login-error">
                  {error}
                </p>
              )}


              {/* SIGN IN */}

              <button
                type="submit"
                className="signin-button"
              >
                <span>
                  Sign In
                </span>

                <span className="signin-arrow">
                  →
                </span>

              </button>

            </form>


            {/* PRIVACY */}

            <div className="login-privacy">

              <div className="privacy-line"></div>

              <div className="privacy-shield">
                <ShieldIcon />
              </div>

              <div className="privacy-line"></div>

            </div>

            <div className="privacy-text">

              <strong>
                Your privacy is our priority.
              </strong>

              <span>
                Secure and ethical exam monitoring.
              </span>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Login;