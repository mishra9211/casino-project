import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance"; // ✅ shared axios instance
import "./GamesLayout.css";

export default function GamesLayout() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState("");
  const [bets, setBets] = useState([
    { id: 1, game: "Team A vs Team B", odds: 1.85, stake: 500 },
    { id: 2, game: "Over 2.5 Goals", odds: 2.1, stake: 300 },
  ]);
  const [balance, setBalance] = useState(8185);
  const userName = "John Doe";
  const navigate = useNavigate();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await axiosInstance.get("/games");
      setGames(res.data.games || []);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to fetch games ❌");
    }
  };

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* TOP HEADER */}
      <div
        style={{
          height: "38px",
          background: "#CFB53B",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 20px",
          fontWeight: "bold",
          flexShrink: 0,
        }}
      >
        <span style={{ cursor: "pointer" }} onClick={() => navigate("/home")}>
          ← Back to Home
        </span>
        <span>{userName}</span>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* LEFT SIDEBAR */}
        <div
          style={{
            width: "260px",
            background: "#000",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            padding: "20px",
          }}
        >
          <div style={{ flexShrink: 0, marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Search Game..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "none",
              }}
            />
          </div>
          <div className="scroll-hidden" style={{ flex: 1 }}>
            {filteredGames.map((game) => (
              <NavLink
                key={game._id}
                to={`/games/${game.path}`} // GamePage route
                style={({ isActive }) => ({
                  display: "block",
                  marginBottom: "20px",
                  textDecoration: "none",
                  color: "#fff",
                  background: isActive ? "#CFB53B" : "#222",
                  borderRadius: "10px",
                  overflow: "hidden",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                })}
              >
                <img
                  src={game.thumbnailUrl || "/images/default-game.png"}
                  alt={game.name}
                  style={{
                    width: "100%",
                    maxHeight: "160px",
                    objectFit: "cover",
                  }}
                />
                <div style={{ padding: "10px", fontWeight: 600 }}>{game.name}</div>
              </NavLink>
            ))}
          </div>
        </div>

        {/* CENTER → Main Game Content */}
        <div className="scroll-hidden" style={{ flex: 1, padding: "20px", background: "#111" }}>
          {/* 🔹 Render GamePage iframe here */}
          <Outlet />
        </div>

        {/* RIGHT SIDEBAR → My Bets */}
        <div
          style={{
            width: "358px",
            background: "#fff",
            color: "#000",
            borderLeft: "2px solid #333",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              background: "#1d3b2f",
              color: "#fff",
              padding: "8px 12px",
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
            }}
          >
            <span>My Bet</span>
            <span>Bal:{balance}</span>
          </div>

          <div
            style={{
              background: "#f3f3f3",
              padding: "6px 10px",
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "1px solid #ddd",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            <span>Matched Bet</span>
            <span>Odds</span>
            <span>Stake</span>
          </div>

          <div className="scroll-hidden" style={{ flex: 1, minHeight: "200px" }}>
            {bets.length > 0 ? (
              bets.map((bet) => (
                <div
                  key={bet.id}
                  style={{
                    padding: "6px 10px",
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #eee",
                    fontSize: "14px",
                  }}
                >
                  <span>{bet.game}</span>
                  <span>{bet.odds}</span>
                  <span>{bet.stake}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>
                No bets matched
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
