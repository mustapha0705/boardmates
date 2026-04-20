import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [chessUsername, setChessUsername] = useState("");
  const [rating, setRating] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const displayName = email.split("@")[0] || "Player";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);

    try {
      await signUp({
        email,
        password,
        displayName,
        chessUsername: chessUsername || null,
        rating: rating || null,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    }
  }

  return (
    <div className="signup-page">
      <main className="signup-main">
        <div className="signup-card">

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
              <div className="auth-logo-sub">Chess MVP</div>
            </div>
          </div>

          <div className="signup-title">
            <h1>Create your account</h1>
            <p>Join the world's most active community of chess enthusiasts.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
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

            <div className="form-grid-2">
              <div className="form-group">
                <label>Chess.com / Lichess username</label>
                <input
                  type="text"
                  placeholder="e.g. magnus_c"
                  value={chessUsername}
                  onChange={(e) => setChessUsername(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="form-group">
                <label>Your rating (ELO)</label>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>

            <button className="primary-btn" type="submit" disabled={submitting}>
              {submitting ? "Creating account…" : (
                <>
                  Create account
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="divider"><span>Or continue with</span></div>

          <button className="google-btn" type="button" onClick={handleGoogle} disabled={submitting}>
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="terms">
            By signing up, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>

          <footer className="signup-footer">
            <span>&copy; 2024 Boardmates</span>
            <div className="footer-links">
              <a href="#">Help Center</a>
              <a href="#">Community Rules</a>
              <a href="#">Security</a>
            </div>
          </footer>
        </div>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </main>
    </div>
  );
}
