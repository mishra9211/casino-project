import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { registerAdminSocket } from "../../adminSocket";
import "./AdminLogin.css";

const AdminLogin = ({ setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    try {
      const res = await axiosInstance.post("/users/login", {
        username,
        password,
        panel: "admin",
      });

      const { token, role, username: uName, p_l, exposure, credit_reference, balance, my_share, _id } = res.data;

      if (!token) {
        setMessage({ text: "Login Failed ❌", type: "error" });
        return;
      }

      if (!["owner", "admin", "master"].includes(role)) {
        setMessage({
          text: "You are not authorized for admin panel ❌",
          type: "error",
        });
        return;
      }

      // ✅ Store admin info
      localStorage.setItem("admin_token", token);
      localStorage.setItem("admin_username", uName);
      localStorage.setItem("admin_role", role);
      localStorage.setItem("admin_p_l", p_l || "0");
      localStorage.setItem("admin_exposure", exposure || "0");
      localStorage.setItem("admin_credit_reference", credit_reference || "0");
      localStorage.setItem("admin_balance", balance || "0");
      localStorage.setItem("admin_my_share", my_share || "0");
      localStorage.setItem("admin_id", _id);

      // ✅ Register socket for force logout
      registerAdminSocket(_id);

      if (typeof setToken === "function") setToken(token);

      setMessage({ text: "Login Successful ✅", type: "success" });
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Login error:", err);
      setMessage({
        text: err.response?.data?.error || "Login Failed ❌",
        type: "error",
      });
    }
  };

  return (
    <div className="admin-login-container">
      {message.text && (
        <div
          className={`global-message ${
            message.type === "success" ? "success" : "error"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="admin-login-card">
        <img
          src="/getid-logo-0p1Smfhr.webp"
          alt="Logo"
          className="admin-login-logo"
        />
        <p className="admin-login-subtitle">Sign in your employee account</p>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Enter User ID"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="admin-login-input"
          />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="admin-login-input"
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash className="password-icon" /> : <FaEye className="password-icon" />}
            </span>
          </div>

          <button type="submit" className="admin-login-button">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
