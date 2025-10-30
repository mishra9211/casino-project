const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true },
    password: String,
    role: {
      type: String,
      enum: ["owner", "admin", "master", "user"],
      default: "user",
    },

    // 💰 Financial / commission fields
    balance: { type: Number, default: 0 },
    player_balance: { type: Number, default: 0 },
    credit_reference: { type: Number, default: 0 },
    my_share: { type: Number, default: 0 },
    parent_share: { type: Number, default: 0 },
    maxBalance: { type: Number, default: 0 },
    p_l: { type: Number, default: 0 },
    exposure: { type: Number, default: 0 },

    // 🌐 Common fields
    domain: { type: String, default: "" },
    uplineId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    exposureLimit: { type: Number, default: -1 },
    timezone: { type: String, default: "Asia/Kolkata" },

    // 🔐 Token version for password-change-based logout
    tokenVersion: { type: Number, default: 0 }, // ✅ Add this
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
