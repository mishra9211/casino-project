const express = require("express");
const router = express.Router();
const Game = require("../models/Game");

/**
 * @route   GET /api/categorywise/:key
 * @desc    Get games by category or all games
 * @access  Public
 */
router.get("/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const page = parseInt(req.query.page) || 1;   // optional pagination
    const limit = parseInt(req.query.limit) || 20;

    let query = {};
    if (key !== "all") {
      query.category = key;
    }

    const games = await Game.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // <-- much faster

    if (!games || games.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No games found for this category",
      });
    }

    res.status(200).json({
      success: true,
      games,
      page,
      limit,
      total: await Game.countDocuments(query), // optional: total count
    });
  } catch (err) {
    console.error("Error fetching category-wise games:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


module.exports = router;
