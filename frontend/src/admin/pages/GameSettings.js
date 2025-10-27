import React, { useEffect, useState } from "react";
import axiosInstance from '../../api/axiosInstance';
import "./GameSettings.css";

const GameSettings = () => {
  const [games, setGames] = useState([]);
  const [updatedGames, setUpdatedGames] = useState([]); // Track updated games
  const [name, setName] = useState("");
  const [category, setCategory] = useState("live-casino");
  const [iframeUrl, setIframeUrl] = useState("");
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await axiosInstance.get("/games");
      setGames(res.data.games || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch games ❌");
    }
  };

  const uploadGame = async () => {
    if (!name || !category) return alert("Name & Category required");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("iframeUrl", iframeUrl);
    if (thumbnail) formData.append("thumbnail", thumbnail);

    try {
      const res = await axiosInstance.post("/games", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setGames(res.data.games);
      setName("");
      setIframeUrl("");
      setThumbnail(null);
      alert("Game Added ✅");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to add game ❌");
    }
  };

  const deleteGame = async (id) => {
    if (!window.confirm("Are you sure you want to delete this game?")) return;
    try {
      const res = await axiosInstance.delete(`/games/${id}`);
      alert(res.data.message || "Game deleted ✅");
      fetchGames();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error deleting game ❌");
    }
  };

  const updateGamePath = async (game) => {
    if (!game.iframeUrl) return alert("Iframe URL missing!");

    const formData = new FormData();
    formData.append("name", game.name);
    formData.append("category", game.category);
    formData.append("iframeUrl", game.iframeUrl);

    try {
      const res = await axiosInstance.put(`/games/${game._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(res.data.message || "Game path updated ✅");
      setUpdatedGames((prev) => [...prev, game._id]);
      fetchGames();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error updating game path ❌");
    }
  };

  return (
    <div className="game-settings-container">
      <h2 className="page-title">🎮 Manage Games</h2>

      {/* ADD GAME FORM */}
      <div className="form-card">
        <h3>Add New Game</h3>
        <div className="form-grid">
          <input
            type="text"
            placeholder="Game Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="live-casino">Live Casino</option>
            <option value="slots">Slots</option>
            <option value="NEW GAMES">NEW GAMES</option>
            <option value="JACKPOTS">JACKPOTS</option>
            <option value="888 EXCLUSIVE">888 EXCLUSIVE</option>
            <option value="CASINO GAMES">CASINO GAMES</option>
          </select>
          <input
            type="text"
            placeholder="Iframe URL"
            value={iframeUrl}
            onChange={(e) => setIframeUrl(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files[0])}
          />
          <button className="btn-add" onClick={uploadGame}>
            ➕ Add Game
          </button>
        </div>
      </div>

      {/* GAMES LIST */}
      <div className="table-card">
        <h3>Games List (All Games)</h3>
        <table className="games-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Thumbnail</th>
              <th>Name</th>
              <th>Category</th>
              <th>Iframe</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.map((g, idx) => (
              <tr key={g._id || idx}>
                <td>{idx + 1}</td>
                <td>{g.thumbnailUrl && <img src={g.thumbnailUrl} alt={g.name} />}</td>
                <td>{g.name}</td>
                <td>{g.category}</td>
                <td>
                  <a href={g.iframeUrl} target="_blank" rel="noreferrer">{g.iframeUrl}</a>
                </td>
                <td>
                  <button className="btn-delete" onClick={() => deleteGame(g._id)}>🗑 Delete</button>
                  {!g.pathUpdated && (
                    <button className="btn-update" onClick={() => updateGamePath(g)} style={{ marginLeft: "10px" }}>
                      🔄 Update Path
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {games.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>No games added yet 🚫</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GameSettings;
