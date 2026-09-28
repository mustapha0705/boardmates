import { Link } from "react-router-dom";
import BrandLogo from "../ui/BrandLogo.jsx";

const SUPPORT_MAILTO = "mailto:chess.boardmates@gmail.com?subject=Support Request";

/**
 * Public footer. Only links that actually work are listed: legal and community
 * pages do not exist yet, so they are omitted rather than shipped as dead links.
 */
export default function PublicFooter() {
  return (
    <footer className="bm-public-footer">
      <div className="bm-shell bm-public-footer__inner">
        <div className="bm-public-footer__brand">
          <BrandLogo showWordmark />
          <p className="bm-meta">Human chess review.</p>
        </div>

        <div className="bm-public-footer__columns">
          <div className="bm-public-footer__column">
            <span className="bm-overline">Product</span>
            <Link to="/submit">Submit a game</Link>
            <a href="#how-it-works">How it works</a>
            <a href="#recent-reviews">Recent reviews</a>
          </div>
          <div className="bm-public-footer__column">
            <span className="bm-overline">Account</span>
            <Link to="/login">Sign in</Link>
            <Link to="/signup">Create account</Link>
          </div>
          <div className="bm-public-footer__column">
            <span className="bm-overline">Support</span>
            <a href={SUPPORT_MAILTO}>Email support</a>
          </div>
        </div>
      </div>
      <div className="bm-shell bm-public-footer__legal">&copy; 2026 Boardmates</div>
    </footer>
  );
}
