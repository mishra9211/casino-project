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
// ---------------- Register new user ----------------
router.post(
  "/register",
  auth,
  requireRoles(["owner", "admin", "master"]),
  async (req, res) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      // --- Extract fields ---
      const {
        username,
        password,
        role,
        domain,
        uplineId,
        exposureLimit,
        masterPassword,
        creditReference,
        balance: balanceStr,
        maxBalance,
        my_share: myShareBody,
        parent_share: parentShareBody,
      } = req.body;

      // --- Numeric conversions ---
      const creditAmount = Number(balanceStr || 0);
      const creditReferenceNum = Number(creditReference || 0);
      const maxBalanceNum = Number(maxBalance || 0);
      const incomingMyShare = Number(myShareBody || 0);

      // --- Validate master password ---
      const ok = await bcrypt.compare(masterPassword || "", req.dbUser.password);
      if (!ok) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ error: "Invalid master password" });
      }

      // --- Role hierarchy validation ---
      const creatorRole = req.dbUser.role;
      if (creatorRole === "owner" && !["admin", "master", "user"].includes(role)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ error: "Owner can only create admin/master/user" });
      }
      if (creatorRole === "admin" && !["master", "user"].includes(role)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ error: "Admin can only create master/user" });
      }
      if (creatorRole === "master" && role !== "user") {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ error: "Master can only create users" });
      }

      // --- Validate & normalize username ---
      if (!username || typeof username !== "string") {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: "Invalid username" });
      }
      const cleanUsername = username.trim().toLowerCase();
      if (cleanUsername.length < 3 || cleanUsername.length > 25) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: "Username must be between 3 and 25 characters" });
      }
      const existingUser = await User.findOne({
        username: { $regex: new RegExp(`^${cleanUsername}$`, "i") },
      }).session(session);
      if (existingUser) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: "Username already taken" });
      }

      // --- Determine shares ---
      let creatorShare = Number(req.dbUser.my_share || 0);
      if (req.dbUser.role === "owner" && !creatorShare) creatorShare = 100;

      let finalMyShare = incomingMyShare;
      if (role !== "user") {
        if (finalMyShare < 0) finalMyShare = 0;
        if (finalMyShare > creatorShare) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ error: `My share cannot exceed your share (${creatorShare}%)` });
        }
      }

      const finalParentShare = role !== "user" ? creatorShare - finalMyShare : 0;

      // --- Check creator balance for creditAmount ---
      if (creditAmount > 0) {
        const freshCreator = await User.findById(req.dbUser._id).session(session);
        if (!freshCreator) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ error: "Creator not found" });
        }
        const creatorBalance = Number(freshCreator.balance || 0);
        if (creatorBalance < creditAmount) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ error: "Insufficient balance to allocate this amount" });
        }
      }

      // --- Hash password ---
      const hashedPassword = await bcrypt.hash(password, 10);

      // --- Create new user object ---
      const newUserData = {
        username: cleanUsername,
        password: hashedPassword,
        role: role || "user",
        domain: domain || req.dbUser.domain,
        uplineId: uplineId || req.dbUser._id,
        exposureLimit: typeof exposureLimit !== "undefined" ? Number(exposureLimit) : -1,
        balance: creditAmount,
        player_balance: role === "user" ? creditAmount : 0,
        credit_reference: creditReferenceNum,
        maxBalance: maxBalanceNum,
        my_share: role !== "user" ? finalMyShare : 0,
        parent_share: role !== "user" ? finalParentShare : 0,
      };

      // --- Save user ---
      const [createdUser] = await User.create([newUserData], { session });

      // --- Deduct creator balance ---
      if (creditAmount > 0) {
        const creator = await User.findById(req.dbUser._id).session(session);
        creator.balance = Number(creator.balance || 0) - creditAmount;
        await creator.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      const userObj = createdUser.toObject();
      delete userObj.password;

      return res.json({ success: true, user: userObj });
    } catch (err) {
      console.error("❌ Error creating user (register):", err);
      try { await session.abortTransaction(); } catch (e) { console.error(e); }
      session.endSession();
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);




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
