import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import ConfirmModal from "../components/ConfirmModal";
import "./LockSettingsModal.css";

const LockSettingsModal = ({ onClose, user }) => {
  const [lockUser, setLockUser] = useState(user?.lockUser || false);
  const [lockBet, setLockBet] = useState(user?.lockBet || false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState(null); // "user" or "bet"

  // 🧩 Trigger confirm for Lock User
  const handleToggleLockUser = () => {
    setConfirmType("user");
    setShowConfirm(true);
  };

  // 🧩 Trigger confirm for Lock Bet
  const handleToggleLockBet = () => {
    setConfirmType("bet");
    setShowConfirm(true);
  };

  // ✅ On Confirm (Yes button)
  const handleConfirm = () => {
    if (confirmType === "user") {
      setLockUser(!lockUser);
    } else if (confirmType === "bet") {
      setLockBet(!lockBet);
    }
    setShowConfirm(false);
    setConfirmType(null);
  };

  // ❌ On Cancel
  const handleCancel = () => {
    setShowConfirm(false);
    setConfirmType(null);
  };

  // 🧠 Dynamic title & message based on confirmType
  const confirmTitle =
    confirmType === "user"
      ? "Confirm User Lock"
      : confirmType === "bet"
      ? "Confirm Bet Lock"
      : "";

  const confirmMessage =
    confirmType === "user"
      ? "Do you want to enable or disable the Lock User status?"
      : confirmType === "bet"
      ? "Do you want to enable or disable the Lock Bet status?"
      : "";

  return (
    <div className="lock-modal-overlay">
      <div className="lock-settings-container">
        <div className="lock-header">
          <h2>Lock Settings</h2>
          <FaTimes className="close-btn-lock" onClick={onClose} />
        </div>

        <table className="lock-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Lock User</td>
              <td>
                <input
                  type="checkbox"
                  checked={lockUser}
                  onChange={handleToggleLockUser}
                />
              </td>
            </tr>
            <tr>
              <td>Lock Bet</td>
              <td>
                <input
                  type="checkbox"
                  checked={lockBet}
                  onChange={handleToggleLockBet}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 🔹 Confirmation Popup */}
      <ConfirmModal
        isOpen={showConfirm}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default LockSettingsModal;
