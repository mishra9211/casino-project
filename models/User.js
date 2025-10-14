// models/User.js
const mongoose = require("mongoose");

// models/User.js
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["admin", "master", "user"], default: "user" },
  balance: { type: Number, default: 0 },
  domain: { type: String, default: "" },
  uplineId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  exposureLimit: { type: Number, default: -1 },

  // 👇 New field
  timezone: { type: String, default: "Asia/Kolkata" } 
});


module.exports = mongoose.model("User", UserSchema);
