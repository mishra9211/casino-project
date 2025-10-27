import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import AddUserModal from "../components/AddUserModal";
import Pagination from "./Pagination";
import "./Members.css";
import "./LockSettingsModal.jsx"; // ✅ Added for Lock Modal
import LockSettingsModal from "./LockSettingsModal.jsx"; // ✅ Proper import
import UpdatePasswordModal from "./UpdatePasswordModal.jsx"; // ✅ New Password Modal Import

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

  // ✅ Lock Settings Modal States
  const [showLockModal, setShowLockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // ✅ Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);

  // ✅ Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // ✅ Search state
  const [searchUserId, setSearchUserId] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(false);

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

  // ✅ Filter users by role/tab + search
  const filteredUsers = users.filter((u) => {
    const roleMatch =
      activeTab === "Client Statements" ||
      u.role.toLowerCase() === activeTab.toLowerCase();

    const searchMatch =
      searchUserId && searchTrigger
        ? u.username.toLowerCase().includes(searchUserId.toLowerCase())
        : true;

    return roleMatch && searchMatch;
  });

  // ✅ Pagination logic
  const totalEntries = filteredUsers.length;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // ✅ Save Lock Settings
  const handleSaveLockSettings = async (updatedLocks) => {
    try {
      if (!selectedUser) return;
      await axiosInstance.put(`/users/${selectedUser._id}/lock`, updatedLocks);
      setSuccessMessage("Lock settings updated successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
      fetchUsers();
    } catch (err) {
      console.error("Error updating lock settings:", err);
    }
  };

  // ✅ Update Password
  const handlePasswordUpdate = async (newPassword) => {
    try {
      if (!passwordUser) return;
      await axiosInstance.put(`/users/${passwordUser._id}/password`, {
        password: newPassword,
      });
      setSuccessMessage("Password updated successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
      fetchUsers();
    } catch (err) {
      console.error("Error updating password:", err);
    }
  };

  return (
    <div className="members-page">
      {/* ===== Success Toast ===== */}
      {successMessage && <div className="success-toast">{successMessage}</div>}

      {/* ===== Tabs ===== */}
      <div className="tabs">
        {["Admin", "Master", "User", "Dead Members"].map((tab) => (
          <button
            key={tab}
            className={`tab-item ${tab === activeTab ? "active" : ""}`}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
              setSearchTrigger(false);
            }}
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
          <input
            type="text"
            placeholder="Enter 3 digits"
            value={searchUserId}
            onChange={(e) => {
              const val = e.target.value;
              setSearchUserId(val);
              if (val.trim() === "") {
                setSearchTrigger(false);
                setCurrentPage(1);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearchTrigger(true);
                setCurrentPage(1);
              }
            }}
          />
          <button
            className="go-btn"
            onClick={() => {
              setSearchTrigger(true);
              setCurrentPage(1);
            }}
          >
            Go
          </button>
        </div>

        <div className="totals">
          <div className="total-box">
            <span>Credit Reference</span>
            <p>{adminData.credit_reference.toLocaleString()}</p>
          </div>
          <div className="total-box">
            <span>Available Balance</span>
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
            {currentUsers.length > 0 ? (
              currentUsers.map((u, i) => (
                <tr key={u._id}>
                  <td>{startIndex + i + 1}</td>
                  <td className="username">{u.username}</td>
                  <td>{u.credit_reference?.toLocaleString() ?? "0"}</td>
                  <td className="green">{u.balance?.toLocaleString() ?? "0"}</td>
                  <td>{u.player_balance?.toLocaleString() ?? "0"}</td>
                  <td>{u.exposure ?? "0"}</td>
                  <td className={u.p_l >= 0 ? "green" : "red"}>
                    {u.p_l?.toLocaleString() ?? "0"}
                  </td>
                  <td>{u.parent_share ?? 0}%</td>

                  {/* ✅ Lock */}
                  <td className="lock-cell">
                    {u.isLocked ? (
                      <FaLock
                        className="lock-icon red"
                        title="Locked"
                        onClick={() => {
                          setSelectedUser(u);
                          setShowLockModal(true);
                        }}
                      />
                    ) : (
                      <FaUnlock
                        className="lock-icon green"
                        title="Unlocked"
                        onClick={() => {
                          setSelectedUser(u);
                          setShowLockModal(true);
                        }}
                      />
                    )}
                  </td>

                  <td className="dw-cell">
                    <button className="dw-btn deposit">D</button>
                    <button className="dw-btn withdraw">W</button>
                  </td>

                  {/* ✅ Actions */}
                  <td className="actions">
                    <FaKey
                      className="action-icon password"
                      title="Password"
                      onClick={() => {
                        setPasswordUser(u);
                        setShowPasswordModal(true);
                      }}
                    />
                    <FaChartLine className="action-icon pnl" title="P&L" />
                    <FaCog className="action-icon settings" title="Settings" />
                    <FaUserSlash
                      className="action-icon dead"
                      title="Dead User"
                    />
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

      {/* ===== Pagination ===== */}
      {totalEntries > 10 && (
        <Pagination
          totalEntries={totalEntries}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          entriesPerPage={entriesPerPage}
          setEntriesPerPage={setEntriesPerPage}
        />
      )}

      {/* ===== Add User Modal ===== */}
      {showModal && (
        <AddUserModal
          onClose={() => setShowModal(false)}
          onUserCreated={(user, message) => {
            fetchUsers();
            if (message) {
              setSuccessMessage(message);
              setTimeout(() => setSuccessMessage(""), 4000);
            }
          }}
        />
      )}

      {/* ===== Lock Settings Modal ===== */}
      {showLockModal && selectedUser && (
        <LockSettingsModal
          user={selectedUser}
          onClose={() => setShowLockModal(false)}
          onSave={handleSaveLockSettings}
        />
      )}

      {/* ===== Update Password Modal ===== */}
      {showPasswordModal && passwordUser && (
        <UpdatePasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSubmit={(newPassword) => handlePasswordUpdate(newPassword)}
        />
      )}
    </div>
  );
};

export default Members;
