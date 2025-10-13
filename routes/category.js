const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const Counter = require("../models/Counter");

// ✅ Middleware: auth + role check
const { auth, requireRoles } = require("../middlewares/auth"); // agar alag file me bana hua hai

// Add market matka market all
router.post("/add", auth, requireRoles(["admin", "master"]), async (req, res) => {
  try {
    const {
      category_id,
      match_title,
      open_bids,
      close_bids,
      match_type,
      is_active = 1,
    } = req.body;

    // ✅ Validation
    if (!category_id || !match_title || !open_bids || !close_bids) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ✅ Generate slug from title
    const slug = match_title.toLowerCase().replace(/ /g, "-");

    // ✅ Check if already exists
    const existing = await Market.findOne({ slug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Market already exists",
      });
    }

    // ✅ Convert match_type from JSON string (if needed)
    let parsedMatchType = {};
    try {
      parsedMatchType =
        typeof match_type === "string" ? JSON.parse(match_type) : match_type;
    } catch (e) {
      parsedMatchType = {};
    }

    // ✅ Create new market
    const market = await Market.create({
      category_id,
      name: match_title, // frontend ka match_title => DB ka name
      slug,
      open_bids,
      close_bids,
      match_type: parsedMatchType,
      is_active,
    });

    res.json({
      success: true,
      message: "Market added successfully ✅",
      data: market,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// List all Categories
router.get("/list", auth, requireRoles(["admin", "master"]), async (req, res) => {
  try {
    const categories = await Category.find().sort({ created_at: -1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Category
router.put("/update/:id", auth, requireRoles(["admin", "master"]), async (req, res) => {
  try {
    const { name, is_active } = req.body;
    const slug = name.toLowerCase().replace(/ /g, "-");

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, slug, is_active, updated_at: new Date() },
      { new: true }
    );

    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    res.json({ success: true, message: "Category updated", data: category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Category
router.delete("/delete/:id", auth, requireRoles(["admin", "master"]), async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
