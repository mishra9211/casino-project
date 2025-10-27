import React, { useState, useEffect } from "react";
import axiosInstance from '../../api/axiosInstance';
import "./GameRules.css";

export default function GameRules() {
  const [games, setGames] = useState([]);
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({ title: "", description: "", image: "" });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeRule, setActiveRule] = useState(null);
  const [selectedGame, setSelectedGame] = useState("");

  // Fetch games + all rules
  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await axiosInstance.get("/games");
      const gamesData = res.data.games || [];
      setGames(gamesData);

      // Merge all rules with game info
      const allRules = [];
      gamesData.forEach(g => {
        (g.rules || []).forEach((r, idx) =>
          allRules.push({
            ...r,
            gameName: g.name,
            gameId: g._id,
            ruleIndex: idx
          })
        );
      });
      setRules(allRules);
    } catch (err) {
      console.error("Failed to fetch games:", err);
    }
  };

  // Save new rule
  const saveRule = async () => {
    if (!selectedGame || !newRule.title) {
      alert("Select game & enter title");
      return;
    }

    const formData = new FormData();
    formData.append("title", newRule.title);
    formData.append("description", newRule.description);
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await axiosInstance.post(`/games/${selectedGame}/rules`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedGame = res.data.game;
      if (updatedGame) {
        // Update merged rules list
        const allRules = [];
        games.forEach(g => {
          const current = g._id === updatedGame._id ? updatedGame : g;
          (current.rules || []).forEach((r, idx) =>
            allRules.push({
              ...r,
              gameName: current.name,
              gameId: current._id,
              ruleIndex: idx
            })
          );
        });
        setRules(allRules);
      }

      setNewRule({ title: "", description: "", image: "" });
      setImageFile(null);
      setPreview(null);
      setSelectedGame("");
    } catch (err) {
      console.error("Save rule failed:", err);
      alert(err.response?.data?.error || "Save failed ❌");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const deleteRule = async (gameId, ruleIndex) => {
    if (!window.confirm("Delete this rule?")) return;

    const game = games.find(g => g._id === gameId);
    if (!game) return;

    const updatedRules = [...game.rules];
    updatedRules.splice(ruleIndex, 1);

    try {
      await axiosInstance.put(`/games/${gameId}`, { rules: updatedRules });

      // Refresh merged rules
      const allRules = [];
      games.forEach(g => {
        const currentRules = g._id === gameId ? updatedRules : g.rules || [];
        currentRules.forEach((r, idx) =>
          allRules.push({
            ...r,
            gameName: g.name,
            gameId: g._id,
            ruleIndex: idx
          })
        );
      });
      setRules(allRules);
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.error || "Delete failed ❌");
    }
  };

  const openModal = (rule) => {
    setActiveRule(rule);
    setModalOpen(true);
  };

  const closeModal = () => {
    setActiveRule(null);
    setModalOpen(false);
  };

  return (
    <div className="rules-container">
      <h1 className="page-title">🎲 Game Rules Management</h1>

      {/* Add Rule Form */}
      <div className="add-rule-card">
        <select value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)}>
          <option value="">-- Select Game --</option>
          {games.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
        </select>

        <input
          type="text"
          placeholder="Rule Title"
          value={newRule.title}
          onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
        />

        <textarea
          placeholder="Description"
          rows={1}
          value={newRule.description}
          onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
        />

        <input type="file" accept="image/*" onChange={handleImageChange} />
        {preview && <img src={preview} alt="Preview" style={{ width: "80px", borderRadius: "6px" }} />}

        <button className="btn-save" onClick={saveRule}>➕ Save Rule</button>
      </div>

      {/* All Rules Table */}
      {rules.length > 0 && (
        <div className="table-card">
          <h2>All Game Rules</h2>
          <table className="rules-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Game</th>
                <th>Title</th>
                <th>View</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{r.gameName}</td>
                  <td>{r.title}</td>
                  <td><button className="btn-eye" onClick={() => openModal(r)}>👁️</button></td>
                  <td>
                    <button className="btn-edit">✏️ Edit</button>
                    <button className="btn-delete" onClick={() => deleteRule(r.gameId, r.ruleIndex)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && activeRule && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{activeRule.title} ({activeRule.gameName})</h3>
            <div className="modal-scroll">
              <p>{activeRule.description}</p>
              {activeRule.image && <img src={activeRule.image} alt={activeRule.title} style={{ width: "200px", borderRadius: "8px" }} />}
            </div>
            <button className="btn-close" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
