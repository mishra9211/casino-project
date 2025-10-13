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

const User = require("./models/User");
const Banner = require("./models/Banner");
const Game = require("./models/Game"); // ✅ model import
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

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/category", categoryRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/users", userRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/categorywise", categorywiseRoutes);
app.use("/api", matkaBetRoutes);


mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/casino_db")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

const SECRET = process.env.JWT_SECRET || "mysecret";



server.listen(5001, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:5001");
});
