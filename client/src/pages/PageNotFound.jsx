import { Link } from "react-router-dom";
import "../styles/not-found.css";

export default function PageNotFound() {
  return (
    <div className="nf-page">
      <div className="nf-card">
        <div className="nf-board">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="1.2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 9h18M9 3v18"/>
          </svg>
        </div>
        <h1 className="nf-code">404</h1>
        <h2 className="nf-title">Page not found</h2>
        <p className="nf-sub">
          Looks like this square is off the board. The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="nf-actions">
          <Link to="/" className="nf-primary-btn">Back to Feed</Link>
          <Link to="/submit" className="nf-secondary-btn">Submit a Game</Link>
        </div>
      </div>
      <p className="nf-footer">© 2024 Boardmates · Chess MVP</p>
    </div>
  );
}