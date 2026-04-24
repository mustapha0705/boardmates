import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/auth.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [chessPlatform, setChessPlatform] = useState("chess_com");
  const [chessUsername, setChessUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  /** null | "verify_email" (new user, mail may be sent) | "repeat" (address already in Supabase; no signup email) */
  const [afterSignup, setAfterSignup] = useState(null);

  const { signUp, resendSignupEmail } = useAuth();
  const navigate = useNavigate();
  const [resendState, setResendState] = useState({ status: "idle", message: "" });

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const localSupabaseDev = /127\.0\.0\.1:54321|localhost:54321/.test(supabaseUrl);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const handle = chessUsername.trim();
    if (handle.length < 2) {
      setError("Enter your Chess.com or Lichess username (at least 2 characters)");
      return;
    }

    if (!chessPlatform) {
      setError("Choose which platform your username is from");
      return;
    }

    setSubmitting(true);

    try {
      const result = await signUp({
        email,
        password,
        chessPlatform,
        chessUsername: handle,
      });

      if (result.session) {
        navigate("/", { replace: true });
      } else if (result.repeatedSignup) {
        setAfterSignup("repeat");
      } else if (result.needsConfirmation) {
        setAfterSignup("verify_email");
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setSubmitting(false);
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
            <h1>
              {afterSignup === "repeat"
                ? "This email is already registered"
                : afterSignup === "verify_email"
                  ? "Check your inbox"
                  : "Create your account"}
            </h1>
            <p>
              {afterSignup === "repeat"
                ? `That address is already registered. Submitting the sign-up form again does not send another confirmation email. Sign in, or use resend if you never verified.`
                : afterSignup === "verify_email"
                  ? `We've sent a confirmation link to ${email}. Click the link in the email to activate your account.`
                  : "Sign up with email to share games and get them reviewed."}
            </p>
          </div>

          {afterSignup ? (
            <div className="auth-confirmation">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M2 7l10 7 10-7"/>
              </svg>
              {afterSignup === "repeat" ? (
                <p className="auth-confirmation-hint">
                  <Link to="/login" className="auth-link-btn" style={{ display: "inline" }}>
                    Go to sign in
                  </Link>
                  {" "}with this email. If you still need a confirmation link and the account is unverified, try{" "}
                  <button
                    type="button"
                    className="auth-link-btn"
                    disabled={resendState.status === "sending"}
                    onClick={async () => {
                      setResendState({ status: "sending", message: "" });
                      try {
                        await resendSignupEmail(email);
                        setResendState({
                          status: "sent",
                          message: "If the account exists and is unconfirmed, a message may arrive shortly.",
                        });
                      } catch (err) {
                        setResendState({
                          status: "error",
                          message: err.message || "Could not resend.",
                        });
                      }
                    }}
                  >
                    {resendState.status === "sending" ? "Sending…" : "resend confirmation email"}
                  </button>
                  . To start over, an admin can delete the user in the Supabase dashboard (Authentication → Users).{" "}
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => {
                      setAfterSignup(null);
                      setResendState({ status: "idle", message: "" });
                    }}
                  >
                    Use a different email
                  </button>
                </p>
              ) : (
              <p className="auth-confirmation-hint">
                Didn&apos;t receive the email? Check spam, wait a few minutes (default mail can be slow), or{" "}
                <button
                  type="button"
                  className="auth-link-btn"
                  disabled={resendState.status === "sending"}
                  onClick={async () => {
                    setResendState({ status: "sending", message: "" });
                    try {
                      await resendSignupEmail(email);
                      setResendState({
                        status: "sent",
                        message: "If delivery is working, another message should arrive shortly.",
                      });
                    } catch (err) {
                      setResendState({
                        status: "error",
                        message: err.message || "Could not resend. Check Supabase Auth logs.",
                      });
                    }
                  }}
                >
                  {resendState.status === "sending" ? "Sending…" : "resend confirmation email"}
                </button>
                . You can also{" "}
                <button type="button" className="auth-link-btn" onClick={() => { setAfterSignup(null); setResendState({ status: "idle", message: "" }); }}>
                  try signing up again
                </button>
                .
              </p>
              )}
              {resendState.message ? (
                <p className={`auth-resend-msg ${resendState.status === "error" ? "auth-error" : "auth-resend-ok"}`}>
                  {resendState.message}
                </p>
              ) : null}
              {afterSignup === "verify_email" ? (
                localSupabaseDev ? (
                  <p className="auth-troubleshooting">
                    Local Supabase: messages are not sent to a real inbox. Open the{" "}
                    <strong>Inbucket</strong> UI (often{" "}
                    <a href="http://127.0.0.1:54324" target="_blank" rel="noreferrer">
                      http://127.0.0.1:54324
                    </a>
                    ) to read the confirmation email.
                  </p>
                ) : (
                  <details className="auth-troubleshooting">
                    <summary>Still nothing? (Supabase project checks)</summary>
                    <ul>
                      <li>
                        Dashboard → <strong>Authentication</strong> → <strong>URL Configuration</strong>: add your app URL
                        to <strong>Redirect URLs</strong> (e.g. <code>http://localhost:5173/**</code>). If you use{" "}
                        <code>127.0.0.1</code> in the browser, add that too—or set{" "}
                        <code>VITE_AUTH_EMAIL_REDIRECT_ORIGIN</code> in <code>.env</code> to match what you allowlisted.
                      </li>
                      <li>
                        Dashboard → <strong>Logs</strong> → <strong>Auth</strong>: look for errors when you sign up (SMTP /
                        rate limits).
                      </li>
                      <li>
                        Default Supabase email is rate-limited and often filtered. For reliable delivery, configure{" "}
                        <strong>custom SMTP</strong> (see{" "}
                        <a href="https://supabase.com/docs/guides/auth/auth-smtp" target="_blank" rel="noreferrer">
                          Supabase SMTP docs
                        </a>
                        ).
                      </li>
                      <li>
                        For local MVP only: Dashboard → <strong>Authentication</strong> → <strong>Providers</strong> →{" "}
                        <strong>Email</strong> → turn off <strong>Confirm email</strong> so sign-in works without mail.
                      </li>
                    </ul>
                  </details>
                )
              ) : null}
              <Link to="/login" className="primary-btn" style={{ display: "inline-block", textAlign: "center", textDecoration: "none", marginTop: 8 }}>
                Go to login
              </Link>
            </div>
          ) : (
          <>
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

            <div className="form-group">
              <label htmlFor="chess-platform">Username is on</label>
              <select
                id="chess-platform"
                value={chessPlatform}
                onChange={(e) => setChessPlatform(e.target.value)}
                disabled={submitting}
                className="auth-select"
              >
                <option value="chess_com">Chess.com</option>
                <option value="lichess">Lichess</option>
              </select>
            </div>

            <div className="form-group">
              <label>Username on that site</label>
              <input
                type="text"
                placeholder="e.g. your_handle"
                required
                value={chessUsername}
                onChange={(e) => setChessUsername(e.target.value)}
                disabled={submitting}
                autoComplete="username"
              />
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

          <p className="terms">
            By signing up, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>
          </>
          )}

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
