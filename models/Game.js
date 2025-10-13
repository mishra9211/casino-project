// models/Game.js
const mongoose = require("mongoose");

const RuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String }
});

const GameSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    iframeUrl: { type: String },
    thumbnailUrl: { type: String },
    path: { type: String },
    pathUpdated: { type: Boolean, default: false },
    rules: [RuleSchema]   // ✅ add rules array
  },
  { timestamps: true }
);

module.exports = mongoose.model("Game", GameSchema);
