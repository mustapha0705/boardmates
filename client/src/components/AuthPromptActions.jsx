import { Link, useLocation } from "react-router-dom";
import "../styles/auth-prompt.css";

/**
 * Log in + Sign up links that preserve return navigation via react-router location state.
 */
export default function AuthPromptActions({
  className = "",
  signupFirst = false,
  compact = false,
}) {
  const location = useLocation();
  const state = { from: location };

  const login = (
    <Link to="/login" state={state} className="auth-prompt-btn auth-prompt-login">
      Log in
    </Link>
  );
  const signup = (
    <Link to="/signup" state={state} className="auth-prompt-btn auth-prompt-signup">
      Sign up
    </Link>
  );

  return (
    <div
      className={`auth-prompt-actions ${compact ? "auth-prompt-actions--compact" : ""} ${className}`.trim()}
    >
      {signupFirst ? (
        <>
          {signup}
          {login}
        </>
      ) : (
        <>
          {login}
          {signup}
        </>
      )}
    </div>
  );
}
