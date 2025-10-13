import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import "./Matka.css";
import Header from "./Header";

const Matka = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    try {
      const now = new Date();
      const [hours, minutes] = timeStr.split(":").map(Number);
      const date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes
      );
      return date.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeStr;
    }
  };

  const getTimeAsDate = (timeStr) => {
    if (!timeStr) return null;
    const now = new Date();
    const [hours, minutes] = timeStr.split(":").map(Number);
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );
  };

  const CountdownTimer = ({ closeTime, suspend }) => {
    const closeDate = getTimeAsDate(closeTime);
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
      if (suspend) {
        setTimeLeft("00H : 00M : 00S");
        return;
      }

      const updateTimer = () => {
        if (!closeDate) return setTimeLeft("N/A");

        const now = new Date();
        const diff = closeDate - now;

        if (diff <= 0) {
          setTimeLeft("00H : 00M : 00S");
          return;
        }

        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setTimeLeft(
          `${hours.toString().padStart(2, "0")}H : ${minutes
            .toString()
            .padStart(2, "0")}M : ${seconds
            .toString()
            .padStart(2, "0")}S`
        );
      };

      updateTimer();
      const timer = setInterval(updateTimer, 1000);

      return () => clearInterval(timer);
    }, [closeTime, suspend]);

    return <div className="timer">{timeLeft}</div>;
  };

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const res = await axiosInstance.get("/market/public/list");
        const data = res.data.data || [];

        // Grouping by category
        const grouped = data.reduce((acc, market) => {
          const category = market.category_name || "OTHER";
          if (!acc[category]) acc[category] = [];

          acc[category].push({
            id: market.id,
            name: market.match_title,
            message: market.message || "",
            openTime: market.open_bids,
            closeTime: market.close_bids,
            status: market.is_active ? "Open" : "Close",
            suspend: market.suspend,
            slug: market.slug,
          });

          return acc;
        }, {});

        // 🔹 Sort within each category:
        Object.keys(grouped).forEach((cat) => {
          grouped[cat].sort((a, b) => {
            // suspended markets go to last
            if (a.suspend && !b.suspend) return 1;
            if (!a.suspend && b.suspend) return -1;

            const getTimeValue = (t) => {
              if (!t) return Infinity;
              const [h, m] = t.split(":").map(Number);
              return h * 60 + m;
            };
            return getTimeValue(a.closeTime) - getTimeValue(b.closeTime);
          });
        });

        const formatted = Object.entries(grouped).map(([category, markets]) => ({
          category,
          markets,
        }));

        setCategories(formatted);
      } catch (err) {
        console.error("❌ Failed to fetch markets", err);
        alert("Failed to fetch markets ❌");
      }
    };

    fetchMarkets();
  }, []);

  const handlePlayNow = (market) => {
    navigate(`/matka-game/${market.id}`);
  };

  return (
    <div className="matka-container">
      <Header />

      <div className="matka-page">
        <div className="matka-tabs">
          <button className="active">Matka</button>
          <button>Matka Result</button>
        </div>

        {categories.length === 0 && (
          <p style={{ textAlign: "center" }}>No markets found ❌</p>
        )}

        {categories.map(({ category, markets }) => (
          <div key={category} className="category-section">
            <h2 className="market-title">{category.toUpperCase()}</h2>

            <div className="market-grid">
              {markets.map((mkt) => (
                <div key={mkt.id} className="market-card">
                  <div className="market-card-header">
                    <h3 className="market-name">{mkt.name}</h3>

                    {mkt.message && (
                      <div className="market-news-wrapper">
                        <marquee behavior="scroll" direction="left" scrollamount="4">
                          {mkt.message}
                        </marquee>
                      </div>
                    )}

                    <span
                      className={`status ${
                        mkt.suspend
                          ? "suspend-red"
                          : mkt.status.toLowerCase()
                      }`}
                    >
                      {mkt.suspend ? "CLOSE" : mkt.status}
                    </span>
                  </div>

                  <div className="market-card-body">
                    <img
                      src="/images/click-matka.c451b114.webp"
                      alt="matka"
                      className="market-img"
                    />

                    <div className="market-info">
                      <p>OPEN : {formatTime(mkt.openTime)}</p>
                      <p>CLOSE : {formatTime(mkt.closeTime)}</p>

                      <div className="market-actions">
                        <button
                          className="play-btn"
                          onClick={() => handlePlayNow(mkt)}
                          disabled={mkt.suspend}
                        >
                          PLAY NOW
                        </button>
                        <CountdownTimer
                          closeTime={mkt.closeTime}
                          suspend={mkt.suspend}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matka;
