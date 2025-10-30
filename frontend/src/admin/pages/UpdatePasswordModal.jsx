import React, { useState } from "react";
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import axiosInstance from "../../api/axiosInstance";
import "./UpdatePasswordModal.css";

const UpdatePasswordModal = ({ onClose, userId }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
  if (!password || !confirmPassword) {
    return alert("Please fill in both fields.");
  }
  if (password !== confirmPassword) {
    return alert("Passwords do not match!");
  }

  try {
    setLoading(true);
    const res = await axiosInstance.put(`/users/update-password/${userId}`, { password });
    alert(res.data.message || "Password updated successfully!");
    onClose();
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "Failed to update password");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="password-modal-overlay">
      <div className="password-modal">
        {/* Header */}
        <div className="password-modal-header">
          <h2>Update Password</h2>
          <FaTimes className="close-btn" onClick={onClose} />
        </div>

        {/* Body */}
        <div className="password-modal-body">
          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {showPassword ? (
                <FaEyeSlash
                  className="eye-icon"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <FaEye
                  className="eye-icon"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {showConfirmPassword ? (
                <FaEyeSlash
                  className="eye-icon"
                  onClick={() => setShowConfirmPassword(false)}
                />
              ) : (
                <FaEye
                  className="eye-icon"
                  onClick={() => setShowConfirmPassword(true)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="password-modal-footer">
          <button className="cancel-btn-updatepassword" onClick={onClose}>
            Cancel
          </button>
          <button
            className="submit-btn-updatepassword"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Updating..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordModal;
