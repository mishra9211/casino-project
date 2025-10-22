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
      } = req.body;

      // --- Validate required fields ---
      if (!username || typeof username !== "string") {
        throw { status: 400, message: "Invalid username" };
      }
      if (!password || typeof password !== "string") {
        throw { status: 400, message: "Password is required" };
      }

      // --- Numeric conversions safely ---
      const creditAmount = isNaN(Number(balanceStr)) ? 0 : Number(balanceStr);
      const creditReferenceNum = isNaN(Number(creditReference)) ? 0 : Number(creditReference);
      const maxBalanceNum = isNaN(Number(maxBalance)) ? 0 : Number(maxBalance);
      const incomingMyShare = isNaN(Number(myShareBody)) ? 0 : Number(myShareBody);

      // --- Validate master password ---
      if (!masterPassword) {
        throw { status: 400, message: "Master password is required" };
      }
      const ok = await bcrypt.compare(masterPassword, req.dbUser.password);
      if (!ok) {
        throw { status: 403, message: "Invalid master password" };
      }

      // --- Role hierarchy validation ---
      const creatorRole = req.dbUser.role;
      if (
        (creatorRole === "owner" && !["admin", "master", "user"].includes(role)) ||
        (creatorRole === "admin" && !["master", "user"].includes(role)) ||
        (creatorRole === "master" && role !== "user")
      ) {
        throw { status: 403, message: `${creatorRole} cannot create role ${role}` };
      }

      // --- Normalize username ---
      const cleanUsername = username.trim().toLowerCase();
      if (cleanUsername.length < 3 || cleanUsername.length > 25) {
        throw { status: 400, message: "Username must be 3-25 characters" };
      }
      const existingUser = await User.findOne({ username: { $regex: `^${cleanUsername}$`, $options: "i" } }).session(session);
      if (existingUser) {
        throw { status: 400, message: "Username already taken" };
      }

      // --- Determine shares ---
      let creatorShare = Number(req.dbUser.my_share || 0);
      if (req.dbUser.role === "owner" && !creatorShare) creatorShare = 100;

      let finalMyShare = incomingMyShare;
      if (role !== "user") {
        if (finalMyShare < 0) finalMyShare = 0;
        if (finalMyShare > creatorShare) {
          throw { status: 400, message: `My share cannot exceed your share (${creatorShare}%)` };
        }
      }
      const finalParentShare = role !== "user" ? creatorShare - finalMyShare : 0;

      // --- Check creator balance ---
      if (creditAmount > 0) {
        const freshCreator = await User.findById(req.dbUser._id).session(session);
        if (!freshCreator) throw { status: 404, message: "Creator not found" };
        if ((freshCreator.balance || 0) < creditAmount) {
          throw { status: 400, message: "Insufficient balance to allocate this amount" };
        }
      }

      // --- Hash password ---
      const hashedPassword = await bcrypt.hash(password, 10);

      // --- Create user object ---
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

      const [createdUser] = await User.create([newUserData], { session });

      // --- Deduct creator balance ---
      if (creditAmount > 0) {
        const creator = await User.findById(req.dbUser._id).session(session);
        creator.balance -= creditAmount;
        await creator.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      const userObj = createdUser.toObject();
      delete userObj.password;

      return res.json({ success: true, user: userObj });

    } catch (err) {
      // --- Rollback transaction ---
      try { await session.abortTransaction(); } catch (e) { console.error("Rollback failed:", e); }
      session.endSession();

      // --- Send proper error message ---
      console.error("❌ Register error:", err);
      const status = err.status || 500;
      const message = err.message || "Internal Server Error";
      return res.status(status).json({ error: message });
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
