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
    const path = window.location.pathname;
    const isAdmin = path.startsWith("/admin");

    if (status === 401) {
      if (isAdmin) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_username");
        localStorage.removeItem("admin_role");
        localStorage.removeItem("admin_domain");
        window.location.href = "/admin/login";
      } else {
        // Correct keys for user
        localStorage.removeItem("user_token");
        localStorage.removeItem("user_username");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_domain");
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_timezone");
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);



export default axiosInstance;
