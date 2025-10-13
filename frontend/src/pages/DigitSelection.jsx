import React, { useState, useEffect } from "react";
import "./DigitSelection.css";
import axiosInstance from "../api/axiosInstance";

export default function DigitSelection({
  selectedDigits,
  setSelectedDigits,
  betType,
  marketId,
  refreshKey,
  marketType, // ✅ added
}) {
  const [digits, setDigits] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [betsBook, setBetsBook] = useState({}); // { digit: bookValue }

  // ===========================
  // DIGIT GROUPS
  // ===========================
  const singlePattiDigits = [
    "128","137","146","236","245","290","380","470","489",
    "560","678","579","129","138","147","156","237","246",
    "345","390","480","570","679","589","120","139","148",
    "157","238","247","256","346","490","580","670","689",
    "130","149","158","167","239","248","257","347","356",
    "590","680","789","140","159","168","230","249","258",
    "267","348","357","456","690","780","123","150","169",
    "178","240","259","268","349","358","457","367","790",
    "124","160","179","250","269","278","340","359","368",
    "458","467","890","125","134","170","189","260","279",
    "350","369","378","459","567","468","126","135","180",
    "234","270","289","360","379","450","469","478","568",
    "127","136","145","190","235","280","370","479","460",
    "569","389","578"
  ];

  const doublePattiDigits = [
    "100","119","155","227","335","344","399","588","669",
    "110","200","228","255","336","499","660","688","778",
    "166","229","300","337","355","445","599","779","788",
    "112","220","266","338","400","446","455","699","770",
    "113","122","177","339","366","447","500","799","889",
    "114","277","330","448","466","556","600","880","899",
    "115","133","188","223","377","449","557","566","700",
    "116","224","233","288","440","477","558","800","990",
    "117","144","199","225","388","559","577","667","900",
    "118","226","244","299","334","488","550","668","677"
  ];

  const triplePattiDigits = [
    "000","111","222","333","444","555","666","777","888","999"
  ];

  // ===========================
  // HANDLE DIGIT SET CHANGE
  // ===========================
  useEffect(() => {
    const type = betType.toLowerCase();

    if (type === "single") {
      setDigits(Array.from({ length: 10 }, (_, i) => i.toString()));
    } else if (type === "single patti") {
      setDigits(singlePattiDigits);
    } else if (type === "double patti") {
      setDigits(doublePattiDigits);
    } else if (type === "triple patti") {
      setDigits(triplePattiDigits);
    } else if (type === "jodi") {
      setDigits(Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, "0")));
    }

    setSelectedDigits([]);
    setInputValue("");
  }, [betType]);

  // ===========================
  // FETCH BETS BOOK
  // ===========================
  useEffect(() => {
    const fetchBetsBook = async () => {
      if (!marketId) return;

      try {
        setBetsBook({}); // ✅ clear previous book instantly
        const res = await axiosInstance.get(`/get-matka-single-bets/${marketId}`);

        if (res.data?.bets) {
          const bets = res.data.bets;

          const filteredBets = bets.filter(
            (bet) =>
              bet.selection?.toLowerCase() === betType.toLowerCase() &&
              bet.type?.toLowerCase() === marketType.toLowerCase() // ✅ filter by marketType
          );

          const book = {};
          digits.forEach((d) => (book[d] = 0));

          filteredBets.forEach((bet) => {
            const winDigit = bet.odds?.toString();
            const stake = Number(bet.stake) || 0;
            const liability = Number(bet.liability) || 0;
            const p_l = Number(bet.profit) || 0;
            const profit = p_l + liability;

            digits.forEach((d) => (book[d] -= stake));
            if (book[winDigit] !== undefined) book[winDigit] += profit + stake;
          });

          setBetsBook(book);
        }
      } catch (err) {
        console.error("Failed to fetch bets book", err);
      }
    };

    fetchBetsBook();
  }, [marketId, betType, digits, refreshKey, marketType]); // ✅ includes marketType now

  // ===========================
  // DIGIT SELECTION HANDLERS
  // ===========================
  const toggleDigit = (d) => {
    if (selectedDigits.includes(d)) {
      setSelectedDigits(selectedDigits.filter((x) => x !== d));
    } else {
      setSelectedDigits([...selectedDigits, d]);
    }
  };

  const handleGuruSelection = () => {
    let n = parseInt(inputValue, 10);
    if (isNaN(n) || n <= 0) return;
    if (n > digits.length) n = digits.length;
    const shuffled = [...digits].sort(() => Math.random() - 0.5);
    setSelectedDigits(shuffled.slice(0, n));
  };

  const handleInputChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value <= 0) value = "";
    else if (value > digits.length) value = digits.length;
    setInputValue(value);
  };

  // ===========================
  // RENDER
  // ===========================
  return (
    <div className="digit-box-new">
      <div className="digit-header">
        <span className="title">Select Your Digit</span>
        <span className="max-value">Max Selection = {digits.length}</span>
      </div>

      <div className="digit-input-row">
        <input
          type="number"
          placeholder="Fill Digit"
          className="digit-input"
          value={inputValue}
          min="1"
          max={digits.length}
          onChange={handleInputChange}
        />
        <button className="guru-btn" onClick={handleGuruSelection}>
          Guru Selection
        </button>
      </div>

      <div className="digit-buttons">
        {digits.map((d) => {
          const value = betsBook[d] || 0;
          const isProfit = value > 0;
          const isLoss = value < 0;

          return (
            <div
              key={d}
              className={`digit-card ${selectedDigits.includes(d) ? "selected" : ""}`}
              onClick={() => toggleDigit(d)}
            >
              <span className="digit-number">{d}</span>
              <span
                className={`digit-value ${isProfit ? "profit" : isLoss ? "loss" : ""}`}
              >
                {Math.abs(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

