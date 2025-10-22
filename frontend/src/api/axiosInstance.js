// src/api/axiosInstance.js
import axios from "axios";

const BASE_URL = "https://casino-project.onrender.com/api";

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
      : localStorage.getItem("user_token");      // user token

       console.log("Interceptor token:", token); // <- यहाँ देखो क्या आ रहा है

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

    const isAdmin = window.location.pathname.startsWith("/admin");

    if (status === 401) {
      // Only logout on 401 (unauthorized)
      if (isAdmin) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_username");
        localStorage.removeItem("admin_role");
        localStorage.removeItem("admin_domain");
        window.location.href = "/admin/login";
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("domain");
        window.location.href = "/";
      }
    }

    // 403 validation errors → do NOT logout
    return Promise.reject(error);
  }
);


export default axiosInstance;
