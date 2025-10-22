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

      // --- extract fields (accept both snake_case and camelCase just in case) ---
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
        myShare: myShareAlt,
        parentShare: parentShareAlt,
      } = req.body;

      // normalize incoming numeric fields
      const creditReferenceNum = Number(creditReference || 0);
      const creditAmount = Number(balanceStr || 0); // amount to transfer from creator -> new user
      const maxBalanceNum = Number(maxBalance || 0);

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

      // --- Username normalize & validate ---
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
      // check existence (case-insensitive)
      const existingUser = await User.findOne({
        username: { $regex: new RegExp(`^${cleanUsername}$`, "i") },
      }).session(session);
      if (existingUser) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: "Username already taken" });
      }

      // --- Determine creator's total share (default owner -> 100) ---
      let creatorShare = Number(req.dbUser.my_share || 0);
      if (!creatorShare && req.dbUser.role === "owner") creatorShare = 100;

      // --- Parse incoming shares (prefer snake_case, fallback to camelCase) ---
      const incomingMyShare = Number(
        typeof myShareBody !== "undefined" ? myShareBody : (typeof myShareAlt !== "undefined" ? myShareAlt : 0)
      );
      const incomingParentShare = typeof parentShareBody !== "undefined"
        ? Number(parentShareBody)
        : (typeof parentShareAlt !== "undefined" ? Number(parentShareAlt) : undefined);

      // If creating non-user role, validate shares
      let finalMyShare = 0;
      let finalParentShare = 0;
      if (role !== "user") {
        // my_share must be provided (or at least meaningful)
        finalMyShare = Number(isNaN(incomingMyShare) ? 0 : incomingMyShare);

        if (finalMyShare < 0) finalMyShare = 0;
        if (finalMyShare > creatorShare) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ error: `My share cannot exceed your share (${creatorShare}%)` });
        }

        if (typeof incomingParentShare !== "undefined") {
          // If frontend explicitly sent parent_share, validate total not exceed creatorShare
          finalParentShare = Number(isNaN(incomingParentShare) ? 0 : incomingParentShare);
          if (finalParentShare < 0) finalParentShare = 0;

          if (finalMyShare + finalParentShare > creatorShare) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: `Sum of my_share and parent_share cannot exceed your share (${creatorShare}%)` });
          }

          // If sum less than creatorShare, allow — parent_share remains as sent (creator retains remainder)
          // Optionally: force parent_share = creatorShare - my_share — but here we allow explicit parent_share if valid.
        } else {
          // parent_share not provided -> compute as remaining from creator
          finalParentShare = creatorShare - finalMyShare;
        }
      }

      // --- Balance transfer check: ensure creator has enough balance if creditAmount > 0 ---
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

      // --- Build new user object ---
      const newUserData = {
        username: cleanUsername,
        password: hashedPassword,
        role: role || "user",
        domain: domain || req.dbUser.domain,
        uplineId: uplineId || req.dbUser._id,
        exposureLimit: typeof exposureLimit !== "undefined" ? Number(exposureLimit) : -1,
        balance: creditAmount, // initial balance equals credited amount (0 if none)
        credit_reference: creditReferenceNum || 0,
        maxBalance: Number(maxBalanceNum || 0),
        player_balance: role === "user" ? creditAmount : 0,
      };

      if (role !== "user") {
        newUserData.my_share = finalMyShare;
        newUserData.parent_share = finalParentShare;
      } else {
        // for plain users we can leave shares as defaults (0)
        newUserData.my_share = 0;
        newUserData.parent_share = 0;
      }

      // --- Create user inside transaction ---
      const createdUsers = await User.create([newUserData], { session });
      const createdUser = createdUsers[0];

      // --- Deduct creator balance if creditAmount > 0 ---
      if (creditAmount > 0) {
        const creator = await User.findById(req.dbUser._id).session(session);
        creator.balance = Number(creator.balance || 0) - creditAmount;
        await creator.save({ session });

        // Optional: also record ledger / transaction log here
      }

      await session.commitTransaction();
      session.endSession();

      // Remove password before return
      const userObj = createdUser.toObject();
      delete userObj.password;

      return res.json({ success: true, user: userObj });
    } catch (err) {
      console.error("❌ Error creating user (register):", err);
      try { await session.abortTransaction(); } catch (e) { console.error(e); }
      session.endSession();
      return res.status(400).json({ error: "Failed to create user" });
    }
  }
);
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
