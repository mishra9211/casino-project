const express = require("express");
const multer = require("multer");
const Banner = require("../models/Banner");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

router.get("/", async (req, res) => {
  const banners = await Banner.find().sort({ createdAt: -1 });
  res.json({ banners });
});

router.post("/", upload.single("banner"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const url = `http://localhost:5001/uploads/${req.file.filename}`;
  await Banner.create({ imageUrl: url });
  const banners = await Banner.find().sort({ createdAt: -1 });
  res.json({ banners });
});

router.delete("/:id", async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  const banners = await Banner.find().sort({ createdAt: -1 });
  res.json({ banners });
});

module.exports = router;
