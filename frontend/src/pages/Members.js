import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import AddUserModal from "../components/AddUserModal";
import "./Members.css";
import {
  FaLock,
  FaUnlock,
  FaEdit,
  FaChartLine,
  FaCog,
  FaInfoCircle,
  FaPhoneAlt,
  FaWhatsapp,
} from "react-icons/fa";

const Members = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Admin"); // default tab

const adminData = {
  balance: parseFloat(localStorage.getItem("admin_balance")) || 0,
  credit_reference: parseFloat(localStorage.getItem("admin_credit_reference")) || 0,
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

  // Filter users based on selected tab
  const filteredUsers = users.filter((u) => {
    if (activeTab === "Client Statements") return true; // show all for statements
    return u.role.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="members-page">
      {/* ==== Top Tabs ==== */}
      <div className="tabs">
        {["Admin", "Master", "User", "Client Statements"].map((tab) => (
          <button
            key={tab}
            className={`tab-item ${tab === activeTab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ==== Top Controls ==== */}
      <div className="top-controls">
        <div className="search-bar">
          <select>
            <option>UserId</option>
          </select>
          <input type="text" placeholder="Enter 3 digits" />
          <button className="go-btn">Go</button>
        </div>

       
<div className="totals">
  <div className="total-box credit">
    <span>Credit Reference</span>
    <p>{adminData.credit_reference.toLocaleString()}</p>
  </div>
  <div className="total-box balance">
    <span>Balance</span>
    <p>{adminData.balance.toLocaleString()}</p>
  </div>
  <div className="total-box exposure">
    <span>Total Exposure</span>
    <p>{adminData.exposure.toLocaleString()}</p>
  </div>
  <div className="total-box profit">
    <span>Total Profit</span>
    <p>{adminData.p_l.toLocaleString()}</p>
  </div>
</div>

        <button className="add-client-btn" onClick={() => setShowModal(true)}>
          ADD CLIENT
        </button>
      </div>

      {/* ==== Members Table ==== */}
      <table className="members-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>User Id</th>
            <th>Credit Reference</th>
            <th>Balance</th>
            <th>Player Balance</th>
            <th>Exposure</th>
            <th>P & L</th>
            <th>Locks</th>
            <th>Sharing %</th>
            <th>D-W-C</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u, i) => (
            <tr key={u._id}>
              <td>{i + 1}</td>
              <td className="userid">
                <span className="user-link">{u.username}</span>
                <span className="role-badge">{u.role.charAt(0).toUpperCase()}</span>
              </td>
              <td>{u.credit_reference?.toLocaleString() ?? "0.00"}</td>
              <td className="green">{u.balance?.toLocaleString() ?? "0.00"}</td>
              <td>{u.player_balance?.toLocaleString() ?? "0.00"}</td>
              <td>{u.exposure ?? "0.00"}</td>
              <td className={u.p_l >= 0 ? "green" : "red"}>
                {u.p_l?.toLocaleString() ?? "0.00"}
              </td>
              <td>
                {u.isLocked ? (
                  <FaLock className="icon lock red" />
                ) : (
                  <FaUnlock className="icon unlock" />
                )}
              </td>
              <td>{u.parent_share ?? "0"}%</td> {/* Updated to show parent_share */}
              <td className="dwc">D W</td>
              <td className="action-icons">
                <FaEdit title="Edit" className="icon edit" />
                <FaChartLine title="P&L" className="icon pl" />
                <FaCog title="Settings" className="icon settings" />
                <FaInfoCircle title="Info" className="icon info" />
                <FaPhoneAlt title="Call" className="icon call" />
                <FaWhatsapp title="WhatsApp" className="icon whatsapp" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && <AddUserModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Members;
