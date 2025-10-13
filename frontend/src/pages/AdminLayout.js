import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  FaTachometerAlt,
  FaStore,
  FaUserFriends,
  FaMoneyCheckAlt,
  FaImages,
  FaGamepad,
  FaBook,
  FaBars
} from "react-icons/fa";
import "./AdminDashboard.css";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <FaTachometerAlt /> },
    { name: "My Market", path: "/admin/market", icon: <FaStore /> },
    { name: "Bets", path: "/admin/bets", icon: <FaMoneyCheckAlt /> },
    { name: "Members", path: "/admin/members", icon: <FaUserFriends /> },
    { name: "Banner Settings", path: "/admin/banner", icon: <FaImages /> },
    { name: "Live Casino / Games", path: "/admin/games", icon: <FaGamepad /> },
    { name: "Game Rules", path: "/admin/game-rules", icon: <FaBook /> },
    { name: "Worli Manage", path: "/admin/worli-manage", icon: <FaStore /> },
  ];

  return (
    <div className={`admin-container ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar">
        <div className="sidebar-header">
       <h2 className="logo">
  {collapsed ? (
    <img src="/Logo888.png" alt="Logo" style={{ width: 30, height: 30 }} />
  ) : (
    <img src="/Logo888.png" alt="Logo" style={{ width: 90, height: 40 }} />
  )}
</h2>
          <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
            <FaBars />
          </button>
        </div>
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                className={({ isActive }) => (isActive ? "active" : "")}
                title={item.name} // tooltip when collapsed
              >
                {item.icon}
                {!collapsed && <span className="menu-text">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
