import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);

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

          <form className="signup-form">
            <div className="form-group">
              <label>Email address</label>
              <input type="email" placeholder="name@example.com"/>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input type={showPassword ? "text" : "password"} placeholder="Create a strong password"/>
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                <input type="text" placeholder="e.g. magnus_c"/>
              </div>
              <div className="form-group">
                <label>Your rating (ELO)</label>
                <input type="number" placeholder="e.g. 1500"/>
              </div>
            </div>

            <button className="primary-btn" type="submit">
              Create account
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </form>

          <p className="terms">
            By signing up, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>

          <footer className="signup-footer">
            <span>© 2024 Boardmates</span>
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