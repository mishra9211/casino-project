require("dotenv").config(); // .env se MONGO_URI load karne ke liye
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require('../models/User');

// ✅ MongoDB URI from your .env
const MONGO_URI = process.env.MONGO_URI;

// ---------------- Connect MongoDB ----------------
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  });

// ---------------- Owner account data ----------------
async function createOwner() {
  try {
    const existing = await User.findOne({ username: "owner01" });
    if (existing) {
      console.log("⚠ Owner already exists:", existing._id);
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Owner@123", 10); // change password as needed

    const owner = await User.create({
      username: "owner01",
      password: hashedPassword,
      role: "owner",
      balance: 1000000,
      player_balance: 97714.29,
      credl: 1000000,
      pr_client: 90,
      worli_com_pr: 10,
      p_l: 0,
      exposure: 0,
      domain: "shoutpe247.com",
      uplineId: null,
      exposureLimit: -1,
      timezone: "Asia/Kolkata"
    });

    console.log("✅ Owner created successfully:", owner);
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to create owner", err);
    process.exit(1);
  }
}

// ---------------- Run ----------------
createOwner();
