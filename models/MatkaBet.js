const mongoose = require("mongoose");

const DigitSchema = new mongoose.Schema({
  digit: { type: String, required: true },
  active: { type: Boolean, default: true },
  pl: { type: Number, required: true },
});

const MatkaBetSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  match_id: { type: Number, required: true },
  market_id: { type: Number, required: true },
  matka_name: { type: String, required: true },
  date: { type: String, required: true },
  market: { type: String, required: true }, // OPEN / CLOSE / JODI
  bet_type: { type: String, required: true }, // single, double, etc.
  stake: { type: Number, required: true },
  digits: [DigitSchema],
  bet_status: { type: Number, default: 1 }, // 1=active, 0=settled
  p_l: { type: Number, default: 0 },
  liability: { type: Number, default: 0 },
  commission: { type: Number, default: 0 },
  reason: { type: Number, default: 0 },
  odds: { type: String, default: "0" },
  profit: { type: Number, default: 0 },
  loss: { type: Number, default: 0 },
  ip: { type: String, default: "" },
  worli_matka_id: { type: Number },
  worli_timestamp_date: { type: Number },
  worli_type: { type: Number },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MatkaBet", MatkaBetSchema);
