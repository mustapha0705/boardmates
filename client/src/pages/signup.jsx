import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { validateChessUsername } from "../services/api";
import AuthLayout from "../components/public/AuthLayout.jsx";
import Button from "../components/ui/Button.jsx";
import Callout from "../components/ui/Callout.jsx";
import { MailIcon, PasswordField, SelectField, TextField } from "../components/ui/Fields.jsx";

function formatSignupError(err) {
  const raw = err?.message || "";
  const m = raw.toLowerCase();
  if (m.includes("rate limit")) {
    return "email rate limit exceeded";
  }
  if (m === "validation failed") {
    return "We couldn't find that username on the selected platform. Please check and try again.";
  }
  return raw || "Signup failed";
}

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [chessPlatform, setChessPlatform] = useState("chess_com");
  const [chessUsername, setChessUsername] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [usernameCheck, setUsernameCheck] = useState({ status: "idle", message: "" });
  /** null | "verify_email" | "repeat" */
  const [afterSignup, setAfterSignup] = useState(null);
  const latestUsernameCheckRef = useRef(0);

  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnState = location.state?.from != null ? { from: location.state.from } : undefined;

  function clearUsernameCheck() {
    setUsernameCheck({ status: "idle", message: "" });
  }

  async function handleUsernameBlur() {
    const handle = chessUsername.trim().toLowerCase();
    if (!chessPlatform || handle.length < 2) {
      clearUsernameCheck();
      return;
    }

    const checkId = ++latestUsernameCheckRef.current;
    setUsernameCheck({ status: "checking", message: "Checking username..." });

    try {
      await validateChessUsername({
        chessUsername: handle,
        chessPlatform,
      });
      if (checkId !== latestUsernameCheckRef.current) return;
      setUsernameCheck({ status: "valid", message: "Valid account found on selected platform." });
    } catch (err) {
      if (checkId !== latestUsernameCheckRef.current) return;
      const message =
        err?.body?.errors?.[0]?.message ||
        err?.message ||
        "We couldn't verify that username right now.";
      setUsernameCheck({ status: "invalid", message });
    }
  }

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
      setError(formatSignupError(err));
    } finally {
      setSubmitting(false);
    }
  }

  const heading =
    afterSignup === "repeat"
      ? "This email is already in use"
      : afterSignup === "verify_email"
        ? "Check your inbox"
        : "Create your account";

  const lead =
    afterSignup === "repeat"
      ? "An account with this email already exists. Sign in instead, or use a different address."
      : afterSignup === "verify_email"
        ? `We've sent a confirmation link to ${email}. Click the link in the email to activate your account.`
        : "Sign up with your email to submit games and get them reviewed.";

  const usernameHintTone =
    usernameCheck.status === "valid" ? "success" : usernameCheck.status === "invalid" ? "error" : undefined;

  return (
    <AuthLayout
      heading={heading}
      lead={lead}
      tabs={afterSignup ? undefined : { active: "signup", state: returnState }}
      footer={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <title>Boardmates | Signup</title>

      {afterSignup ? (
        <div className="bm-auth__confirmation">
          {afterSignup === "verify_email" ? (
            <Callout tone="success" role="status" title="Confirmation email sent">
              Open the link in that email to activate your account, then sign in.
            </Callout>
          ) : (
            <Callout tone="warning" role="status" title="Email already registered">
              Sign in with this address, or start again with a different one.
            </Callout>
          )}

          <Button as={Link} to="/login" variant="primary" size="lg">
            Go to sign in
          </Button>

          {afterSignup === "repeat" ? (
            <button type="button" className="bm-auth__inline-button" onClick={() => setAfterSignup(null)}>
              Try a different email
            </button>
          ) : null}
        </div>
      ) : (
        <>
          {error ? (
            <Callout tone="error" role="alert" title="We couldn't create your account">
              {error}
            </Callout>
          ) : null}

          <form className="bm-auth__form" onSubmit={handleSubmit}>
            <TextField
              label="Email address"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              icon={<MailIcon />}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />

            <PasswordField
              label="Password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              hint="At least 6 characters."
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />

            <SelectField
              label="Your rating comes from"
              value={chessPlatform}
              onChange={(e) => {
                setChessPlatform(e.target.value);
                clearUsernameCheck();
              }}
              disabled={submitting}
            >
              <option value="chess_com">Chess.com</option>
              <option value="lichess">Lichess</option>
            </SelectField>

            <TextField
              label="Username on that site"
              placeholder="e.g. your_handle"
              autoComplete="username"
              hint={usernameCheck.status === "idle" ? undefined : usernameCheck.message}
              hintTone={usernameHintTone}
              required
              value={chessUsername}
              onChange={(e) => {
                setChessUsername(e.target.value);
                clearUsernameCheck();
              }}
              onBlur={handleUsernameBlur}
              disabled={submitting}
            />

            <Button type="submit" variant="primary" size="lg" block loading={submitting} disabled={submitting}>
              {submitting ? "Creating account…" : "Create account"}
            </Button>

            <p className="bm-auth__legal">
              We check your username with Chess.com or Lichess so reviewers can be matched by rating. By creating an
              account you agree to follow the Boardmates community guidelines.
            </p>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
