// src/api/axiosInstance.js
import axios from "axios";

const BASE_URL = "http://localhost:5001/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor – use proper token
axiosInstance.interceptors.request.use(
  (config) => {
    const isAdmin = window.location.pathname.startsWith("/admin");
    const token = isAdmin
      ? localStorage.getItem("admin_token") // admin token
      : localStorage.getItem("token");      // user token

    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle expired / invalid token
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      const isAdmin = window.location.pathname.startsWith("/admin");

      if (isAdmin) {
        // Clear admin storage and redirect to admin login
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_username");
        localStorage.removeItem("admin_role");
        localStorage.removeItem("admin_domain");
        window.location.href = "/admin/login";
      } else {
        // Clear user storage and redirect to user login
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("domain");
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
