import { Link } from "react-router-dom";

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`} id="sidebar">
      <div className="sb-header">
        <div className="logo-wrap">
          <div className="logo-icon">
            <svg viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1" fill="#f0ede4" />
              <rect
                x="9"
                y="2"
                width="5"
                height="5"
                rx="1"
                fill="#f0ede4"
                opacity=".5"
              />
              <rect
                x="2"
                y="9"
                width="5"
                height="5"
                rx="1"
                fill="#f0ede4"
                opacity=".5"
              />
              <rect x="9" y="9" width="5" height="5" rx="1" fill="#f0ede4" />
            </svg>
          </div>

          {!collapsed && (
            <div className="logo-text" id="logo-text">
              <h2>Boardmates</h2>
              <span>Chess MVP</span>
            </div>
          )}
        </div>

        <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      <nav className="sb-nav">
        <Link className="nav-item" to="/">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {!collapsed && <span className="nav-label">Feed</span>}
        </Link>

        <Link className="nav-item" to="/submit">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {!collapsed && <span className="nav-label">Submit Game</span>}
        </Link>

        <Link className="nav-item" to="/profile">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          {!collapsed && <span className="nav-label">Profile</span>}
        </Link>
      </nav>

      <div className="sb-footer">
        <button className="signout-btn">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>

          {!collapsed && <span className="nav-label">Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
