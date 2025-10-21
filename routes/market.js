const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Market = require("../models/Market");
const Category = require("../models/Category");
const getNextSequence = require("../models/getNextSequence");
const { auth, requireRoles, verifyToken } = require("../middlewares/auth");
const moment = require("moment-timezone");
const User = require("../models/User");

// ============================
// 🔹 ADD MARKET (admin)
// ============================
router.post("/add", auth, requireRoles(["admin", "master"]), async (req, res) => {
  try {
    let {
      category_id,
      match_title,
      match_type,
      slug,
      open_bids,
      close_bids,
    } = req.body;

    const categoryIdNumber = Number(category_id);
    if (!categoryIdNumber)
      return res.status(400).json({ success: false, message: "category_id is required" });

    const category = await Category.findOne({ category_id: categoryIdNumber });
    if (!category)
      return res.status(400).json({ success: false, message: "Category not found" });

    const category_name = category.name;
    if (!slug) slug = match_title.toLowerCase().replace(/\s+/g, "-");

    const today = new Date();
    const [openHour, openMin] = open_bids.split(":").map(Number);
    const [closeHour, closeMin] = close_bids.split(":").map(Number);

    const openDate = new Date(today);
    openDate.setHours(openHour, openMin, 0, 0);
    const closeDate = new Date(today);
    closeDate.setHours(closeHour, closeMin, 0, 0);

    // ✅ Auto Increment IDs
    const marketId = await getNextSequence("market", "marketId");
    const openId = marketId * 100 + 1;
    const closeId = marketId * 100 + 2;

    const newMarket = new Market({
      id: marketId,
      category_id: categoryIdNumber,
      category_name,
      match_title,
      slug,
      match_type: JSON.stringify(match_type),
      openDate,
      closeDate,
      open_bids,
      close_bids,
      markets: [
        { id: openId, match_id: marketId, match_type: "open", match_time: openDate },
        { id: closeId, match_id: marketId, match_type: "close", match_time: closeDate },
      ],
      todayResults: {},
      yesterdayResults: {},
    });

    await newMarket.save();
    res.json({ success: true, message: "SUCCESS", data: newMarket });
  } catch (err) {
    console.error("❌ Market Add Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================
// 🔹 ADMIN LIST MARKETS
// ============================
router.get("/list", auth, requireRoles(["admin", "master"]), async (req, res) => {
  try {
    const { category_id } = req.query;
    const query = category_id ? { category_id } : {};
    const markets = await Market.find(query).sort({ created_at: -1 });
    res.json({ success: true, data: markets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================
// 🔹 UPDATE MARKET
// ============================
router.put("/update/:id", auth, requireRoles(["admin", "master"]), async (req, res) => {
  try {
    const { match_title, category_id, open_bids, close_bids, match_type, is_active } = req.body;
    const slug = match_title.toLowerCase().replace(/ /g, "-");

    const updatedData = {
      match_title,
      slug,
      category_id: category_id ? mongoose.Types.ObjectId(category_id) : undefined,
      open_bids,
      close_bids,
      is_active,
      updated_at: new Date(),
    };

    if (match_type) {
      updatedData.match_type =
        typeof match_type === "string" ? JSON.parse(match_type) : match_type;
    }

    const market = await Market.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!market)
      return res.status(404).json({ success: false, message: "Market not found" });

    res.json({ success: true, message: "Market updated", data: market });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================
// 🔹 DELETE MARKET
// ============================
router.delete("/delete/:id", auth, requireRoles(["admin", "master"]), async (req, res) => {
  try {
    const market = await Market.findByIdAndDelete(req.params.id);
    if (!market)
      return res.status(404).json({ success: false, message: "Market not found" });

    res.json({ success: true, message: "Market deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// ======================================================
// 🔸 1️⃣ PUBLIC API — ALL ACTIVE MARKETS (Match List)
// ======================================================
router.get("/public/list", verifyToken, async (req, res) => {
  try {
    // 1️⃣ Get logged-in user
    const userId = req.user.user_id;
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    // 2️⃣ Determine user timezone
    const userTimezone = user.timezone || "Asia/Kolkata";

    // 3️⃣ Fetch active markets (use lean for faster performance)
    const markets = await Market.find({ is_active: 1, is_deleted: 0 })
      .select(
        "id category_id category_name match_title match_type message openDate closeDate open_bids close_bids open_suspend close_suspend todayResults yesterdayResults slug suspend created_at is_active is_deleted"
      )
      .sort({ id: 1 })
      .lean(); // ✅ lean returns plain JS objects

    const IST = "Asia/Kolkata"; // DB stored timezone

    // 4️⃣ Convert times to user's timezone
    const marketsLocal = markets.map((m) => {
      // Convert bid times
      if (m.open_bids)
        m.open_bids = moment.tz(m.open_bids, "HH:mm", IST).tz(userTimezone).format("HH:mm");
      if (m.close_bids)
        m.close_bids = moment.tz(m.close_bids, "HH:mm", IST).tz(userTimezone).format("HH:mm");

      // Convert open/close dates
      if (m.openDate)
        m.openDate = moment.tz(m.openDate, IST).tz(userTimezone).format("YYYY-MM-DDTHH:mm:ssZ");
      if (m.closeDate)
        m.closeDate = moment.tz(m.closeDate, IST).tz(userTimezone).format("YYYY-MM-DDTHH:mm:ssZ");

      return m;
    });

    res.json({ success: true, message: "SUCCESS", data: marketsLocal });
  } catch (err) {
    console.error("❌ public list error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



// ======================================================
// 🔸 2️⃣ PUBLIC API — SINGLE MATCH DETAIL (Play Now)
// ======================================================
router.get("/public/detail/:marketId", verifyToken, async (req, res) => {
  try {
    const marketId = Number(req.params.marketId);
    if (!marketId)
      return res.status(400).json({ success: false, message: "Invalid marketId" });

    // 1️⃣ Get logged-in user
    const userId = req.user.user_id;
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    const userTimezone = user.timezone || "Asia/Kolkata";
    const IST = "Asia/Kolkata"; // DB stored timezone

    // 2️⃣ Fetch market
    const market = await Market.findOne({ id: marketId, is_deleted: 0 })
      .select("-todayResults -yesterdayResults");

    if (!market)
      return res.status(404).json({ success: false, message: "Market not found" });

    const m = market.toObject();

    // Convert bid times
    if (m.open_bids)
      m.open_bids = moment.tz(m.open_bids, "HH:mm", IST).tz(userTimezone).format("HH:mm");
    if (m.close_bids)
      m.close_bids = moment.tz(m.close_bids, "HH:mm", IST).tz(userTimezone).format("HH:mm");

    // Convert open/close dates
    if (m.openDate)
      m.openDate = moment.tz(m.openDate, IST).tz(userTimezone).format("YYYY-MM-DDTHH:mm:ssZ");
    if (m.closeDate)
      m.closeDate = moment.tz(m.closeDate, IST).tz(userTimezone).format("YYYY-MM-DDTHH:mm:ssZ");

    res.json({ success: true, message: "SUCCESS", data: m });
  } catch (err) {
    console.error("❌ public detail error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



// ============================
// 🔹 UPDATE MARKET MESSAGE
// ============================
router.post(
  "/update-message/:id",
  auth,
  requireRoles(["admin", "master"]),
  async (req, res) => {
    try {
      const marketId = req.params.id;
      const { message } = req.body;

      if (typeof message !== "string")
        return res.status(400).json({ success: false, message: "Message is required" });

      const market = await Market.findByIdAndUpdate(
        marketId,
        { message, updated_at: new Date() },
        { new: true }
      );

      if (!market)
        return res.status(404).json({ success: false, message: "Market not found" });

      res.json({ success: true, message: "Message updated successfully ✅", data: market });
    } catch (err) {
      console.error("❌ Update message error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);


// ============================
// 🔹 TOGGLE MARKET SUSPEND
// type = "open" | "close" | "all"
// ============================
router.post(
  "/toggle-suspend/:id",
  auth,
  requireRoles(["admin", "master"]),
  async (req, res) => {
    try {
      const marketId = req.params.id;
      const { type, status } = req.body; // type: "open"/"close"/"all", status: true/false

      if (!["open", "close", "all"].includes(type))
        return res.status(400).json({ success: false, message: "Invalid suspend type" });

      const updateData = {};
      if (type === "open") updateData.open_suspend = status;
      else if (type === "close") updateData.close_suspend = status;
      else if (type === "all") {
        updateData.open_suspend = status;
        updateData.close_suspend = status;
        updateData.suspend = status; // main suspend flag
      }

      updateData.updated_at = new Date();

      const market = await Market.findByIdAndUpdate(marketId, updateData, { new: true });

      if (!market)
        return res.status(404).json({ success: false, message: "Market not found" });

      res.json({ success: true, message: "Suspend status updated ✅", data: market });
    } catch (err) {
      console.error("❌ Toggle suspend error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);


router.post("/update-status/:id", auth, requireRoles(["admin", "master"]), async (req, res) => {
  try {
    const marketId = req.params.id;
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
      return res.status(400).json({ success: false, message: "is_active must be boolean" });
    }

    const market = await Market.findByIdAndUpdate(
      marketId,
      { is_active, updated_at: new Date() },
      { new: true }
    );

    if (!market) {
      return res.status(404).json({ success: false, message: "Market not found" });
    }

    res.json({ success: true, message: "Market status updated", data: market });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;


module.exports = router;
