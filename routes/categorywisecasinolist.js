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
    let games;

    if (key === "all") {
      // Return all games
      games = await Game.find({});
    } else {
      // Return games filtered by category field
      games = await Game.find({ category: key });
    }

    if (!games || games.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No games found for this category",
      });
    }

    res.status(200).json({
      success: true,
      games,
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
