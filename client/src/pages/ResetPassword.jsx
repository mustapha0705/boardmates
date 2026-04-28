import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/auth.css";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [validRecoverySession, setValidRecoverySession] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { session, loading, updatePassword, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setValidRecoverySession(Boolean(session));
  }, [session]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await updatePassword(password);
      await signOut();
      navigate("/login", {
        replace: true,
        state: { passwordResetSuccess: true },
      });
    } catch (err) {
      setError(err.message || "Could not reset password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <title>Boardmates | New Password</title>
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
            <h2>Create a new password</h2>
            <p>Choose a strong password to finish recovering your account.</p>
          </div>

          {loading ? (
            <div className="auth-confirmation">
              <p className="auth-confirmation-hint">Validating recovery link...</p>
            </div>
          ) : !validRecoverySession ? (
            <div className="auth-confirmation">
              <p className="auth-confirmation-hint">
                This recovery link is invalid or has expired. Request a new one to continue.
              </p>
              <Link
                to="/forgot-password"
                className="primary-btn"
                style={{ display: "inline-block", textAlign: "center", textDecoration: "none", marginTop: 8 }}
              >
                Request new link
              </Link>
            </div>
          ) : (
            <>
              {error && <div className="auth-error">{error}</div>}
              <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>New password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={submitting}
                    />
                    <button type="button" onClick={() => setShowPassword((prev) => !prev)}>
                      {showPassword ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm new password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <button className="primary-btn" type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save new password"}
                </button>
              </form>
            </>
          )}

          <p className="auth-footer-text">
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
