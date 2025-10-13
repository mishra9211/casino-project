import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance"; // ✅ shared axios instance
import AddUserModal from "../components/AddUserModal";
import "./Members.css";

const Members = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // logged in user data from localStorage
  const loggedInUser = {
    username: localStorage.getItem("username"),
    domain: localStorage.getItem("domain"),
    role: localStorage.getItem("role"),
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
      alert(err.response?.data?.error || "Failed to fetch users ❌");
    }
  };

  const handleSaveUser = async (newUser) => {
    try {
      await axiosInstance.post("/users/register", newUser); // ✅ shared axiosInstance
      fetchUsers();
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save user:", err);
      alert(err.response?.data?.error || "Failed to save user ❌");
    }
  };

  return (
    <div className="members-container">
      <div className="header">
        <h2>USER LIST</h2>
        <button className="add-user" onClick={() => setShowModal(true)}>
          + Add User
        </button>
      </div>

      <table className="members-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Domain Name</th>
            <th>User Name</th>
            <th>Balance</th>
            <th>Exposure Limit</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u._id}>
              <td>{i + 1}</td>
              <td>{u.domain || loggedInUser.domain}</td>
              <td>{u.username}</td>
              <td>{u.balance?.toFixed(2)}</td>
              <td>{u.exposureLimit ?? "-"}</td>
              <td>
                <span className={`type-badge ${u.role}`}>{u.role}</span>
              </td>
              <td>
                <button className="action-btn">⋮</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <AddUserModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveUser}
          currentUser={loggedInUser.username}
          currentDomain={loggedInUser.domain}
          currentUserRole={loggedInUser.role}
        />
      )}
    </div>
  );
};

export default Members;
