import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import Button from "../ui/Button.jsx";

/**
 * Page header for signed-in routes. Search and notifications from the export are
 * deferred: neither has backend support yet.
 */
export default function AppHeader({ title, showSubmitCta = false }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <header className="bm-app__header">
      <span className="bm-app__title">{title}</span>
      <div className="bm-app__header-actions">
        {showSubmitCta ? (
          <Button as={Link} to="/submit" variant="primary" size="sm">
            Submit game
          </Button>
        ) : null}
        <Button
          type="button"
          variant="tertiary"
          size="sm"
          className="bm-app__header-signout"
          onClick={handleSignOut}
        >
          Sign out
        </Button>
      </div>
    </header>
  );
}
