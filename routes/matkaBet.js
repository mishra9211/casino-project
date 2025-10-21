const express = require("express");
const router = express.Router();
const MatkaBet = require("../models/MatkaBet");
const Market = require("../models/Market");
const moment = require("moment"); // npm install moment


// 🔹 Worli Matka Bet Save Route
router.post("/save-worli-matka-bet", async (req, res) => {
  try {
    const betData = req.body;

    // ------------------- MARKET FETCH -------------------
    const market = await Market.findOne({ id: betData.match_id });
    if (!market)
      return res.status(400).json({ success: false, message: "Market नहीं मिला" });

    // ------------------- MARKET SUSPEND CHECK -------------------
    if (market.suspend)
      return res.status(400).json({ success: false, message: "Market Suspend है, Bet नहीं लग सकती" });

    const marketType = betData.market?.toUpperCase().trim(); // "OPEN" / "CLOSE" / "JODI"

    // ------------------- BUILD TODAY'S OPEN & CLOSE TIMES -------------------
    const todayDate = moment().format("YYYY-MM-DD"); // system date

    const [openHour, openMin] = market.open_bids.split(":").map(Number);
    const [closeHour, closeMin] = market.close_bids.split(":").map(Number);

    let openTime = moment(`${todayDate} ${openHour}:${openMin}`, "YYYY-MM-DD HH:mm");
    let closeTime = moment(`${todayDate} ${closeHour}:${closeMin}`, "YYYY-MM-DD HH:mm");

    // अगर closeTime openTime से पहले (रात का market)
    if (closeTime.isBefore(openTime)) closeTime.add(1, "day");

    const now = moment(); // system time

    // ✅ Debug logs डालो यहाँ
console.log("Now:", now.format());
console.log("Open Time:", openTime.format());
console.log("Close Time:", closeTime.format());
console.log("Market Type:", marketType);

    // ------------------- TIME CHECK BASED ON MARKET TYPE -------------------
    if (marketType === "OPEN") {
      if (market.open_suspend)
        return res.status(400).json({ success: false, message: "Open Market suspend है" });

      if (now.isAfter(openTime))
        return res.status(400).json({ success: false, message: "Open Time खत्म हो चुका है, Bet नहीं लग सकती" });
    }

    if (marketType === "CLOSE") {
      if (market.close_suspend)
        return res.status(400).json({ success: false, message: "Close Market suspend है" });

      if (now.isAfter(closeTime))
        return res.status(400).json({ success: false, message: "Close Time खत्म हो चुका है, Bet नहीं लग सकती" });
    }

    if (marketType === "JODI") {
      if (market.close_suspend)
        return res.status(400).json({ success: false, message: "Close Market suspend है, Jodi Bet नहीं लग सकती" });

      if (now.isAfter(closeTime))
        return res.status(400).json({ success: false, message: "Jodi Time खत्म हो चुका है, Bet नहीं लग सकती" });
    }

    // ------------------- match_type PARSE -------------------
    let matchTypes = market.match_type;
    if (typeof matchTypes === "string") {
      try {
        matchTypes = JSON.parse(matchTypes);
        if (typeof matchTypes === "string") matchTypes = JSON.parse(matchTypes);
      } catch (e) {
        console.error("match_type parsing failed:", e);
        matchTypes = {};
      }
    }

    // ------------------- KEYS NORMALIZE -------------------
    const normalizedMatchTypes = {};
    for (let key in matchTypes) {
      normalizedMatchTypes[key.toLowerCase()] = matchTypes[key];
    }

    // ------------------- BET TYPE VALIDATION -------------------
    const betType = betData.bet_type.toLowerCase().trim();
    const betTypeInfo = normalizedMatchTypes[betType];
    if (!betTypeInfo)
      return res.status(400).json({ success: false, message: "इस मार्केट के लिए Invalid Bet Type" });

    // ------------------- STAKE VALIDATION -------------------
    const stake = Number(betData.stake);
    if (stake < betTypeInfo.minStake)
      return res.status(400).json({ success: false, message: `Stake minimum ${betTypeInfo.minStake} से कम है` });

    if (stake > betTypeInfo.maxStake)
      return res.status(400).json({ success: false, message: `Stake maximum ${betTypeInfo.maxStake} से ज्यादा है` });

    // ------------------- MULTIPLE DIGITS PROCESS -------------------
    const betsToSave = betData.digits.map((d) => ({
      ...betData,
      digit: d.digit,
      active: d.active,
      pl: stake * betTypeInfo.rate,
      profit: stake * betTypeInfo.rate,
      loss: stake,
      liability: -stake,
      odds: d.digit,
    }));

    // ------------------- SAVE ALL BETS -------------------
    const savedBets = await MatkaBet.insertMany(betsToSave);

    res.status(200).json({
      success: true,
      message: "Bets सफलतापूर्वक place हो गईं!",
      bets: savedBets.map((b) => ({
        selection: betData.bet_type,
        market: betData.market,
        digit: b.digit,
        stake: b.stake,
        rate: b.odds,
        p_l: b.pl,
        profit: b.profit,
        loss: b.loss,
      })),
    });
  } catch (err) {
    console.error("Bet place failed:", err);
    res.status(500).json({ success: false, message: "Bet place करना failed हुआ" });
  }
});





// 🔹 GET Bets by match id
router.get("/get-matka-single-bets/:matchId", async (req, res) => {
  try {
    const matchId = Number(req.params.matchId);
    const bets = await MatkaBet.find({ match_id: matchId }).sort({ created_at: -1 });

    const formattedBets = [];

    for (const bet of bets) {
      // 1️⃣ Fetch market
      const market = await Market.findOne({ id: bet.match_id });
      if (!market) continue;

      // 2️⃣ Parse match_type
      let matchTypes = market.match_type;
      if (typeof matchTypes === "string") {
        try {
          matchTypes = JSON.parse(matchTypes);
          if (typeof matchTypes === "string") matchTypes = JSON.parse(matchTypes);
        } catch (e) {
          matchTypes = {};
        }
      }

      // 3️⃣ Normalize keys
      const normalizedMatchTypes = {};
      for (let key in matchTypes) normalizedMatchTypes[key.toLowerCase()] = matchTypes[key];

      const betTypeKey = bet.bet_type.trim().toLowerCase();
      const betTypeInfo = normalizedMatchTypes[betTypeKey];

      // 4️⃣ Map digits with market rate
     

      formattedBets.push({
        bet_status: bet.bet_status || null,
        bet_timestamp_date: Math.floor(new Date(bet.created_at).getTime() / 1000),
        commission: bet.commission || 0,
        created_at: bet.created_at,
        id: bet._id.toString(),
        ip: bet.ip || "",
        liability: bet.liability,
        loss: bet.loss,
        odds: bet.odds, // saved odds
        matka_name: bet.matka_name,
        p_l: bet.pl,
        profit: bet.profit,
        reason: bet.reason || "",
        selection: bet.bet_type,
        stake: bet.stake,
        type: bet.market,
        user_id: bet.user_id,
        worli_matka_id: bet.market_id,
        worli_timestamp_date: bet.worli_timestamp_date || null,
        worli_type: bet.worli_type || null,
        rate: betTypeInfo ? betTypeInfo.rate : 0 // ✅ market model rate
      });
    }

    res.status(200).json({ bets: formattedBets });

  } catch (err) {
    console.error("Failed to fetch bets:", err);
    res.status(500).json({ success: false, message: "Bets fetch करना failed हुआ" });
  }
});

module.exports = router;
