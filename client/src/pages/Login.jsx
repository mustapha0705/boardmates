import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import AuthLayout from "../components/public/AuthLayout.jsx";
import Button from "../components/ui/Button.jsx";
import Callout from "../components/ui/Callout.jsx";
import { MailIcon, PasswordField, TextField } from "../components/ui/Fields.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const passwordResetSuccess = location.state?.passwordResetSuccess;
  const returnState = location.state?.from != null ? { from: location.state.from } : undefined;

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
    <AuthLayout
      heading="Welcome back"
      lead="Sign in to submit games and continue your reviews."
      tabs={{ active: "login", state: returnState }}
      footer={
        <>
          Need help? <a href="mailto:chess.boardmates@gmail.com?subject=Support Request">Email support</a>
        </>
      }
    >
      <title>Boardmates | Login</title>

      {passwordResetSuccess ? (
        <Callout tone="success" role="status" title="Password updated">
          You can now sign in with your new password.
        </Callout>
      ) : null}

      {error ? (
        <Callout tone="error" role="alert" title="We couldn't sign you in">
          {error}
        </Callout>
      ) : null}

      <form className="bm-auth__form" onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          placeholder="name@company.com"
          autoComplete="email"
          icon={<MailIcon />}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
        />

        <PasswordField
          label="Password"
          placeholder="Your password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting}
          labelAside={
            <Link to="/forgot-password" className="bm-link">
              Forgot password?
            </Link>
          }
        />

        <Button type="submit" variant="primary" size="lg" block loading={submitting} disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
