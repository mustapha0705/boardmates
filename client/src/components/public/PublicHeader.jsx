import { Link } from "react-router-dom";
import BrandLogo from "../ui/BrandLogo.jsx";
import Button from "../ui/Button.jsx";

/** Responsive public header from the approved export's Public home screen. */
export default function PublicHeader({ showSectionNav = true }) {
  return (
    <header className="bm-public-header">
      <div className="bm-shell bm-public-header__inner">
        <Link to="/" className="bm-brand" aria-label="Boardmates home">
          <BrandLogo showWordmark />
        </Link>

        {showSectionNav ? (
          <nav className="bm-public-header__nav" aria-label="Sections">
            <a href="#how-it-works">How it works</a>
            <a href="#recent-reviews">Recent reviews</a>
          </nav>
        ) : null}

        <div className="bm-public-header__spacer" />

        <div className="bm-public-header__actions">
          <Button as={Link} to="/login" variant="tertiary" size="sm">
            Sign in
          </Button>
          <Button as={Link} to="/signup" variant="primary" size="sm">
            Create account
          </Button>
        </div>
      </div>
    </header>
  );
}
