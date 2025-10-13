// server.js
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

// Socket.io Example (Optional)
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Serve React frontend
const frontendBuildPath = path.join(__dirname, "frontend/build");
app.use(express.static(frontendBuildPath));

// SPA fallback for React routes
app.get("/*", (req, res) => {
  res.sendFile(path.join(frontendBuildPath, "index.html"));
});
// Dynamic port for Render
const PORT = process.env.PORT || 5001;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
