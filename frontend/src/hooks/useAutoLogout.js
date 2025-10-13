// src/hooks/useAutoLogout.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useAutoLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = () => {
      const adminToken = localStorage.getItem("admin_token");
      const userToken = localStorage.getItem("token");
      const token = adminToken || userToken;
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const now = Date.now();
        const exp = payload.exp * 1000;

        if (now >= exp) {
          // Token expired
          if (adminToken) {
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_username");
            localStorage.removeItem("admin_role");
            localStorage.removeItem("admin_domain");
            navigate("/admin/login");
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("role");
            localStorage.removeItem("domain");
            navigate("/");
          }
        }
      } catch (err) {
        console.error("Invalid token", err);
        localStorage.clear();
        navigate("/");
      }
    };

    // 🔹 Check every 500ms
    const interval = setInterval(checkToken, 500);

    return () => clearInterval(interval);
  }, [navigate]);
};
