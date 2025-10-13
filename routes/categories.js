const express = require("express");
const Game = require("../models/Game");

const router = express.Router();

/* GET categories live casino home page */

router.get("/", async (req, res) => {
  const categories = await Game.distinct("category");
  const data = categories.map(cat => ({
    key: cat,
    label: cat.replace(/-/g, " ").toUpperCase(),
    img: `/images/${cat.replace(/ /g, "_")}_arena_icons.webp`
  }));
  res.json({ categories: data });
});

module.exports = router;
