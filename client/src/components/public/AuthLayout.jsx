import { Link } from "react-router-dom";
import BrandLogo from "../ui/BrandLogo.jsx";
import "../../styles/auth.css";

/**
 * Split authentication layout from the approved export.
 * The export's left panel holds a testimonial; we show product facts instead,
 * because no real, consented quote exists yet.
 */

const POINTS = [
  "Submit a PGN with the question you actually want answered.",
  "One reviewer with a verified rating claims the game and keeps it until they publish.",
  "Notes arrive anchored to the moves they explain, so the lesson is easy to replay.",
];

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function AuthLayout({ heading, lead, tabs, children, footer }) {
  return (
    <div className="bm-page bm-auth">
      <a className="bm-skip-link" href="#main-content">
        Skip to main content
      </a>

      <div className="bm-auth__grid">
        <aside className="bm-auth__aside">
          <Link to="/" className="bm-brand bm-auth__aside-brand" aria-label="Boardmates home">
            <BrandLogo tagline="Human review" />
          </Link>

          <div className="bm-auth__aside-body">
            <p className="bm-serif-lead">Games reviewed by a stronger player, in their own words.</p>
            <ul className="bm-auth__points">
              {POINTS.map((point) => (
                <li key={point} className="bm-auth__point">
                  <CheckIcon />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main id="main-content" className="bm-auth__panel">
          <div className="bm-auth__card">
            <Link to="/" className="bm-brand bm-auth__panel-brand" aria-label="Boardmates home">
              <BrandLogo />
            </Link>

            {tabs ? (
              <nav className="bm-segmented" aria-label="Account">
                <Link
                  to="/login"
                  state={tabs.state}
                  className={`bm-segmented__item ${tabs.active === "login" ? "is-active" : ""}`}
                  aria-current={tabs.active === "login" ? "page" : undefined}
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  state={tabs.state}
                  className={`bm-segmented__item ${tabs.active === "signup" ? "is-active" : ""}`}
                  aria-current={tabs.active === "signup" ? "page" : undefined}
                >
                  Create account
                </Link>
              </nav>
            ) : null}

            <div className="bm-auth__heading">
              <h1 className="bm-h1">{heading}</h1>
              {lead ? <p className="bm-body">{lead}</p> : null}
            </div>

            {children}
          </div>

          {footer ? <div className="bm-auth__footnote">{footer}</div> : null}
        </main>
      </div>
    </div>
  );
}
