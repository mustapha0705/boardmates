import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import AuthLayout from "../components/public/AuthLayout.jsx";
import Button from "../components/ui/Button.jsx";
import Callout from "../components/ui/Callout.jsx";
import { MailIcon, TextField } from "../components/ui/Fields.jsx";

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
    <AuthLayout
      heading="Reset your password"
      lead="Enter your account email and we'll send a secure reset link."
      footer={
        <>
          Remembered it? <Link to="/login">Back to sign in</Link>
        </>
      }
    >
      <title>Boardmates | Forgot Password</title>

      {error ? (
        <Callout tone="error" role="alert" title="We couldn't send that link">
          {error}
        </Callout>
      ) : null}

      {sent ? (
        <div className="bm-auth__confirmation">
          <Callout tone="success" role="status" title="Check your inbox">
            If an account exists for {email}, a reset email is on the way.
          </Callout>
          <Button as={Link} to="/login" variant="primary" size="lg">
            Back to sign in
          </Button>
        </div>
      ) : (
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

          <Button type="submit" variant="primary" size="lg" block loading={submitting} disabled={submitting}>
            {submitting ? "Sending link…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
