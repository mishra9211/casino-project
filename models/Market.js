const mongoose = require("mongoose");

// 🎯 Inner schema for open/close markets
const marketInnerSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true }, // unique open/close id
    match_id: { type: Number, required: true }, // parent market id
    match_type: { type: String, enum: ["open", "close"], required: true },
    match_time: { type: Date },
    is_suspend: { type: Boolean, default: false },
    is_close: { type: Boolean, default: false },
    is_declared: { type: Boolean, default: false },
    is_rollback: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { _id: false }
);

// 🎯 Main Market Schema
const marketSchema = new mongoose.Schema({
  id: { type: Number, required: true },                // main market id
  category_id: { type: Number, required: true },        // category id (number)
  category_name: { type: String, required: true },      // category name

  match_title: { type: String, required: true },
  slug: { type: String },                               // slug for URL or ref

  open_bids: { type: String },
  close_bids: { type: String },

  openDate: { type: Date },
  closeDate: { type: Date },

  match_type: { type: Object, default: {} },            // game type info
  markets: { type: [marketInnerSchema], default: [] },  // open/close data

  // 🔻 Removed open_id & close_id (now handled inside markets[])
  // open_id: { type: Number },
  // close_id: { type: Number },

  is_active: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false },
  open_suspend: { type: Boolean, default: false },
  close_suspend: { type: Boolean, default: false },
  suspend: { type: Boolean, default: false },

  todayResults: {
    open: { type: Number, default: null },
    close: { type: Number, default: null },
  },
  yesterdayResults: {
    open: { type: Number, default: null },
    close: { type: Number, default: null },
  },

  message: { type: String, default: "" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// ✅ Auto update `updated_at`
marketSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model("Market", marketSchema);
