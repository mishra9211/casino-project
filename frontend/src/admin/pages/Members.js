import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import AddUserModal from "../components/AddUserModal";
import "./Members.css";
import {
  FaKey,
  FaChartLine,
  FaCog,
  FaUserSlash,
  FaLock,
  FaUnlock,
} from "react-icons/fa";

const Members = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Admin");
  const [successMessage, setSuccessMessage] = useState("");

  const adminData = {
    balance: parseFloat(localStorage.getItem("admin_balance")) || 0,
    credit_reference:
      parseFloat(localStorage.getItem("admin_credit_reference")) || 0,
    exposure: parseFloat(localStorage.getItem("admin_exposure")) || 0,
    p_l: parseFloat(localStorage.getItem("admin_p_l")) || 0,
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (activeTab === "Client Statements") return true;
    return u.role.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="members-page">
      {/* ===== Success Toast ===== */}
      {successMessage && (
        <div className="success-toast">
          {successMessage}
        </div>
      )}

      {/* ===== Tabs ===== */}
      <div className="tabs">
        {["Admin", "Master", "User"].map((tab) => (
          <button
            key={tab}
            className={`tab-item ${tab === activeTab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ===== Top Controls ===== */}
      <div className="top-controls">
        <div className="search-bar">
          <select>
            <option>UserId</option>
          </select>
          <input type="text" placeholder="Enter 3 digits" />
          <button className="go-btn">Go</button>
        </div>

        <div className="totals">
          <div className="total-box">
            <span>Credit Reference</span>
            <p>{adminData.credit_reference.toLocaleString()}</p>
          </div>
          <div className="total-box">
            <span>Balance</span>
            <p>{adminData.balance.toLocaleString()}</p>
          </div>
          <div className="total-box">
            <span>Total Exposure</span>
            <p>{adminData.exposure.toLocaleString()}</p>
          </div>
          <div className="total-box">
            <span>Total Profit</span>
            <p>{adminData.p_l.toLocaleString()}</p>
          </div>
        </div>

        <button className="add-client-btn" onClick={() => setShowModal(true)}>
          ADD CLIENT
        </button>
      </div>

      {/* ===== User Table ===== */}
      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Username</th>
              <th>Credit Ref</th>
              <th>Balance</th>
              <th>Player Balance</th>
              <th>Exposure</th>
              <th>P & L</th>
              <th>Sharing %</th>
              <th>Lock</th>
              <th>D - W</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u, i) => (
                <tr key={u._id}>
                  <td>{i + 1}</td>
                  <td className="username">{u.username}</td>
                  <td>{u.credit_reference?.toLocaleString() ?? "0"}</td>
                  <td className="green">{u.balance?.toLocaleString() ?? "0"}</td>
                  <td>{u.player_balance?.toLocaleString() ?? "0"}</td>
                  <td>{u.exposure ?? "0"}</td>
                  <td className={u.p_l >= 0 ? "green" : "red"}>
                    {u.p_l?.toLocaleString() ?? "0"}
                  </td>
                  <td>{u.parent_share ?? 0}%</td>
                  <td className="lock-cell">
                    {u.isLocked ? (
                      <FaLock className="lock-icon red" title="Locked" />
                    ) : (
                      <FaUnlock className="lock-icon green" title="Unlocked" />
                    )}
                  </td>
                  <td className="dw-cell">
                    <button className="dw-btn deposit">D</button>
                    <button className="dw-btn withdraw">W</button>
                  </td>
                  <td className="actions">
                    <FaKey className="action-icon password" title="Password" />
                    <FaChartLine className="action-icon pnl" title="P&L" />
                    <FaCog className="action-icon settings" title="Settings" />
                    <FaUserSlash className="action-icon dead" title="Dead User" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" style={{ textAlign: "center", color: "#777" }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Add User Modal ===== */}
      {showModal && (
        <AddUserModal
          onClose={() => setShowModal(false)}
          onUserCreated={(user, message) => {
            fetchUsers(); // Refresh users
            if (message) {
              setSuccessMessage(message); // Show success message
              setTimeout(() => setSuccessMessage(""), 4000); // Hide after 4s
            }
          }}
        />
      )}
    </div>
  );
};

export default Members;
