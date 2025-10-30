// src/adminSocket.js
import { io } from "socket.io-client";

let adminSocket;

/**
 * Initialize admin socket connection (singleton)
 */
export const initAdminSocket = () => {
  if (!adminSocket) {
    adminSocket = io("https://casino-project.onrender.com", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
    });
    console.log("Admin socket initialized:", adminSocket.id);

    // Optional: disconnect log
    adminSocket.on("disconnect", (reason) => {
      console.log("Admin socket disconnected:", reason);
    });
  }
  return adminSocket;
};

/**
 * Register admin with backend socket
 * @param {string} adminId
 */
export const registerAdminSocket = (adminId) => {
  const socket = initAdminSocket();
  socket.emit("register", adminId);
  console.log("Admin socket registered:", adminId);

  // Remove old listener to avoid duplicates
  socket.off("forceLogout");
  socket.on("forceLogout", (data) => {
    console.log("Admin forceLogout received:", data.message);

    // Clear only admin-related localStorage keys
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_username");
    localStorage.removeItem("admin_role");
    localStorage.removeItem("admin_p_l");
    localStorage.removeItem("admin_exposure");
    localStorage.removeItem("admin_credit_reference");
    localStorage.removeItem("admin_balance");
    localStorage.removeItem("admin_my_share");
    localStorage.removeItem("admin_id");

    alert(data.message); // optional
    window.location.href = "/admin/login";
  });
};
