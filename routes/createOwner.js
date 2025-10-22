const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require('../models/User'); // ensure correct path

// ---------------- MongoDB URI ----------------
const MONGO_URI = "mongodb+srv://1sportspanel:CLpqYVILeuI8rKKv@cluster0.zkam4uu.mongodb.net/director_panel?retryWrites=true&w=majority&appName=Cluster0";

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
      player_balance: 0,
      credit_reference: 1000000, // updated field
      my_share: 100,               // updated field
      parent_share: 0,           // updated field
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
