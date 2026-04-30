import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const passwordResetSuccess = location.state?.passwordResetSuccess;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signIn({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.message || "";
      if (msg.toLowerCase().includes("email not confirmed")) {
        setError("Your email hasn't been confirmed yet. Please check your inbox for the confirmation link.");
      } else {
        setError(msg || "Invalid email or password");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <title>Boardmates | Login</title>
      <div className="login-wrapper">
        <div className="login-card">

          <div className="auth-logo">
            <div className="auth-logo-icon">
              <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
                <rect x="2" y="2" width="5" height="5" rx="1" fill="#f0ede4"/>
                <rect x="9" y="2" width="5" height="5" rx="1" fill="#f0ede4" opacity=".5"/>
                <rect x="2" y="9" width="5" height="5" rx="1" fill="#f0ede4" opacity=".5"/>
                <rect x="9" y="9" width="5" height="5" rx="1" fill="#f0ede4"/>
              </svg>
            </div>
            <div>
              <div className="auth-logo-text">Boardmates</div>
              <div className="auth-logo-sub">Chess</div>
            </div>
          </div>

          <div className="login-header">
            <h2>Welcome back</h2>
            <p>Please enter your details to sign in.</p>
          </div>

          {passwordResetSuccess ? (
            <div className="auth-success">Password updated successfully. You can now sign in.</div>
          ) : null}

          {error && <div className="auth-error">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M2 7l10 7 10-7"/>
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

            <div className="form-group">
              <div className="label-row">
                <label>Password</label>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="remember">
              <input type="checkbox" id="remember"/>
              <label htmlFor="remember">Remember me for 30 days</label>
            </div>

            <button className="primary-btn" type="submit" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="auth-footer-text">
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>

        <div className="bottom-links">
          <a>Privacy Policy</a>
          <a>Terms of Service</a>
          <a href="mailto:chess.boardmates@gmail.com?subject=Support Request">Contact Support</a>
        </div>
      </div>
    </div>
  );
}
