import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance"; 
import styles from "./UserLogin.module.css";

const UserLogin = () => {
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
      panel: "user",
      timezone
    });

    const { token, role, username: uName, domain, _id } = res.data;

    // Role check
    if (role !== "user") {
      setError("You are not authorized for user panel ❌");
      return;
    }

    // ✅ Store user-specific keys including MongoDB _id
    localStorage.setItem("user_token", token);
    localStorage.setItem("user_role", role);
    localStorage.setItem("user_username", uName);
    localStorage.setItem("user_domain", domain || "");
    localStorage.setItem("user_id", _id);

    setError("");
    navigate("/home");
  } catch (err) {
    console.error("Login error:", err);
    setError(err.response?.data?.error || "Login failed ❌");
  }
};



  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Welcome to Casino Adda</h2>
        <p className={styles.subtitle}>Login to start playing</p>

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

        <p className={styles.registerLink}>
          Don&apos;t have an account? <a href="/register">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default UserLogin;
