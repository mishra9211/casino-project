const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true }, // uploaded image ka URL
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Banner", bannerSchema);
