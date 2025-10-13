const express = require("express");
const { auth } = require("../middlewares/auth");

const router = express.Router();

function getRandomCard() {
  return Math.floor(Math.random() * 13) + 1;
}

router.get("/start", auth, (req, res) => {
  const card = getRandomCard();
  res.json({ card });
});

router.post("/guess", auth, (req, res) => {
  const { guess, prevCard } = req.body;
  const nextCard = getRandomCard();
  let result = "lose";
  if ((guess === "higher" && nextCard > prevCard) || (guess === "lower" && nextCard < prevCard)) {
    result = "win";
  }
  res.json({ card: nextCard, result });
});

module.exports = router;
