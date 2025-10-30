import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance"; 
import { registerSocket } from "../socket"; // ✅ import socket helper
import styles from "./UserLogin.module.css";

const UserLogin = () => {
  const [username, setUsername] = useState("");   
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const res = await axiosInstance.post("/users/login", {
        username,
        password,
        panel: "user",
        timezone
      });

      const { token, role, username: uName, domain, _id } = res.data;

      if (role !== "user") {
        setError("आपको यूज़र पैनल की अनुमति नहीं है ❌");
        return;
      }

      // ✅ Store user info in localStorage
      localStorage.setItem("user_token", token);
      localStorage.setItem("user_role", role);
      localStorage.setItem("user_username", uName);
      localStorage.setItem("user_domain", domain || "");
      localStorage.setItem("user_id", _id);
      localStorage.setItem("user_timezone", timezone);

      // ✅ Register socket for force logout
      registerSocket(_id);

      setError("");
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || "लॉगिन असफल ❌");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <form onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.loginBtn}>
            Login
          </button>
        </form>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </div>
    </div>
  );
};

export default UserLogin;
