// userSocket.js
import { io } from "socket.io-client";
let userSocket;

export const initUserSocket = () => {
  if (!userSocket) {
    userSocket = io("https://casino-project.onrender.com", { transports: ["websocket"] });
    console.log("User socket initialized:", userSocket.id);
  }
  return userSocket;
};

export const registerUserSocket = (userId) => {
  const socket = initUserSocket();
  socket.emit("register", userId);
  console.log("User socket registered:", userId);

  socket.off("forceLogout"); // prevent duplicates
  socket.on("forceLogout", (data) => {
    console.log("User forceLogout:", data.message);
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_username");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_domain");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_timezone");
    alert(data.message);
    window.location.href = "/";
  });
};
