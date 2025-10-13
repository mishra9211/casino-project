// src/hooks/useAutoLogoutPing.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import jwtDecode from "jwt-decode";

const useAutoLogoutPing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/" || path === "/admin/login") return;

    const tokenKey = path.startsWith("/admin") ? "admin_token" : "token";
    const token = localStorage.getItem(tokenKey);
    if (!token) {
      console.log("No token found");
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.log("Invalid token, logging out...");
      localStorage.clear();
      navigate(path.startsWith("/admin") ? "/admin/login" : "/");
      return;
    }

    const expTime = decoded.exp * 1000;
    const now = Date.now();
    let timeout = expTime - now;

    console.log("Token expires at:", new Date(expTime).toLocaleString());
    console.log("Time until expiry (ms):", timeout);

    if (timeout <= 0) {
      console.log("Token already expired, logging out...");
      localStorage.clear();
      navigate(path.startsWith("/admin") ? "/admin/login" : "/");
      return;
    }

    // ---------------- Auto logout ----------------
    const logout = () => {
      console.log("Token expired, logging out...");
      localStorage.clear();
      navigate(path.startsWith("/admin") ? "/admin/login" : "/");
    };

    const timer = setTimeout(logout, timeout);

    // ---------------- Ping API 5s before expiry ----------------
    const pingTime = timeout - 5000 > 0 ? timeout - 5000 : 0;
    const pingTimer = setTimeout(async () => {
      console.log("Calling ping API 5 sec before token expiry...");
      try {
        await axiosInstance.get("/users/ping");
        console.log("Ping successful ✅");
      } catch (err) {
        console.log("Ping failed, logging out ❌");
        logout();
      }
    }, pingTime);

    // ---------------- Optional: countdown every second (debug) ----------------
    const interval = setInterval(() => {
      const remaining = expTime - Date.now();
      if (remaining >= 0) {
        console.log("Time left until token expiry (s):", Math.round(remaining / 1000));
      }
    }, 1000);

    // ---------------- Cleanup ----------------
    return () => {
      clearTimeout(timer);
      clearTimeout(pingTimer);
      clearInterval(interval);
    };
  }, [navigate]);
};

export default useAutoLogoutPing;
