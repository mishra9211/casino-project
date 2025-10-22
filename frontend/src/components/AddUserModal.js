import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import "./AddUserModal.css";

const AddUserModal = ({ onClose, currentUserId, onUserCreated }) => {
  const loggedInAdmin = {
    username: localStorage.getItem("admin_username"),
    domain: localStorage.getItem("admin_domain"),
    role: localStorage.getItem("admin_role"),
    masterPassword: localStorage.getItem("admin_masterPassword") || "",
    myShare: Number(localStorage.getItem("admin_my_share")) || 0, // ✅ number type
  };

  const [form, setForm] = useState({
    parentName: loggedInAdmin.username || "",
    clientName: "",
    username: "",
    password: "",
    confirmPassword: "",
    credit_reference: "",
    balance: "",
    maxBalance: "",
    my_share: 0,
    client_share: loggedInAdmin.myShare,
    exposureLimit: "",
    domain: loggedInAdmin.domain || "",
    role: "user",
    masterPassword: loggedInAdmin.masterPassword,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔁 Auto adjust shares dynamically
  useEffect(() => {
    if (form.role !== "user") {
      const total = loggedInAdmin.myShare;
      const myShare = Number(form.my_share) || 0;
      let clientShare = total - myShare;
      if (clientShare < 0) clientShare = 0;
      setForm((prev) => ({ ...prev, client_share: clientShare }));
    }
    // eslint-disable-next-line
  }, [form.my_share]);

  useEffect(() => {
    if (form.role !== "user") {
      const total = loggedInAdmin.myShare;
      const clientShare = Number(form.client_share) || 0;
      let myShare = total - clientShare;
      if (myShare < 0) myShare = 0;
      setForm((prev) => ({ ...prev, my_share: myShare }));
    }
    // eslint-disable-next-line
  }, [form.client_share]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ Prevent invalid number input for shares
    if (["my_share", "client_share"].includes(name)) {
      const num = Number(value);
      if (isNaN(num) || num < 0) return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  // ✅ Password match check (only here)
  if (form.password.trim() === "" || form.confirmPassword.trim() === "") {
    setError("Password fields cannot be empty");
    setLoading(false);
    return;
  }

  if (form.password !== form.confirmPassword) {
    setError("Passwords do not match");
    setLoading(false);
    return;
  }

  // ✅ Prevent over-allocation of share
  const totalShare = loggedInAdmin.myShare;
  const myShare = Number(form.my_share);
  const clientShare = Number(form.client_share);

  if (myShare + clientShare > totalShare) {
    setError(`Total share cannot exceed your share (${totalShare}%)`);
    setLoading(false);
    return;
  }

  try {
    // ✅ Final payload – only `password` sent
    const payload = {
      username: form.username,
      password: form.password, // 👈 only this
      role: form.role,
      domain: form.domain,
      uplineId: currentUserId,
      masterPassword: form.masterPassword,
    };

    if (form.role === "user") {
      payload.exposureLimit = form.exposureLimit || "-1";
      payload.creditReference = form.creditReference;
      payload.balance = form.balance;
    } else {
      payload.creditReference = form.creditReference;
      payload.balance = form.balance;
      payload.maxBalance = form.maxBalance;
      payload.myShare = form.my_share;
      payload.clientShare = form.client_share;
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

              {/* ✅ Updated note */}
              <p className="note">
                <b>Note:</b> Divide your share from{" "}
                <span style={{ color: "#4caf50" }}>
                  {loggedInAdmin.myShare}%
                </span>
              </p>

              <div className="input-row">
                <input
                  type="number"
                  name="my_share"
                  placeholder="My %"
                  value={form.my_share}
                  onChange={handleChange}
                />
                <input
                  type="number"
                  name="client_share"
                  placeholder="Client %"
                  value={form.client_share}
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
