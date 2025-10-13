const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  id: { type: String, required: true },
  reference_value: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

// Unique index to prevent duplicates
counterSchema.index({ id: 1, reference_value: 1 }, { unique: true });

module.exports = mongoose.model("Counter", counterSchema);
