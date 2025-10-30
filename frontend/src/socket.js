import { io } from "socket.io-client";

let socket;

/**
 * Initialize socket connection (singleton)
 */
export const initSocket = () => {
  if (!socket) {
    socket = io("https://casino-project.onrender.com", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    console.log("Socket initialized:", socket.id);

    // Optional: log disconnects
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });
  }
  return socket;
};

/**
 * Register user/admin with backend socket
 * @param {string} id - user_id or admin_id
 */
export const registerSocket = (id) => {
  if (!socket) socket = initSocket();

  socket.emit("register", id);
  console.log("Socket registered for id:", id);

  // Force logout listener
  socket.off("forceLogout"); // remove previous listener to prevent duplicates
  socket.on("forceLogout", (data) => {
    console.log("Force logout received:", data.message);

    // Clear only relevant localStorage keys
    const isAdmin = window.location.pathname.startsWith("/admin") || localStorage.getItem("admin_token");
    if (isAdmin) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_username");
      localStorage.removeItem("admin_role");
      localStorage.removeItem("admin_domain");
      window.location.href = "/admin/login";
    } else {
      localStorage.removeItem("user_token");
      localStorage.removeItem("user_username");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_domain");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_timezone");
      window.location.href = "/";
    }

    alert(data.message); // optional
  });
};
