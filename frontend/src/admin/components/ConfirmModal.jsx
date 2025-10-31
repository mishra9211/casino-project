import React from "react";
import "./ConfirmModal.css";

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-container">
        <div className="confirm-icon-circle">
          <span className="confirm-icon">!</span>
        </div>

        <h2 className="confirm-title">{title}</h2>
        <p className="confirm-message">{message}</p>

        <div className="confirm-buttons">
          <button className="btn-yes" onClick={onConfirm}>
            Yes!
          </button>
          <button className="btn-no" onClick={onCancel}>
            No, Cancel!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
