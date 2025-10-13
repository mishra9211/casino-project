const express = require("express");
const multer = require("multer");
const Game = require("../models/Game");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// CRUD games admin panel game add edit delete all api 
router.get("/", async (req, res) => {
  const games = await Game.find().sort({ createdAt: -1 });
  res.json({ games });
});

router.post("/", upload.single("thumbnail"), async (req, res) => {
  const { name, category, iframeUrl } = req.body;
  const thumbUrl = req.file ? `http://localhost:5001/uploads/${req.file.filename}` : "";
  const path = iframeUrl ? iframeUrl.split("/").pop() : "";
  await Game.create({ name, category, iframeUrl, thumbnailUrl: thumbUrl, path });
  const games = await Game.find().sort({ createdAt: -1 });
  res.json({ games });
});

router.put("/:id", upload.single("thumbnail"), async (req, res) => {
  const { name, category, iframeUrl } = req.body;
  const update = { name, category, iframeUrl, pathUpdated: true };
  if (req.file) update.thumbnailUrl = `http://localhost:5001/uploads/${req.file.filename}`;
  if (iframeUrl) update.path = iframeUrl.split("/").pop();
  const game = await Game.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json({ game });
});

router.delete("/:id", async (req, res) => {
  await Game.findByIdAndDelete(req.params.id);
  const games = await Game.find().sort({ createdAt: -1 });
  res.json({ games });
});

// Add rule
router.post("/:id/rules", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const imagePath = req.file ? `http://localhost:5001/uploads/${req.file.filename}` : null;
  const game = await Game.findById(id);
  game.rules.push({ title, description, image: imagePath });
  await game.save();
  res.json({ game });
});

module.exports = router;
