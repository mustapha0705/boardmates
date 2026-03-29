import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../styles/layout.css"

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="layout">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="main">
        {/* <Topbar /> */}
        <Outlet />
      </div>
    </div>
  );
}