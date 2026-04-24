import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sb-header">
        <div className="logo-wrap">
          <div className="logo-icon">
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="5" height="5" rx="1" fill="#f0ede4"/>
              <rect x="9" y="2" width="5" height="5" rx="1" fill="#f0ede4" opacity=".5"/>
              <rect x="2" y="9" width="5" height="5" rx="1" fill="#f0ede4" opacity=".5"/>
              <rect x="9" y="9" width="5" height="5" rx="1" fill="#f0ede4"/>
            </svg>
          </div>
          {!collapsed && (
            <div className="logo-text">
              <h2>Boardmates</h2>
              <span>Chess</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="toggle-btn"
          aria-label={mobileOpen ? "Close menu" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => {
            if (window.innerWidth <= 768) {
              setMobileOpen(false);
            } else {
              setCollapsed(!collapsed);
            }
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      <nav className="sb-nav">
        <Link className={`nav-item ${isActive("/") ? "active" : ""}`} to="/" aria-label={collapsed ? "Feed" : undefined}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {!collapsed && <span className="nav-label">Feed</span>}
        </Link>

        <Link className={`nav-item ${isActive("/submit") ? "active" : ""}`} to="/submit" aria-label={collapsed ? "Submit Game" : undefined}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          {!collapsed && <span className="nav-label">Submit Game</span>}
        </Link>

        <Link className={`nav-item ${isActive("/profile") ? "active" : ""}`} to="/profile" aria-label={collapsed ? "Profile" : undefined}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          {!collapsed && <span className="nav-label">Profile</span>}
        </Link>
      </nav>

      <div className="sb-footer">
        <button type="button" className="signout-btn" aria-label={collapsed ? "Sign out" : undefined} onClick={handleSignOut}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {!collapsed && <span className="nav-label">Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
