import { io } from "socket.io-client";

let socket;

export const initSocket = () => {
  if (!socket) {
    socket = io("https://casino-project.onrender.com"); // backend socket URL
  }
  return socket;
};

/**
 * Register any user/admin with socket
 * @param {string} id - user_id or admin_id
 */
export const registerSocket = (id) => {
  if (!socket) socket = initSocket();
  socket.emit("register", id);
  console.log("Socket registered for id:", id);

  // Force logout listener
  socket.on("forceLogout", (data) => {
    console.log("Force logout received:", data.message);
    localStorage.clear();
    
    // Redirect based on id type
    const isAdmin = window.location.pathname.startsWith("/admin") || localStorage.getItem("admin_token");
    if (isAdmin) {
      window.location.href = "/admin/login";
    } else {
      window.location.href = "/";
    }

    alert(data.message); // optional message
  });
};
