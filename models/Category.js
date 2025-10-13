const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  category_id: { type: Number, unique: true }, // auto-generated
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Category", categorySchema);
