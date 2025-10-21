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
const fetch = require("node-fetch"); // 👈 self-ping ke liye

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
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/casino_db")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

// JWT Secret
const SECRET = process.env.JWT_SECRET || "mysecret";

// Socket.io
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => console.log("User disconnected:", socket.id));
});

// ✅ Self-Ping System (keep Render awake)
setInterval(() => {
  fetch("https://casino-project.onrender.com/api/health")
    .then((res) => console.log("🟢 Self ping:", new Date().toLocaleTimeString()))
    .catch((err) => console.log("🔴 Self ping error:", err.message));
}, 4 * 60 * 1000); // every 4 minutes

// Dynamic port for Render
const PORT = process.env.PORT || 5001;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
