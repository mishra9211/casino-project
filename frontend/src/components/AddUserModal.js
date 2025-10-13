import React, { useState } from "react";
import axios from "axios";
import "./AddUserModal.css";

const AddUserModal = ({ onClose, currentUser, currentUserId, currentDomain, currentUserRole, onUserCreated }) => {
  const [form, setForm] = useState({
    parentName: currentUser || "", // logged-in user name
    clientName: "",
    username: "",
    password: "",
    domain: currentDomain || "",   // logged-in domain
    role: "user",                  // default
    exposureLimit: "-1",
    masterPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const res = await axios.post(
      "http://localhost:5001/register",
      {
        username: form.username,
        password: form.password,
        role: form.role,
        domain: form.domain,
        exposureLimit: form.exposureLimit,
        uplineId: currentUserId, // 👈 master/admin ka id
        masterPassword: form.masterPassword, // 👈 yeh bhi bhejna hai
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (onUserCreated) onUserCreated(res.data.user);
    onClose();
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.error || "Failed to create user");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>ADD USER DETAILS</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <h4 className="section-title">Personal Details</h4>
          <div className="form-fields">
            <input
              type="text"
              name="parentName"
              value={form.parentName}
              disabled
              className="readonly-field"
            />

            <input
              type="text"
              name="clientName"
              placeholder="Client Name (optional)"
              value={form.clientName}
              onChange={handleChange}
            />

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="domain"
              value={form.domain}
              disabled
              className="readonly-field"
            />

            <select name="role" value={form.role} onChange={handleChange}>
              {currentUserRole === "admin" && (
                <option value="master">Master</option>
              )}
              <option value="user">User</option>
            </select>

            <input
              type="text"
              name="exposureLimit"
              placeholder="Exposure Limit"
              value={form.exposureLimit}
              onChange={handleChange}
            />

            <input
              type="password"
              name="masterPassword"
              placeholder="Master Password"
              value={form.masterPassword}
              onChange={handleChange}
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="form-actions">
            <button type="submit" className="add-btn" disabled={loading}>
              {loading ? "Creating..." : "Add User"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
