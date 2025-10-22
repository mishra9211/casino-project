import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import "./AdminLogin.css";

const AdminLogin = ({ setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.post("/users/login", {
        username,
        password,
        panel: "admin", // backend को बताए कि admin panel login
      });

      console.log("Login response:", res.data);

      const { token, role, username: uName, domain } = res.data;

      // ✅ Token check
      if (!token) {
        setError("Login Failed ❌");
        return;
      }

      // ✅ Role check: admin, master, owner
      if (!["owner", "admin", "master"].includes(role)) {
        setError("You are not authorized for admin panel ❌");
        return;
      }

      // ✅ Save only admin-specific keys to prevent overwrite
      localStorage.setItem("admin_token", token);
      localStorage.setItem("admin_username", uName);
      localStorage.setItem("admin_role", role);
      localStorage.setItem("admin_domain", domain || "");

      // ✅ Optional: call setToken if provided
      if (typeof setToken === "function") {
        setToken(token);
      }

      setError("");
      navigate("/admin/dashboard"); // Owner/Admin both can go to same dashboard
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || "Login Failed ❌");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">🎰 Admin / Master / Owner Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
};

export default AdminLogin;
