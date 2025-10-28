import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import AddUserModal from "../components/AddUserModal";
import Pagination from "./Pagination";
import "./Members.css";
import LockSettingsModal from "./LockSettingsModal.jsx";
import UpdatePasswordModal from "./UpdatePasswordModal.jsx";
import DepositModal from "./DepositModal";
import WithdrawModal from "./WithdrawModal";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaKey,
  FaChartLine,
  FaCog,
  FaUserSlash,
  FaLock,
  FaUnlock,
} from "react-icons/fa";

const MembersInner = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("User");
  const [successMessage, setSuccessMessage] = useState("");

  // Lock modal
  const [showLockModal, setShowLockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Search
  const [searchUserId, setSearchUserId] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(false);

  // Downline
  const [expandedUsers, setExpandedUsers] = useState([]);
  const [downlines, setDownlines] = useState({});

  // 💰 Deposit/Withdraw states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [dwUser, setDwUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get(`/users/downline/${userId}`);
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch downline users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userId]);

  const toggleDownline = (id) => {
    if (expandedUsers.includes(id)) {
      setExpandedUsers(expandedUsers.filter((x) => x !== id));
    } else {
      setExpandedUsers([...expandedUsers, id]);
      if (!downlines[id]) fetchDownline(id);
    }
  };

  const fetchDownline = async (parentId) => {
    try {
      const res = await axiosInstance.get(`/users/downline/${parentId}`);
      setDownlines((prev) => ({ ...prev, [parentId]: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

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

  const totalEntries = filteredUsers.length;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  const handleSaveLockSettings = async (updatedLocks) => {
    try {
      if (!selectedUser) return;
      await axiosInstance.put(`/users/${selectedUser._id}/lock`, updatedLocks);
      setSuccessMessage("Lock settings updated successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

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
      console.error(err);
    }
  };

  return (
    <div className="members-page">
      {successMessage && <div className="success-toast">{successMessage}</div>}

      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Tabs */}
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

      {/* Top controls */}
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
              setSearchUserId(e.target.value);
              if (e.target.value.trim() === "") setSearchTrigger(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") setSearchTrigger(true);
            }}
          />
          <button className="go-btn" onClick={() => setSearchTrigger(true)}>
            Go
          </button>
        </div>
      </div>

      {/* User Table */}
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
                <React.Fragment key={u._id}>
                  <tr>
                    <td>{startIndex + i + 1}</td>
                    <td className="username">
                      {u.role.toLowerCase() !== "user" ? (
                        <span
                          className="username-link"
                          onClick={() => navigate(`/admin/members/${u._id}`)}
                        >
                          {u.username}
                        </span>
                      ) : (
                        u.username
                      )}
                    </td>
                    <td>{u.credit_reference?.toLocaleString() ?? "0"}</td>
                    <td className="green">
                      {u.balance?.toLocaleString() ?? "0"}
                    </td>
                    <td>{u.player_balance?.toLocaleString() ?? "0"}</td>
                    <td>{u.exposure ?? "0"}</td>
                    <td className={u.p_l >= 0 ? "green" : "red"}>
                      {u.p_l?.toLocaleString() ?? "0"}
                    </td>
                    <td>{u.parent_share ?? 0}%</td>
                    <td className="lock-cell">
                      {u.isLocked ? (
                        <FaLock
                          className="lock-icon red"
                          onClick={() => {
                            setSelectedUser(u);
                            setShowLockModal(true);
                          }}
                        />
                      ) : (
                        <FaUnlock
                          className="lock-icon green"
                          onClick={() => {
                            setSelectedUser(u);
                            setShowLockModal(true);
                          }}
                        />
                      )}
                    </td>
                    <td className="dw-cell">
                      <button
                        className="dw-btn deposit"
                        onClick={() => {
                          setDwUser(u);
                          setShowDepositModal(true);
                        }}
                      >
                        D
                      </button>
                      <button
                        className="dw-btn withdraw"
                        onClick={() => {
                          setDwUser(u);
                          setShowWithdrawModal(true);
                        }}
                      >
                        W
                      </button>
                    </td>
                    <td className="actions">
                      <FaKey
                        className="action-icon password"
                        onClick={() => {
                          setPasswordUser(u);
                          setShowPasswordModal(true);
                        }}
                      />
                      <FaChartLine className="action-icon pnl" />
                      <FaCog className="action-icon settings" />
                      <FaUserSlash className="action-icon dead" />
                      {u.role.toLowerCase() === "user" && (
                        <button className="action-icon exposure">E</button>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
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

      {/* Pagination */}
      {totalEntries > 10 && (
        <Pagination
          totalEntries={totalEntries}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          entriesPerPage={entriesPerPage}
          setEntriesPerPage={setEntriesPerPage}
        />
      )}

      {/* Add User Modal */}
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

      {/* Lock Modal */}
      {showLockModal && selectedUser && (
        <LockSettingsModal
          user={selectedUser}
          onClose={() => setShowLockModal(false)}
          onSave={handleSaveLockSettings}
        />
      )}

      {/* Password Modal */}
      {showPasswordModal && passwordUser && (
        <UpdatePasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSubmit={(newPassword) => handlePasswordUpdate(newPassword)}
        />
      )}

      {/* 💰 Deposit Modal */}
      {showDepositModal && dwUser && (
        <DepositModal
          user={dwUser}
          onClose={() => setShowDepositModal(false)}
          onSubmit={(data) => {
            console.log("Deposit data:", data);
            setShowDepositModal(false);
          }}
        />
      )}

      {/* 💸 Withdraw Modal */}
      {showWithdrawModal && dwUser && (
        <WithdrawModal
          user={dwUser}
          onClose={() => setShowWithdrawModal(false)}
          onSubmit={(data) => {
            console.log("Withdraw data:", data);
            setShowWithdrawModal(false);
          }}
        />
      )}
    </div>
  );
};

export default MembersInner;
