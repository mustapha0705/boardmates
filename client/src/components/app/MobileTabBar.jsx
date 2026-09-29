import { createElement } from "react";
import { Link, useLocation } from "react-router-dom";
import { PlusIcon } from "./NavIcons.jsx";
import { NAV_ITEMS, isActivePath } from "./navItems.js";

/** Mobile bottom navigation with Submit as the centre action, per the export. */
export default function MobileTabBar() {
  const location = useLocation();

  const items = NAV_ITEMS.map((item) =>
    item.to === "/submit" ? { ...item, Icon: PlusIcon, primary: true, label: "Submit" } : item,
  );

  return (
    <nav className="bm-app__tabbar" aria-label="Main">
      {items.map(({ to, label, Icon, primary }) => {
        const active = isActivePath(location.pathname, to);
        return (
          <Link
            key={to}
            to={to}
            className={`bm-tab ${primary ? "bm-tab--primary" : ""} ${active ? "is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="bm-tab__icon">
              {createElement(Icon)}
            </span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
