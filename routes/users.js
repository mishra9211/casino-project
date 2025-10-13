const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth, requireRoles } = require("../middlewares/auth");

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "mysecret";
const TOKEN_EXPIRY = process.env.JWT_EXPIRY || "2d"; // <-- .env ka value use hoga

// ---------------- HELPER: generate token ----------------
function generateToken(user, expiresIn = TOKEN_EXPIRY) {
  return jwt.sign(
    { user_id: user._id, role: user.role },
    SECRET,
    { expiresIn }
  );
}

// ---------------- Register new user ----------------
router.post("/register", auth, requireRoles(["admin", "master"]), async (req, res) => {
  const { username, password, role, domain, uplineId, exposureLimit, masterPassword } = req.body;
  const ok = await bcrypt.compare(masterPassword || "", req.dbUser.password);
  if (!ok) return res.status(403).json({ error: "Invalid master password" });

  if (req.dbUser.role === "master" && role !== "user") {
    return res.status(403).json({ error: "Master can only create user" });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "Username already taken" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashed,
      role: role || "user",
      domain: domain || "",
      balance: 0,
      uplineId: uplineId || req.dbUser._id,
      exposureLimit: exposureLimit || -1
    });

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to create user" });
  }
});

// ---------------- Get all users under logged-in admin/master ----------------
router.get("/", auth, requireRoles(["admin", "master"]), async (req, res) => {
  try {
    const loggedInUser = req.dbUser;
    const users = await User.find({ uplineId: loggedInUser._id }, "-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ---------------- Login with role check ----------------
router.post("/login", async (req, res) => {
  const { username, password, panel } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Wrong password" });

    // Role check based on panel
    if (panel === "admin" && !(user.role === "admin" || user.role === "master")) {
      return res.status(403).json({ error: "Not authorized for admin panel ❌" });
    }
    if (panel === "user" && user.role !== "user") {
      return res.status(403).json({ error: "Not authorized for user panel ❌" });
    }

    // ✅ Token expiry now taken from .env
    const token = generateToken(user);

    res.json({
      token,
      role: user.role,
      _id: user._id,
      username: user.username,
      domain: user.domain,
      balance: user.balance
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed ❌" });
  }
});

// ---------------- Ping route for auto logout ----------------
router.get("/ping", auth, (req, res) => {
  res.json({ status: "ok", user: { id: req.dbUser._id, username: req.dbUser.username, role: req.dbUser.role } });
});

module.exports = router;
