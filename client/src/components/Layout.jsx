import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Feed from "../pages/Feed";
import "../styles/layout.css"

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="layout">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="main">
        <Topbar />
        <Feed />
      </div>
    </div>
  );
}