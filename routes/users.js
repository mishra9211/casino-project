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
router.post("/register", auth, requireRoles(["owner", "admin", "master"]), async (req, res) => {
  const { username, password, role, domain, uplineId, exposureLimit, masterPassword } = req.body;
  const ok = await bcrypt.compare(masterPassword || "", req.dbUser.password);
  if (!ok) return res.status(403).json({ error: "Invalid master password" });

  // ---------------- Role hierarchy rules ----------------
  const creatorRole = req.dbUser.role;

  // Owner rules
  if (creatorRole === "owner") {
    if (!["admin", "master", "user"].includes(role)) {
      return res.status(403).json({ error: "Owner can only create admin/master/user" });
    }
  }

  // Admin rules
  if (creatorRole === "admin") {
    if (role !== "user") return res.status(403).json({ error: "Admin can only create users" });
  }

  // Master rules
  if (creatorRole === "master") {
    if (role !== "user") return res.status(403).json({ error: "Master can only create users" });
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
router.get("/", auth, requireRoles(["owner", "admin", "master"]), async (req, res) => {
  try {
    const loggedInUser = req.dbUser;
    let users;

    if (loggedInUser.role === "owner") {
      // Owner can see all admins
      users = await User.find({ uplineId: loggedInUser._id }, "-password");
    } else if (loggedInUser.role === "admin") {
      // Admin can see their users
      users = await User.find({ uplineId: loggedInUser._id }, "-password");
    } else if (loggedInUser.role === "master") {
      users = await User.find({ uplineId: loggedInUser._id }, "-password");
    }

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


// ---------------- Login with role check ----------------
router.post("/login", async (req, res) => {
  const { username, password, panel, timezone } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Wrong password" });

    // Role check based on panel
    if (panel === "admin" && !(["admin","master","owner"].includes(user.role))) {
      return res.status(403).json({ error: "Not authorized for admin panel ❌" });
    }
    if (panel === "user" && user.role !== "user") {
      return res.status(403).json({ error: "Not authorized for user panel ❌" });
    }

    // Update timezone if sent
    if (timezone) {
      user.timezone = timezone;
      await user.save();
    }

    const token = generateToken(user);

    // ✅ Send all financial fields along with user info
    res.json({
      token,
      _id: user._id,
      username: user.username,
      role: user.role,
      domain: user.domain,
      balance: user.balance,
      player_balance: user.player_balance,
      credit_reference: user.credit_reference,
      my_share: user.my_share,
      parent_share: user.parent_share,
      p_l: user.p_l,
      exposure: user.exposure,
      exposureLimit: user.exposureLimit,
      timezone: user.timezone
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
