import { createElement } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import BrandLogo from "../ui/BrandLogo.jsx";
import { SidebarToggleIcon, SignOutIcon } from "./NavIcons.jsx";
import { NAV_ITEMS, isActivePath } from "./navItems.js";

function initialOf(name) {
  return String(name ?? "").trim().charAt(0).toUpperCase() || "?";
}

export default function AppSidebar({ collapsed, onToggleCollapse }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  const displayName = user?.displayName ?? "Your account";
  const rating = Number.isFinite(user?.rapidRating) && user.rapidRating > 0 ? `${user.rapidRating} rapid` : null;

  return (
    <aside className={`bm-app__sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <div className="bm-sidebar__head">
        {collapsed ? null : (
          <Link to="/" className="bm-brand" aria-label="Boardmates home">
            <BrandLogo size={32} showWordmark tagline="Human review" />
          </Link>
        )}
        <button
          type="button"
          className="bm-sidebar__toggle"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <SidebarToggleIcon />
        </button>
      </div>

      <nav className="bm-sidebar__nav" aria-label="Main">
        {NAV_ITEMS.map(({ to, label, Icon }) => {
          const active = isActivePath(location.pathname, to);
          return (
            <Link
              key={to}
              to={to}
              className={`bm-nav-item ${active ? "is-active" : ""}`}
              aria-current={active ? "page" : undefined}
              title={collapsed ? label : undefined}
            >
              <span className="bm-nav-item__icon">
                {createElement(Icon)}
              </span>
              {collapsed ? <span className="bm-visually-hidden">{label}</span> : <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="bm-sidebar__spacer" />

      <div className="bm-sidebar__user">
        {collapsed ? null : (
          <>
            <span className="bm-avatar bm-avatar--md" aria-hidden="true">
              {initialOf(displayName)}
            </span>
            <span className="bm-sidebar__identity">
              <span className="bm-sidebar__name">{displayName}</span>
              {rating ? <span className="bm-sidebar__rating">{rating}</span> : null}
            </span>
          </>
        )}
        <button type="button" className="bm-sidebar__signout" onClick={handleSignOut} aria-label="Sign out" title="Sign out">
          <SignOutIcon />
        </button>
      </div>
    </aside>
  );
}
