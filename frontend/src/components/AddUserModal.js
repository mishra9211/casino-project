import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import "./AddUserModal.css";

const AddUserModal = ({ onClose, currentUserId, onUserCreated }) => {
  const loggedInAdmin = {
    username: localStorage.getItem("admin_username"),
    domain: localStorage.getItem("admin_domain"),
    role: localStorage.getItem("admin_role"),
    masterPassword: localStorage.getItem("admin_masterPassword") || "",
  };

  const [form, setForm] = useState({
    parentName: loggedInAdmin.username || "",
    clientName: "",
    username: "",
    password: "",
    confirmPassword: "",
    creditReference: "",
    balance: "",
    maxBalance: "",
    myShare: "",
    clientShare: "",
    exposureLimit: "",
    domain: loggedInAdmin.domain || "",
    role: "user",
    masterPassword: loggedInAdmin.masterPassword,
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

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        username: form.username,
        password: form.password,
        role: form.role,
        domain: form.domain,
        uplineId: currentUserId,
        masterPassword: form.masterPassword,
      };

      if (form.role === "user") {
        payload.exposureLimit = form.exposureLimit || "-1";
      } else {
        payload.creditReference = form.creditReference;
        payload.balance = form.balance;
        payload.maxBalance = form.maxBalance;
        payload.myShare = form.myShare;
        payload.clientShare = form.clientShare;
      }

      const res = await axiosInstance.post("/users/register", payload);

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
        <h3>Add Client</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Client Base</label>
          <select name="role" value={form.role} onChange={handleChange}>
            {loggedInAdmin.role === "owner" && (
              <>
                <option value="admin">Admin</option>
                <option value="master">Master</option>
                <option value="user">User</option>
              </>
            )}
            {loggedInAdmin.role === "admin" && (
              <>
                <option value="master">Master</option>
                <option value="user">User</option>
              </>
            )}
            {loggedInAdmin.role === "master" && <option value="user">User</option>}
          </select>

          <input
            type="text"
            name="username"
            placeholder="User ID"
            value={form.username}
            onChange={handleChange}
            required
          />
          <p className="hint">
            • Length of username: 6–25<br />• Only letters, numbers, and underscores allowed
          </p>

          <input
            type="text"
            name="clientName"
            placeholder="Name"
            value={form.clientName}
            onChange={handleChange}
          />

          <div className="input-row">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Conditional fields */}
          {form.role === "user" ? (
            <>
              <input
                type="text"
                name="creditReference"
                placeholder="Credit Reference"
                value={form.creditReference}
                onChange={handleChange}
              />
              <div className="input-row">
                <input
                  type="text"
                  name="balance"
                  placeholder="Balance"
                  value={form.balance}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="exposureLimit"
                  placeholder="Exposure Limit (Blank = Unlimited)"
                  value={form.exposureLimit}
                  onChange={handleChange}
                />
              </div>
            </>
          ) : (
            <>
              <input
                type="text"
                name="creditReference"
                placeholder="Credit Reference"
                value={form.creditReference}
                onChange={handleChange}
              />
              <div className="input-row">
                <input
                  type="text"
                  name="balance"
                  placeholder="Balance"
                  value={form.balance}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="maxBalance"
                  placeholder="Max Balance"
                  value={form.maxBalance}
                  onChange={handleChange}
                />
              </div>
              <p className="note">
                <b>Note:</b> Divide your share from 90.
              </p>
              <div className="input-row">
                <input
                  type="text"
                  name="myShare"
                  placeholder="My %"
                  value={form.myShare}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="clientShare"
                  placeholder="Client %"
                  value={form.clientShare}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <input
            type="password"
            name="masterPassword"
            placeholder="Enter Master Password"
            value={form.masterPassword}
            onChange={handleChange}
          />

          {error && <p className="error-text">{error}</p>}

          <div className="form-actions">
            <button type="submit" className="add-btn" disabled={loading}>
              {loading ? "Creating..." : "SUBMIT"}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
