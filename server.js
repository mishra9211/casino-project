const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Models
const User = require("./models/User");
const Banner = require("./models/Banner");
const Game = require("./models/Game");

// Routes
const categoryRoutes = require("./routes/category");
const marketRoutes = require("./routes/market");
const userRoutes = require("./routes/users");
const bannerRoutes = require("./routes/banner");
const gameRoutes = require("./routes/games");
const categoriesRoutes = require("./routes/categories");
const categorywiseRoutes = require("./routes/categorywisecasinolist");
const matkaBetRoutes = require("./routes/matkaBet");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Middleware
app.use(cors({
  origin: "https://casino-project-1.onrender.com", // आपके frontend URL
  credentials: true, // ✅ cookie allow
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Map to track connected users
// Map to track connected users: userId → Set of socketIds
const { setIo, getConnectedUsers, getIo } = require("./utils/socketStore");

// Initialize map as Map<userId, Set<socketId>>
const connectedUsers = getConnectedUsers();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Register userId with socket
  socket.on("register", (userId) => {
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId).add(socket.id);
    console.log("Registered socket for user:", userId, Array.from(connectedUsers.get(userId)));
  });

  // Disconnect handler
  socket.on("disconnect", () => {
    for (const [userId, socketSet] of connectedUsers.entries()) {
      if (socketSet.has(socket.id)) {
        socketSet.delete(socket.id);
        if (socketSet.size === 0) connectedUsers.delete(userId);
      }
    }
    console.log("User disconnected:", socket.id);
  });
});


setIo(io); // ✅ store io globally


// ✅ Health Check Route (for uptime monitoring)
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Backend is alive ✅" });
});

// API Routes
app.use("/api/category", categoryRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/users", userRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/categorywise", categorywiseRoutes);
app.use("/api", matkaBetRoutes);

// ---------------- Force Logout Endpoint (optional) ----------------
app.post("/api/users/force-logout/:userId", (req, res) => {
  const { userId } = req.params;
  const connectedUsers = getConnectedUsers();
  const socketId = connectedUsers.get(userId);
  const ioInstance = io; // या getIo() भी कर सकते हो

  if (socketId) {
    ioInstance.to(socketId).emit("forceLogout", { message: "Your session has expired, please login again." });
    connectedUsers.delete(userId);
    return res.json({ success: true, message: "Logout event sent" });
  }

  res.json({ success: false, message: "User not connected" });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/casino_db")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

// JWT Secret
const SECRET = process.env.JWT_SECRET || "mysecret";

// ✅ Self-Ping System (keep Render awake)
setInterval(() => {
  fetch("https://casino-project.onrender.com/api/health")
    .then(() => console.log("🟢 Self ping:", new Date().toLocaleTimeString()))
    .catch((err) => console.log("🔴 Self ping error:", err.message));
}, 4 * 60 * 1000); // every 4 minutes

// Dynamic port for Render
const PORT = process.env.PORT || 5001;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

