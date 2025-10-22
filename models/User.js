const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["owner", "admin", "master", "user"], default: "user" },

  // Financial / commission fields
  balance: { type: Number, default: 0 },
  player_balance: { type: Number, default: 0 },
  credl: { type: Number, default: 0 },
  book_com_pr: { type: Number, default: 0 },
  book_com_type: { type: Number, default: 2 },
  pr_client: { type: Number, default: null },
  worli_com_pr: { type: Number, default: 0 },
  p_l: { type: Number, default: 0 },
  exposure: { type: Number, default: 0 },

  // Common fields
  domain: { type: String, default: "" },
  uplineId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  exposureLimit: { type: Number, default: -1 },
  timezone: { type: String, default: "Asia/Kolkata" }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
