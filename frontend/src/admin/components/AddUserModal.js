import React, { useState, useEffect } from "react";
import axiosInstance from '../../api/axiosInstance';
import "./AddUserModal.css";

const AddUserModal = ({ onClose, currentUserId, onUserCreated }) => {
  const loggedInAdmin = {
    username: localStorage.getItem("admin_username"),
    domain: localStorage.getItem("admin_domain"),
    role: localStorage.getItem("admin_role"),
    masterPassword: localStorage.getItem("admin_masterPassword") || "",
    myShare: Number(localStorage.getItem("admin_my_share")) || 0,
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
    parent_share: 0,
    my_share: loggedInAdmin.myShare, // Default My %
    client_share: 0, // Default Client %
    exposureLimit: "",
    domain: loggedInAdmin.domain || "",
    role: "user",
    masterPassword: loggedInAdmin.masterPassword,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // ✅ new state for success


  // 🧭 When role changes → reset shares
  useEffect(() => {
    if (form.role !== "user") {
      setForm((prev) => ({
        ...prev,
        my_share: loggedInAdmin.myShare,
        client_share: 0,
        parent_share: 0,
      }));
    }
  }, [form.role]);

  // 🔁 Auto-adjust client share when "my_share" changes
  useEffect(() => {
    if (form.role !== "user") {
      const total = loggedInAdmin.myShare;
      const myShareNum = Number(form.my_share);
      if (myShareNum > total) {
        // Prevent exceeding
        setForm((prev) => ({
          ...prev,
          my_share: total,
          client_share: 0,
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          client_share: total - myShareNum,
        }));
      }
    }
  }, [form.my_share]); // Trigger only when "my_share" changes

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Restrict numeric input for share fields
    if (["my_share", "client_share"].includes(name)) {
      let num = Number(value);
      if (isNaN(num) || num < 0) return;

      if (num > loggedInAdmin.myShare) {
        num = loggedInAdmin.myShare; // Cap at max
      }

      setForm((prev) => ({
        ...prev,
        [name]: num,
      }));
      return;
    }

    setForm({ ...form, [name]: value });
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

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

  const totalShare = loggedInAdmin.myShare;
  const totalInputShare =
    Number(form.my_share || 0) + Number(form.client_share || 0);

  if (totalInputShare > totalShare) {
    setError(`Total share cannot exceed your share (${totalShare}%)`);
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
      payload.creditReference = form.creditReference || 0;
      payload.balance = form.balance || 0;
    } else {
      payload.creditReference = form.creditReference || 0;
      payload.balance = form.balance || 0;
      payload.maxBalance = form.maxBalance || 0;
      payload.my_share = form.client_share || 0;
      payload.parent_share = form.my_share || 0;
    }

    const res = await axiosInstance.post("/users/register", payload);

    // 🔥 Pass user and message to parent
    if (onUserCreated) {
      onUserCreated(res.data.user, res.data.message); 
      // ✅ Pass message to Members page
    }

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
      <div className="add-modal-card">
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
            {loggedInAdmin.role === "master" && (
              <option value="user">User</option>
            )}
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
            • Length of username: 6–25<br />• Only letters, numbers, and
            underscores allowed
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
                <b>Note:</b> Divide your share from{" "}
                <span style={{ color: "#4caf50" }}>
                  {loggedInAdmin.myShare}%
                </span>
              </p>

              <div className="share-section">
  <div className="share-box">
    <label className="share-label">My Share (%)</label>
    <input
      type="number"
      name="my_share"
      value={form.my_share}
      onChange={handleChange}
    />
  </div>

  <div className="share-box">
    <label className="share-label">Client Share (%)</label>
    <input
      type="number"
      name="client_share"
      value={form.client_share}
      readOnly
    />
  </div>
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
