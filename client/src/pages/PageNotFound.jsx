import { Link } from "react-router-dom";
import PublicPage from "../components/public/PublicPage.jsx";
import Button from "../components/ui/Button.jsx";
import "../styles/not-found.css";

export default function PageNotFound() {
  return (
    <PublicPage showSectionNav={false}>
      <title>Boardmates | Page Not Found</title>

      <div className="bm-shell bm-notfound">
        <div className="bm-notfound__card">
          <span className="bm-notfound__code bm-mono">404</span>
          <h1 className="bm-h1">This square is off the board</h1>
          <p className="bm-body">
            The page you asked for doesn&rsquo;t exist or has moved. The published reviews and the submission form are
            still where you left them.
          </p>
          <div className="bm-notfound__actions">
            <Button as={Link} to="/" variant="primary" size="lg">
              Back to home
            </Button>
            <Button as={Link} to="/submit" variant="secondary" size="lg">
              Submit a game
            </Button>
          </div>
        </div>
      </div>
    </PublicPage>
  );
}
