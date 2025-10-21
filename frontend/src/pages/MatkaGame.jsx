import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import "./MatkaGameStyle.css";
import DigitSelection from "./DigitSelection.jsx";

const MatkaGame = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // ------------------- STATE -------------------
  const [market, setMarket] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [stake, setStake] = useState("");
  const [selectedDigits, setSelectedDigits] = useState([]);
  const [activeTab, setActiveTab] = useState("market");
  const [betTypes, setBetTypes] = useState([]);
  const [selectedBet, setSelectedBet] = useState("");
  const [marketOption, setMarketOption] = useState("OPEN");
  const [bookRefreshKey, setBookRefreshKey] = useState(0);
  const [betsData, setBetsData] = useState([]);


  // ------------------- BETS BOOK -------------------
  const [betsBook, setBetsBook] = useState({});
  const [betsCount, setBetsCount] = useState(0);

  // Full bets cache (marketId => all bets array)
  const allBetsCacheRef = useRef({});
  // Filtered book cache (marketId|betType|marketType => {book, count})
  const filteredBetsCacheRef = useRef({});

  // ------------------- ERROR -------------------
  const [errorMsg, setErrorMsg] = useState("");

  // ------------------- UTILS -------------------
  const formatStake = (value) => {
    if (!value) return 0;
    if (value >= 1000) return value / 1000 + "k";
    return value;
  };

  const formatBidTime = (bidTime, isoDate) => {
    if (!bidTime || !isoDate) return "N/A";
    const [hours, minutes] = bidTime.split(":").map(Number);
    const date = new Date(isoDate);
    date.setHours(hours);
    date.setMinutes(minutes);
    return date
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
      .toUpperCase();
  };

  const getCurrentUser = () => {
    const token = localStorage.getItem("user_token");
    const username = localStorage.getItem("user_username");
    const id = localStorage.getItem("user_id");
    if (token && username && id) return { token, username, id };
    return null;
  };
  const currentUser = getCurrentUser();

  // ------------------- FETCH MARKET -------------------
  useEffect(() => {
    const parseMatchType = (match_type) => {
      try {
        let parsed = match_type;
        if (typeof parsed === "string") parsed = JSON.parse(parsed);
        if (typeof parsed === "string") parsed = JSON.parse(parsed);
        return Object.entries(parsed);
      } catch {
        return [];
      }
    };

    const fetchMarket = async () => {
      try {
        let data = market;
        if (!data) {
          const res = await axiosInstance.get(`/market/public/detail/${id}`);
          data = res.data.data;
        }
        if (!data) throw new Error("Market not found");

        const { match_type, ...rest } = data;
        setMarket(rest);

        const typesArray = parseMatchType(match_type);
        setBetTypes(typesArray);
        if (typesArray.length) setSelectedBet(typesArray[0][0]);
      } catch (err) {
        console.error("Failed to fetch market details ❌", err);
        setErrorMsg("Failed to fetch market details ❌");
      } finally {
        setLoading(false);
      }
    };

    if (!market) fetchMarket();
  }, [id, market]);

  // ------------------- AUTO SELECT JODI -------------------
  useEffect(() => {
    const bet = selectedBet.toLowerCase();
    if (bet === "jodi") setMarketOption("JODI");
    else setMarketOption((prev) => (prev === "JODI" ? "OPEN" : prev));
  }, [selectedBet]);

  // ------------------- ERROR TOAST AUTO-HIDE -------------------
  useEffect(() => {
    if (!errorMsg) return;
    const timer = setTimeout(() => setErrorMsg(""), 3000);
    return () => clearTimeout(timer);
  }, [errorMsg]);

  // ------------------- FETCH BETS BOOK (CACHING) -------------------
 useEffect(() => {
  if (!market?.id || !selectedBet) return;
  const key = `${market.id}|${selectedBet}|${marketOption}`;

  // ✅ Step 1: Cached filtered book check
  if (filteredBetsCacheRef.current[key]) {
    setBetsBook(filteredBetsCacheRef.current[key].book);
    const allBets = allBetsCacheRef.current[market.id] || [];
    setBetsCount(allBets.length);
    console.log("🟢 Loaded filtered book from cache:", key);
    return;
  }

  const fetchBets = async () => {
    try {
      // ✅ Step 2: Full bets cache check
      let allBets = allBetsCacheRef.current[market.id];
      if (!allBets) {
        console.log("🔵 Fetching full bets from API:", market.id);
        const res = await axiosInstance.get(`/get-matka-single-bets/${market.id}`);
        allBets = res.data?.bets || [];
        setBetsData(allBets);
        allBetsCacheRef.current[market.id] = allBets;
      } else {
        console.log("🟢 Loaded full bets from cache:", market.id);
      }

      setBetsCount(allBets.length);

      // ✅ Step 3: Filter logic (Improved)
      const betName = selectedBet.toLowerCase();
      const marketType = marketOption.toLowerCase();

      const filteredBets = allBets.filter((bet) => {
        if (!bet.selection || !bet.type) return false;

        const type = bet.type.toLowerCase();
        const sel = bet.selection.toLowerCase();

        if (type !== marketType) return false;

        if (betName === "single" && (sel.length === 1 || sel === "single")) return true;
        if (betName === "single patti" && (sel.length === 3 || sel === "single patti")) return true;
        if (betName === "double patti" && (sel.length === 3 || sel === "double patti")) return true;
        if (betName === "triple patti" && (sel.length === 3 || sel === "triple patti")) return true;
        if (betName === "jodi" && (sel.length === 2 || sel === "jodi")) return true;

        return sel === betName;
      });

      // ✅ Step 4: Digits list logic
      let digitsList = [];
      const betLower = selectedBet.toLowerCase();
      if (betLower === "single") digitsList = Array.from({ length: 10 }, (_, i) => i.toString());
      else if (betLower === "jodi") digitsList = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, "0"));
      else if (betLower === "single patti") digitsList = Array.from({ length: 1000 }, (_, i) => i.toString().padStart(3, "0"));
      else if (betLower === "double patti") digitsList = Array.from({ length: 1000 }, (_, i) => i.toString().padStart(3, "0"));
      else if (betLower === "triple patti") digitsList = Array.from({ length: 1000 }, (_, i) => i.toString().padStart(3, "0"));

      // ✅ Step 5: Book calculation (आपका पुराना logic)
      const book = {};
      digitsList.forEach((d) => (book[d] = 0));

      filteredBets.forEach((bet) => {
        const winDigit = bet.odds?.toString();
        const stake = Number(bet.stake) || 0;
        const liability = Number(bet.liability) || 0;
        const p_l = Number(bet.profit) || 0;
        const profit = p_l + liability;

        digitsList.forEach((d) => (book[d] -= stake));

        if (book[winDigit] !== undefined) book[winDigit] += profit + stake;
      });

      setBetsBook(book);
      filteredBetsCacheRef.current[key] = { book, count: filteredBets.length };
      console.log("💾 Cached filtered:", key);
    } catch (err) {
      console.error("❌ Bets fetch failed", err);
    }
  };

  fetchBets();
}, [market?.id, selectedBet, marketOption, bookRefreshKey]);




  // ------------------- BET API -------------------
  const submitBet = async () => {
  if (!stake || selectedDigits.length === 0) {
    setErrorMsg("Please enter stake and select digits!");
    return;
  }

  let selectedMarket = null;
  if (marketOption === "JODI") {
    selectedMarket = { id: market.jodiMarketId || market.id, match_id: market.id };
  } else {
    selectedMarket = market.markets.find((m) => {
      const type = m.match_type?.toLowerCase();
      if (marketOption === "OPEN") return type === "open";
      if (marketOption === "CLOSE") return type === "close";
    });
  }

  if (!selectedMarket) {
    setErrorMsg(`Selected ${marketOption} market not found!`);
    return;
  }

  const digitsPayload = selectedDigits.map((digit) => ({
    digit,
    active: true,
    pl: -Number(stake),
  }));

  const payload = {
    date: new Date().toISOString().split("T")[0],
    market: marketOption === "JODI" ? "JODI" : marketOption,
    bet_type: marketOption === "JODI" ? "jodi" : selectedBet.toLowerCase(),
    digits: digitsPayload,
    stake: Number(stake),
    market_id: selectedMarket.id,
    match_id: selectedMarket.match_id,
    user_id: currentUser?.id,
    matka_name: market.match_title,
  };

  try {
    const res = await axiosInstance.post("/save-worli-matka-bet", payload);

    if (res.data.success) {
      alert(res.data.success);
      setSelectedDigits([]);
      setStake("");

      // ✅ Clear cache and trigger automatic refresh
      allBetsCacheRef.current[market.id] = null;
      filteredBetsCacheRef.current = {};
      setBookRefreshKey(Date.now());
    } else {
      setErrorMsg(res.data.message || "Failed to place bet");
    }
  } catch (err) {
    console.error(err);
    setErrorMsg(err.response?.data?.message || "Error submitting bet");
  }
};



  const clearAll = () => setSelectedDigits([]);

  if (loading) return <p>Loading market details...</p>;
  if (!market) return <p>Market not found ❌</p>;

  const currentBet = betTypes.find(([key]) => key === selectedBet)?.[1] || {};

  return (
    <div className="matka-game-container">
      {successMsg && <div className="success-toast">{successMsg}</div>}
      {errorMsg && <div className="error-toast">{errorMsg}</div>}

      <div className="matka-top-header">
        <button className="matka-back-btn" onClick={() => navigate("/matka")}>← Back to Markets</button>
      </div>

      <div className="matka-market-title">{market.match_title}</div>

      <div className="matka-tab-bar">
        <div className={`matka-tab ${activeTab === "market" ? "active" : ""}`} onClick={() => setActiveTab("market")}>MARKET</div>
        <div className={`matka-tab ${activeTab === "bets" ? "active" : ""}`} onClick={() => setActiveTab("bets")}>BETS ({betsCount})</div>
      </div>

      <div className="matka-news-bar">
        <marquee behavior="scroll" direction="left">{market.message || "Loading news..."}</marquee>
      </div>

      {activeTab === "market" && (
        <>
          <div className="matka-game-info">
            <div className="info-box">
              <label>DATE</label>
              <input type="text" value={new Date().toLocaleDateString("en-GB")} readOnly disabled className="non-clickable" />
            </div>
            <div className="info-box">
              <label>MARKET</label>
              <select value={marketOption} onChange={(e) => setMarketOption(e.target.value)}>
                <option value="OPEN" disabled={selectedBet.toLowerCase() === "jodi"}>OPEN ({formatBidTime(market.open_bids, market.openDate)})</option>
                <option value="CLOSE" disabled={selectedBet.toLowerCase() === "jodi"}>CLOSE ({formatBidTime(market.close_bids, market.closeDate)})</option>
                <option value="JODI" disabled={selectedBet.toLowerCase() !== "jodi"}>JODI {currentBet.jodiTime || ""}</option>
              </select>
            </div>
            <div className="info-box">
              <label>BET TYPE</label>
              <select value={selectedBet} onChange={(e) => setSelectedBet(e.target.value)}>
                {betTypes.map(([type]) => (<option key={type} value={type}>{type.toUpperCase()}</option>))}
              </select>
            </div>
            <div className="info-box">
              <label>RATE</label>
              <input type="text" value={currentBet.rate || 0} readOnly disabled className="non-clickable" />
            </div>
          </div>

          <DigitSelection
            selectedDigits={selectedDigits}
            setSelectedDigits={setSelectedDigits}
            betType={selectedBet}
            marketId={market.id}
            refreshKey={bookRefreshKey}
            marketType={marketOption}
            betsBook={betsBook}
            betsData={betsData}
          />

          <div className="matka-selected-section">
            <div className="selected-header">
              <h4>SELECTED DIGITS:</h4>
              <button className="clear-all-btn" onClick={clearAll}>Clear All</button>
            </div>
            <hr />
            <div className="selected-digits">
              {selectedDigits.map((d) => <div key={d} className="digit-box">{d}</div>)}
            </div>

            <div className="stake-section">
              <label>Stake ({formatStake(currentBet.minStake)} – {formatStake(currentBet.maxStake)})</label>
              <div className="stake-row">
                <input type="number" placeholder="Fill Value" value={stake} onChange={(e) => setStake(e.target.value)} />
                <button className="submit-btn" onClick={submitBet}>SUBMIT BET</button>
              </div>
            </div>
          </div>
        </>
      )}

  {activeTab === "bets" && (
  <div className="bets-section">
    {betsData.length === 0 ? (
      <div className="no-records-container">
        <div className="no-records-content">
          <div className="no-records-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                fill="#00a0a8"
                d="M12 2L1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2v-4h2v4z"
              />
            </svg>
          </div>
          <p className="no-records-text">No Records Found!</p>
        </div>
      </div>
    ) : (
      <div className="bets-container">
        <div className="bets-grid">
          {betsData.map((bet, index) => (
            <div
              key={index}
              className={`bet-card ${bet.expanded ? "expanded" : ""}`}
            >
              {/* --- Collapsed Summary --- */}
              <div
                className="bet-summary"
                onClick={() =>
                  setBetsData((prev) =>
                    prev.map((b, i) =>
                      i === index ? { ...b, expanded: !b.expanded } : b
                    )
                  )
                }
              >
                <div>
                  <strong>
                    {index + 1}. {bet.matka_name?.toUpperCase() || "DESAWAR"}
                  </strong>
                  <p>
                    Placing Time :{" "}
                    {new Date(bet.created_at).toLocaleString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
                <div className="expand-icon">
                  <span>{bet.expanded ? "−" : "+"}</span>
                </div>
              </div>

              {/* --- Expanded Details --- */}
              {bet.expanded && (
                <div className="bet-details">
                  <div className="bet-info-row">
                    <p>
                      <strong>Type</strong> : {bet.type?.toUpperCase()}
                    </p>
                    <p>
                      <strong>Selection</strong> : {bet.selection?.toUpperCase()}
                    </p>
                  </div>

                  <table className="bet-table">
                    <thead>
                      <tr>
                        <th>Digit</th>
                        <th>Stake</th>
                        <th>P&amp;L</th>
                        <th>Rate</th>
                        <th>Liability</th>
                        <th>Commission</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{bet.odds}</td>
                        <td>{bet.stake}</td>
                        <td>{bet.profit}</td>
                        <td>{bet.rate}</td>
                        <td>{bet.liability}</td>
                        <td>{bet.commission || 0}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}




    </div>
  );
};

export default MatkaGame;
