import React from "react";
import { FaBell, FaUserCircle, FaSearch, FaBars } from "react-icons/fa";
import "./AdminHeader.css";

const AdminHeader = ({ onToggleSidebar }) => {
  return (
    <header className="admin-header">
      {/* Sidebar Toggle */}
      <button className="icon-btn" onClick={onToggleSidebar}>
        <FaBars size={28} />
      </button>

      {/* Search Bar */}
      <div className="admin-header-search">
        <input
          type="text"
          placeholder="Search e.g. Dashboard..."
          className="admin-search-input"
        />
        <FaSearch className="admin-search-icon" />
      </div>

      {/* Right Side Icons */}
      <div className="admin-header-icons">
        <button className="icon-btn">
          <FaBell size={32} />
        </button>
        <button className="icon-btn">
          <FaUserCircle size={32} />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
