const mongoose = require("mongoose"); // ऊपर import होना चाहिए
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth, requireRoles } = require("../middlewares/auth");

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "mysecret";
const TOKEN_EXPIRY = process.env.JWT_EXPIRY || "2d"; // <-- .env ka value use hoga
const { getIo, getConnectedUsers } = require("../utils/socketStore");


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

      const creditAmount = Number(balanceStr || 0);
      const creditReferenceNum = Number(creditReference || 0);
      const maxBalanceNum = Number(maxBalance || 0);
      const incomingMyShare = Number(myShareBody || 0);

      // ✅ Master password check
      const ok = await bcrypt.compare(masterPassword || "", req.dbUser.password);
      if (!ok) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ error: "Invalid master password" });
      }

      // ✅ Role hierarchy validation
      const creatorRole = req.dbUser.role;
      if (creatorRole === "owner" && !["admin", "master", "user"].includes(role))
        return res.status(403).json({ error: "Owner can only create admin/master/user" });
      if (creatorRole === "admin" && !["master", "user"].includes(role))
        return res.status(403).json({ error: "Admin can only create master/user" });
      if (creatorRole === "master" && role !== "user")
        return res.status(403).json({ error: "Master can only create users" });

      // ✅ Username validation
      const cleanUsername = username.trim().toLowerCase();
      const existingUser = await User.findOne({
        username: { $regex: new RegExp(`^${cleanUsername}$`, "i") },
      }).session(session);
      if (existingUser) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: "Username already taken" });
      }

      // ✅ Share validation
      let creatorShare = Number(req.dbUser.my_share || 0);
      if (req.dbUser.role === "owner" && !creatorShare) creatorShare = 100;

      let finalMyShare = incomingMyShare;
      if (role !== "user") {
        if (finalMyShare < 0) finalMyShare = 0;
        if (finalMyShare > creatorShare)
          return res.status(400).json({
            error: `My share cannot exceed your share (${creatorShare}%)`,
          });
      }

      const finalParentShare = role !== "user" ? creatorShare - finalMyShare : 0;

      // ✅ Credit Reference and Balance must be equal
      if (Number(creditReference) !== Number(balanceStr)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          error: "Credit Reference and Balance must be equal",
        });
      }

      // ✅ Check balance in upline
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
        return res.status(400).json({
          error: "Insufficient balance to allocate this amount",
        });
      }

      // ✅ Deduct from upline balance
      freshCreator.balance = creatorBalance - creditAmount;

      // ✅ Increase upline’s player_balance
      freshCreator.player_balance = Number(freshCreator.player_balance || 0) + creditAmount;
      await freshCreator.save({ session });

      // ✅ Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // ✅ Create new user
      const newUserData = {
        username: cleanUsername,
        password: hashedPassword,
        role: role || "user",
        domain: domain || req.dbUser.domain,
        uplineId: uplineId || req.dbUser._id,
        exposureLimit: typeof exposureLimit !== "undefined" ? Number(exposureLimit) : -1,
        credit_reference: creditReferenceNum,
        maxBalance: maxBalanceNum,
        my_share: role !== "user" ? finalMyShare : 0,
        parent_share: role !== "user" ? finalParentShare : 0,
        balance: creditAmount, // new user gets the given balance
        player_balance: 0,
      };

      const [createdUser] = await User.create([newUserData], { session });

      await session.commitTransaction();
      session.endSession();

      const userObj = createdUser.toObject();
      delete userObj.password;

      return res.json({
        success: true,
        message: `User ${userObj.username} created successfully with ${creditAmount} balance`,
        user: userObj,
      });
    } catch (err) {
      console.error("❌ Error creating user (register):", err);
      try {
        await session.abortTransaction();
      } catch (e) {
        console.error(e);
      }
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


router.get('/downline/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const downlineUsers = await User.find({ uplineId: userId }).select(
      '_id username role balance player_balance credit_reference p_l exposure my_share parent_share isLocked'
    );
    res.json(downlineUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
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

// ✅ Send JWT as cookie for auto-login
res.cookie("token", token, {
  httpOnly: true,     // JS से access नहीं होगा
  secure: true,       // HTTPS required
  sameSite: "none",   // cross-site navigation support
  maxAge: 24*60*60*1000 // 1 दिन
});
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

router.post(
  "/transaction",
  auth,
  requireRoles(["owner", "admin", "master"]),
  async (req, res) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const { targetUserId, amount, type } = req.body;
      const transactionAmount = Number(amount || 0);

      // Validation
      if (!["deposit", "withdraw"].includes(type)) {
        return res.status(400).json({ error: "Invalid transaction type" });
      }
      if (transactionAmount <= 0) {
        return res.status(400).json({ error: "Amount must be greater than 0" });
      }

      // Acting user (requester)
      const actingUser = await User.findById(req.dbUser._id).session(session);
      // Client
      const client = await User.findById(targetUserId).session(session);

      if (!client) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: "Target user not found" });
      }

      // Hierarchy validation
      const isChild = async (parentId, childId) => {
        const child = await User.findById(childId).session(session);
        if (!child) return false;
        if (child.uplineId && child.uplineId.equals(parentId)) return true;
        if (child.uplineId) return isChild(parentId, child.uplineId);
        return false;
      };

      const allowed =
        actingUser.role === "owner" || (await isChild(actingUser._id, client._id));
      if (!allowed) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ error: "You cannot update this user's balance" });
      }

      // ---------- Determine sourceUser (client's direct upline) ----------
      if (!client.uplineId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: "Client has no upline for transaction" });
      }

      const sourceUser = await User.findById(client.uplineId).session(session);
      if (!sourceUser) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: "Upline user not found" });
      }

      // Helper to recalc credit_reference
      const recalcCredit = (user) => {
        if (["owner", "admin", "master"].includes(user.role)) {
          user.credit_reference = (user.balance || 0) + (user.player_balance || 0);
        } else {
          user.credit_reference = user.balance || 0;
        }
      };

      // ---------------------- DEPOSIT ----------------------
      if (type === "deposit") {
        if (sourceUser.balance < transactionAmount) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ error: "Insufficient balance in upline" });
        }

        // Deduct from upline
        sourceUser.balance -= transactionAmount;
        sourceUser.player_balance += transactionAmount;
        recalcCredit(sourceUser);
        await sourceUser.save({ session });

        // Add to client
        client.balance += transactionAmount;
        recalcCredit(client);
        await client.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.json({
          success: true,
          message: `Deposited ${transactionAmount} to ${client.username}`,
          upline: {
            id: sourceUser._id,
            username: sourceUser.username,
            balance: sourceUser.balance,
            player_balance: sourceUser.player_balance,
            credit_reference: sourceUser.credit_reference,
          },
          client: {
            id: client._id,
            username: client.username,
            balance: client.balance,
            credit_reference: client.credit_reference,
          },
        });
      }

      // ---------------------- WITHDRAW ----------------------
      if (type === "withdraw") {
        if (client.balance < transactionAmount) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ error: "Insufficient balance in client" });
        }

        // Deduct from client
        client.balance -= transactionAmount;
        recalcCredit(client);
        await client.save({ session });

        // Add to upline
        sourceUser.balance += transactionAmount;
        sourceUser.player_balance -= transactionAmount;
        if (sourceUser.player_balance < 0) sourceUser.player_balance = 0;
        recalcCredit(sourceUser);
        await sourceUser.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.json({
          success: true,
          message: `Withdrew ${transactionAmount} from ${client.username}`,
          upline: {
            id: sourceUser._id,
            username: sourceUser.username,
            balance: sourceUser.balance,
            player_balance: sourceUser.player_balance,
            credit_reference: sourceUser.credit_reference,
          },
          client: {
            id: client._id,
            username: client.username,
            balance: client.balance,
            credit_reference: client.credit_reference,
          },
        });
      }
    } catch (err) {
      console.error("Transaction error:", err);
      try { await session.abortTransaction(); } catch (e) { console.error(e); }
      session.endSession();
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ---------------- Get logged-in admin details ----------------
router.get("/details", auth, requireRoles(["owner", "admin", "master"]), async (req, res) => {
  try {
    const admin = req.dbUser; // set by auth middleware
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    // Only send relevant fields
    res.json({
      success: true,
      data: {
        _id: admin._id,
        username: admin.username,
        role: admin.role,
        balance: admin.balance || 0,
        credit_reference: admin.credit_reference || 0,
        p_l: admin.p_l || 0,
        exposure: admin.exposure || 0,
        my_share: admin.my_share || 0,
        parent_share: admin.parent_share || 0,
        domain: admin.domain,
      },
    });
  } catch (err) {
    console.error("Error fetching admin details:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ---------------- Update password of a downline user ----------------
router.put(
  "/update-password/:id",
  auth,
  requireRoles(["owner", "admin", "master"]),
  async (req, res) => {
    try {
      const { password } = req.body;
      const targetUser = await User.findById(req.params.id);
      if (!targetUser) return res.status(404).json({ error: "User not found" });

      const loggedInUser = req.dbUser;

      // Helper: check if target user is downline
      async function isDownline(parentId, childId) {
        const child = await User.findById(childId);
        if (!child || !child.uplineId) return false;
        if (child.uplineId.equals(parentId)) return true;
        return isDownline(parentId, child.uplineId);
      }

      // Role-based permission check
      if (["owner", "admin", "master"].includes(loggedInUser.role)) {
        if (!(await isDownline(loggedInUser._id, targetUser._id))) {
          return res.status(403).json({ error: "Cannot change password of this user" });
        }
      }

      // Hash the new password
      const hashed = await bcrypt.hash(password, 10);
      targetUser.password = hashed;

      // Invalidate old tokens
      targetUser.tokenVersion = (targetUser.tokenVersion || 0) + 1;
      await targetUser.save();

      // ---------------- Force Logout via Socket.io ----------------
      const io = getIo();
      const connectedUsers = getConnectedUsers(); // Map<userId, Set of socketIds>

      // Ensure value is a Set (multi-device support)
      let userSockets = connectedUsers.get(targetUser._id.toString());
      if (userSockets && !(userSockets instanceof Set)) {
        userSockets = new Set([userSockets]);
      }

      if (userSockets && io) {
        userSockets.forEach((socketId) => {
          io.to(socketId).emit("forceLogout", {
            message: "Password changed. Please login again.",
          });
        });
        // Remove user from connected map
        connectedUsers.delete(targetUser._id.toString());
      }

      return res.json({
        success: true,
        message: "Password updated successfully and user logged out from all devices.",
      });
    } catch (err) {
      console.error("Password update error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  }
);





// ---------------- Ping route for auto logout ----------------
router.get("/ping", auth, (req, res) => {
  res.json({
    status: "ok",
    user: {
      id: req.dbUser._id,
      username: req.dbUser.username,
      role: req.dbUser.role,
      tokenVersion: req.dbUser.tokenVersion, // ✅ add this
    },
  });
});


module.exports = router;
