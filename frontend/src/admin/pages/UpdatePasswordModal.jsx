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
  const [message, setMessage] = useState(""); // <-- new state for API messages
  const [isError, setIsError] = useState(false); // <-- track if message is error

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      setMessage("Please fill in both fields.");
      setIsError(true);
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      setIsError(true);
      return;
    }

    try {
      setLoading(true);
      setMessage(""); // reset previous messages
      const res = await axiosInstance.put(`/users/update-password/${userId}`, { password });
      setMessage(res.data.message || "Password updated successfully!");
      setIsError(false);
      setTimeout(() => {
        onClose();
      }, 1500); // auto-close modal after showing success message
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "Failed to update password");
      setIsError(true);
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

          {/* API Message */}
          {message && (
            <div className={`api-message ${isError ? "error" : "success"}`}>
              {message}
            </div>
          )}
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
