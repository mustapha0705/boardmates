import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "./app/AppSidebar.jsx";
import AppHeader from "./app/AppHeader.jsx";
import MobileTabBar from "./app/MobileTabBar.jsx";
import { titleForPath } from "./app/navItems.js";
// layout.css still provides the legacy colour variables and styles used by the
// signed-in pages that have not been redesigned yet (submit, profile, board pages).
import "../styles/layout.css";
import "../styles/app-shell.css";

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="bm-app">
      <a className="bm-skip-link" href="#app-content">
        Skip to main content
      </a>

      <AppSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((value) => !value)} />

      <div className="bm-app__main">
        <AppHeader title={titleForPath(location.pathname)} showSubmitCta={!location.pathname.startsWith("/submit")} />

        <main id="app-content" className="bm-app__content">
          {children ?? <Outlet />}
        </main>

        <MobileTabBar />
      </div>
    </div>
  );
}
