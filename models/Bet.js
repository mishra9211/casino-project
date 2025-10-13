const mongoose = require("mongoose");

const BetSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  game_id: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
  bet_amount: Number,
  user_choice: String,
  result: { type: String, default: "PENDING" },
  status: { type: String, default: "pending" },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Bet", BetSchema);
