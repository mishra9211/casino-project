// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: { 
    type: String, 
    enum: ["admin", "master", "user"], 
    default: "user" 
  },
  balance: { type: Number, default: 0 },
  domain: { type: String, default: "" },

  uplineId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // parent user ka id

  // 👇 नया field
  exposureLimit: { type: Number, default: -1 },
});

module.exports = mongoose.model("User", UserSchema);
