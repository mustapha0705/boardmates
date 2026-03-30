import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../styles/layout.css";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on route change
  // useEffect(() => {
  //   setMobileOpen(false);
  // }, [location]);
  useEffect(() => {
  const id = setTimeout(() => setMobileOpen(false), 0);
  return () => clearTimeout(id);
}, [location]);

  return (
    <div className="layout">
      {/* Overlay backdrop */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="main">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <Outlet />
      </div>
    </div>
  );
}