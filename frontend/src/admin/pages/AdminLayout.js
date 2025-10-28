import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaStore,
  FaUserFriends,
  FaMoneyCheckAlt,
  FaImages,
  FaGamepad,
  FaBook,
  FaSignOutAlt,
  FaAngleDown,
  FaAngleUp,
} from "react-icons/fa";
import "./AdminLayout.css";
import AdminHeader from "../components/AdminHeader";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("admin_username");
    const storedRole = localStorage.getItem("admin_role");
    if (storedUsername) setUsername(storedUsername);
    if (storedRole) setRole(storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  // Optional: Dynamic page title based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/admin/dashboard")) return "Dashboard";
    if (path.includes("/admin/market")) return "My Market";
    if (path.includes("/admin/bets")) return "Bets";
    if (path.includes("/admin/members")) return "Members";
    if (path.includes("/admin/banner")) return "Banner Settings";
    if (path.includes("/admin/games")) return "Live Casino / Games";
    if (path.includes("/admin/game-rules")) return "Game Rules";
    if (path.includes("/admin/worli-manage")) return "Worli Manage";
    if (path.includes("/admin/worli-result")) return "Worli Result";
    if (path.includes("/admin/cricket-prediction")) return "Cricket Prediction";
    if (path.includes("/admin/cricket-prediction-result")) return "Cricket Prediction Result";
    if (path.includes("/admin/report")) return "Reports";
    return "";
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <FaTachometerAlt /> },
    { name: "My Market", path: "/admin/market", icon: <FaStore /> },
    { name: "Bets", path: "/admin/bets", icon: <FaMoneyCheckAlt /> },
    { name: "Members", path: "/admin/members", icon: <FaUserFriends /> },
    { name: "Banner Settings", path: "/admin/banner", icon: <FaImages /> },
    { name: "Live Casino / Games", path: "/admin/games", icon: <FaGamepad /> },
    { name: "Game Rules", path: "/admin/game-rules", icon: <FaBook /> },
    { name: "Worli Manage", path: "/admin/worli-manage", icon: <FaStore /> },
    { name: "Worli Result", path: "/admin/worli-result", icon: <FaStore /> },
    { name: "Cricket Prediction", path: "/admin/cricket-prediction", icon: <FaGamepad /> },
    { name: "Cricket Prediction Result", path: "/admin/cricket-prediction-result", icon: <FaGamepad /> },
    {
      name: "Report",
      icon: <FaBook />,
      submenu: [
        { name: "My Account", path: "/admin/report/my-account" },
        { name: "Client Statement", path: "/admin/report/client-statement" },
        { name: "Daily Profit Loss Report", path: "/admin/report/daily-profit-loss" },
        { name: "Event Wise Profit Loss Report", path: "/admin/report/event-wise-profit-loss" },
        { name: "Commission Report", path: "/admin/report/commission" },
        { name: "Profile Self", path: "/admin/report/profile-self" },
      ],
    },
    { name: "Logout", action: handleLogout, icon: <FaSignOutAlt /> },
  ];

  return (
    <div className="admin-container">
      {/* Sidebar */}
       <div className="sidebar">
      <div className="sidebar-header">
        <img
          src="/getid-logo-0p1Smfhr.webp"
          alt="Logo"
          className="main-logo"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/admin/dashboard")}
        />
      </div>

       <div className="user-section">
  <h3 className="username">{username || "Admin"}</h3>
  <p className="role">{role || "ADMIN"}</p>
</div>

        <div className="menu-scroll">
          <ul className="menu">
            {menuItems.map((item, index) => (
              <li key={index}>
                {item.submenu ? (
                  <>
                    <button
                      className="submenu-toggle"
                      onClick={() =>
                        setOpenMenu(openMenu === index ? null : index)
                      }
                    >
                      {item.icon}
                      <span className="menu-text">{item.name}</span>
                      {openMenu === index ? (
                        <FaAngleUp className="submenu-arrow" />
                      ) : (
                        <FaAngleDown className="submenu-arrow" />
                      )}
                    </button>

                    <ul
                      className={`submenu ${
                        openMenu === index ? "open" : ""
                      }`}
                    >
                      {item.submenu.map((sub, i) => (
                        <li key={i}>
                          <NavLink
                            to={sub.path}
                            className={({ isActive }) =>
                              isActive ? "active" : ""
                            }
                          >
                            <span className="submenu-text">{sub.name}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : item.action ? (
                  <button className="menu-button" onClick={item.action}>
                    {item.icon}
                    <span className="menu-text">{item.name}</span>
                  </button>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      isActive ? "active" : ""
                    }
                  >
                    {item.icon}
                    <span className="menu-text">{item.name}</span>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="main-content-wrapper">
        {/* Admin Header */}
        <AdminHeader title={getPageTitle()} />

        {/* Page Content */}
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
