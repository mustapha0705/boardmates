import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import AuthLayout from "../components/public/AuthLayout.jsx";
import Button from "../components/ui/Button.jsx";
import Callout from "../components/ui/Callout.jsx";
import { PasswordField } from "../components/ui/Fields.jsx";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    <AuthLayout
      heading="Create a new password"
      lead="Choose a new password to finish recovering your account."
      footer={
        <>
          <Link to="/login">Back to sign in</Link>
        </>
      }
    >
      <title>Boardmates | New Password</title>

      {loading ? (
        <p className="bm-body" role="status" aria-live="polite">
          Validating recovery link&hellip;
        </p>
      ) : !validRecoverySession ? (
        <div className="bm-auth__confirmation">
          <Callout tone="warning" role="status" title="This recovery link is invalid or has expired">
            Request a new link to continue.
          </Callout>
          <Button as={Link} to="/forgot-password" variant="primary" size="lg">
            Request new link
          </Button>
        </div>
      ) : (
        <>
          {error ? (
            <Callout tone="error" role="alert" title="We couldn't update your password">
              {error}
            </Callout>
          ) : null}

          <form className="bm-auth__form" onSubmit={handleSubmit}>
            <PasswordField
              label="New password"
              placeholder="Enter new password"
              autoComplete="new-password"
              hint="At least 6 characters."
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />

            <PasswordField
              label="Confirm new password"
              placeholder="Re-enter new password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitting}
            />

            <Button type="submit" variant="primary" size="lg" block loading={submitting} disabled={submitting}>
              {submitting ? "Saving…" : "Save new password"}
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
