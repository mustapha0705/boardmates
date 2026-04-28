import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { requestPasswordReset } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err.message || "Unable to send reset link right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <title>Boardmates | Forgot Password</title>
      <div className="login-wrapper">
        <div className="login-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
                <rect x="2" y="2" width="5" height="5" rx="1" fill="#f0ede4" />
                <rect x="9" y="2" width="5" height="5" rx="1" fill="#f0ede4" opacity=".5" />
                <rect x="2" y="9" width="5" height="5" rx="1" fill="#f0ede4" opacity=".5" />
                <rect x="9" y="9" width="5" height="5" rx="1" fill="#f0ede4" />
              </svg>
            </div>
            <div>
              <div className="auth-logo-text">Boardmates</div>
              <div className="auth-logo-sub">Chess</div>
            </div>
          </div>

          <div className="login-header">
            <h2>Reset your password</h2>
            <p>Enter your account email and we&apos;ll send a secure reset link.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {sent ? (
            <div className="auth-confirmation">
              <p className="auth-confirmation-hint">
                If an account exists for <strong>{email}</strong>, a reset email is on the way.
              </p>
              <Link
                to="/login"
                className="primary-btn"
                style={{ display: "inline-block", textAlign: "center", textDecoration: "none", marginTop: 8 }}
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 7l10 7 10-7" />
                  </svg>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              <button className="primary-btn" type="submit" disabled={submitting}>
                {submitting ? "Sending link..." : "Send reset link"}
              </button>
            </form>
          )}

          <p className="auth-footer-text">
            Remembered your password? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
