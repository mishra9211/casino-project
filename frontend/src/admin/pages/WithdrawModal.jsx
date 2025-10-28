import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import "./DepositWithdrawModal.css";

const WithdrawModal = ({ user, onClose, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [customRemark, setCustomRemark] = useState("");
  const [balanceAfter, setBalanceAfter] = useState(0);
  const [creditAfter, setCreditAfter] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const newBalance = (Number(user.balance || 0) - Number(amount || 0)).toFixed(2);
    const newCredit = (Number(user.credit_reference || 0) - Number(amount || 0)).toFixed(2);

    setBalanceAfter(newBalance);
    setCreditAfter(newCredit);
  }, [amount, user]);

  const handleSubmit = async () => {
    if (!amount) return alert("Please enter an amount");

    const finalRemark = remark === "custom" ? customRemark : remark;
    if (!finalRemark.trim()) return alert("Please enter a remark");

    if (!user?._id) return alert("Invalid user data");

    try {
      setLoading(true);

      // ✅ API call to withdraw funds
      const response = await axiosInstance.post("/users/transaction", {
        targetUserId: user._id,
        amount: Number(amount),
        type: "withdraw",
        remark: finalRemark,
      });

      if (response.data.success) {
        alert(response.data.message || "Withdraw successful");

        // Optional: trigger parent refresh
        if (onSuccess) onSuccess(response.data);

        onClose();
      } else {
        alert(response.data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Withdraw Error:", error);
      const msg =
        error.response?.data?.error || error.message || "Server error during withdrawal";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay-deposit">
      <div className="modal-box custom-modal">
        <h2 className="modal-title">Withdraw</h2>

        <div className="form-section">
          {/* Credit Reference */}
          <div className="form-group">
            <label>Credit Reference</label>
            <input type="text" value={user?.credit_reference || 0} disabled />
          </div>

          {/* Credit After */}
          <div className="form-group">
            <label>Credit After</label>
            <input type="text" value={creditAfter} disabled />
          </div>

          {/* Amount */}
          <div className="form-group">
            <label>Amount *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter Amount"
              disabled={loading}
            />
          </div>

          {/* Balance After */}
          <div className="form-group">
            <label>Balance After</label>
            <input type="text" value={balanceAfter} disabled />
          </div>

          {/* Remark */}
          <div className="form-group">
            <label>Remark (max: 500)</label>
            <select
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              disabled={loading}
            >
              <option value="">--- Select Remark ---</option>
              <option value="Manual Withdraw">Manual Withdraw</option>
              <option value="Adjustment">Adjustment</option>
              <option value="custom">Custom Remark</option>
            </select>

            {remark === "custom" && (
              <textarea
                value={customRemark}
                onChange={(e) => setCustomRemark(e.target.value)}
                placeholder="Enter your description here"
                className="custom-remark-input"
                maxLength={500}
                rows={4}
                disabled={loading}
              />
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="approve-btn withdraw-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Processing..." : "Approve and Withdraw"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;
