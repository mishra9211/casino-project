import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import "./LockSettingsModal.css";

const LockSettingsModal = ({ onClose, user }) => {
  const [lockUser, setLockUser] = useState(user?.lockUser || false);
  const [lockBet, setLockBet] = useState(user?.lockBet || false);

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
                  onChange={() => setLockUser(!lockUser)}
                />
              </td>
            </tr>
            <tr>
              <td>Lock Bet</td>
              <td>
                <input
                  type="checkbox"
                  checked={lockBet}
                  onChange={() => setLockBet(!lockBet)}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LockSettingsModal;
