import React, { useEffect, useState } from "react";
import axiosInstance from '../../api/axiosInstance';
import "./WorliManage.css";
import { FaTrash, FaBuilding, FaRegSave } from "react-icons/fa";
import { MdCategory } from "react-icons/md";

const CATEGORY_MATCH_TYPES = {
  delhi: ["single", "jodi"],
  mumbai: ["single", "single patti", "double patti", "triple patti", "jodi"],
  worli: ["single patti", "double patti"],
  default: ["single", "single patti", "double patti", "triple patti", "jodi"],
};

const DEFAULT_MATCH_VALUES = {
  single: { rate: 9, minStake: 10, maxStake: 5000 },
  "single patti": { rate: 140, minStake: 10, maxStake: 5000 },
  "double patti": { rate: 280, minStake: 10, maxStake: 5000 },
  "triple patti": { rate: 700, minStake: 10, maxStake: 5000 },
  jodi: { rate: 90, minStake: 10, maxStake: 5000 },
};

const WorliManage = () => {
  const [categories, setCategories] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddMarket, setShowAddMarket] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState({ id: "", name: "" });
  const [newMarket, setNewMarket] = useState({
    name: "",
    openTime: "",
    closeTime: "",
    matchTypes: {},
  });

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async (catId = "") => {
    try {
      const query = catId ? `?category_id=${catId}` : "";
      const res = await axiosInstance.get(`/market/list${query}`);
      const data = res.data.data || [];
      setMarkets(data.map((m) => ({ ...m, newMessage: m.message || "" })));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to fetch markets ❌");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/category/list");
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to fetch categories ❌");
    }
  };

  const addCategory = async () => {
    if (!newCategory.name.trim()) return alert("Category name required");
    try {
      await axiosInstance.post("/category/add", { name: newCategory.name });
      setNewCategory({ id: "", name: "" });
      setShowAddCategoryModal(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add category ❌");
    }
  };

  const addMarket = async () => {
    if (!selectedCategory || !newMarket.name || !newMarket.openTime || !newMarket.closeTime) {
      return alert("All fields are required");
    }
    try {
      const formattedMatchTypes = {};
      Object.entries(newMarket.matchTypes).forEach(([type, values]) => {
        formattedMatchTypes[type] = {
          rate: Number(values.rate) || 0,
          minStake: Number(values.minStake) || 0,
          maxStake: Number(values.maxStake) || 0,
        };
      });

      await axiosInstance.post("/market/add", {
        category_id: Number(selectedCategory),
        match_title: newMarket.name,
        open_bids: newMarket.openTime,
        close_bids: newMarket.closeTime,
        match_type: JSON.stringify(formattedMatchTypes),
        is_active: 1,
      });

      alert("Market added successfully ✅");
      setNewMarket({ name: "", openTime: "", closeTime: "", matchTypes: {} });
      setShowAddMarket(false);
      fetchMarkets(selectedCategory);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add market ❌");
    }
  };

  const toggleMarketStatus = async (id, currentStatus) => {
    try {
      await axiosInstance.post(`/market/update-status/${id}`, { is_active: !currentStatus });
      fetchMarkets(selectedCategory);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update status ❌");
    }
  };

  const deleteMarket = async (id) => {
    if (!window.confirm("Are you sure you want to delete this market?")) return;
    try {
      await axiosInstance.delete(`/market/delete/${id}`);
      fetchMarkets(selectedCategory);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete market ❌");
    }
  };

  const handleMatchTypeChange = (type, field, value) => {
    setNewMarket((prev) => ({
      ...prev,
      matchTypes: { ...prev.matchTypes, [type]: { ...prev.matchTypes[type], [field]: value } },
    }));
  };

  const toggleSuspend = async (marketId, type, currentStatus) => {
    try {
      await axiosInstance.post(`/market/toggle-suspend/${marketId}`, {
        type,
        status: !currentStatus,
      });
      fetchMarkets(selectedCategory);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update suspend status ❌");
    }
  };

  const toggleSuspendAll = async (marketId, open, close) => {
    try {
      const newStatus = !(open && close);
      await axiosInstance.post(`/market/toggle-suspend/${marketId}`, {
        type: "all",
        status: newStatus,
      });
      fetchMarkets(selectedCategory);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update suspend status ❌");
    }
  };

  const updateMarketMessage = async (id, message) => {
    try {
      await axiosInstance.post(`/market/update-message/${id}`, { message });
      alert("Message updated ✅");
      fetchMarkets(selectedCategory);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update message ❌");
    }
  };

  return (
    <div className="wm-page">
      <h2>🏪 Worli Market Management</h2>

      <div className="wm-top-buttons">
        <button onClick={() => setShowAddCategoryModal(true)}>
          <MdCategory /> Add Category
        </button>
        <button
          onClick={() => {
            setShowAddMarket(!showAddMarket);
            if (!showAddMarket) fetchCategories();
          }}
        >
          <FaBuilding /> Add Market
        </button>
      </div>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="modal-overlay category-modal">
          <div className="modal-content">
            <h3>Add New Category</h3>
            <input
              type="text"
              placeholder="Category Name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            />
            <div className="modal-actions">
              <button onClick={addCategory}>Save</button>
              <button onClick={() => setShowAddCategoryModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Market Modal */}
      {showAddMarket && (
        <div className="modal-overlay market-modal">
          <div className="modal-content">
            <h3>Add New Market</h3>

            <select
              value={selectedCategory}
              onChange={(e) => {
                const categoryId = Number(e.target.value);
                setSelectedCategory(categoryId);
                const cat = categories.find((c) => c.category_id === categoryId);
                const name = cat?.name?.toLowerCase() || "default";
                const catKey = name.includes("delhi")
                  ? "delhi"
                  : name.includes("mumbai")
                  ? "mumbai"
                  : name.includes("worli")
                  ? "worli"
                  : "default";

                const allowedTypes = CATEGORY_MATCH_TYPES[catKey] || CATEGORY_MATCH_TYPES.default;
                const updatedMatchTypes = {};
                allowedTypes.forEach((type) => {
                  updatedMatchTypes[type] = { ...DEFAULT_MATCH_VALUES[type] };
                });
                setNewMarket((prev) => ({ ...prev, matchTypes: updatedMatchTypes }));
              }}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Market Name"
              value={newMarket.name}
              onChange={(e) => setNewMarket({ ...newMarket, name: e.target.value })}
            />

            <div className="time-row">
              <input
                type="time"
                value={newMarket.openTime}
                onChange={(e) => setNewMarket({ ...newMarket, openTime: e.target.value })}
              />
              <input
                type="time"
                value={newMarket.closeTime}
                onChange={(e) => setNewMarket({ ...newMarket, closeTime: e.target.value })}
              />
            </div>

            <h4>Match Types</h4>
            {Object.keys(newMarket.matchTypes).map((type) => (
              <div key={type} className="match-type-row">
                <label className="match-type-label">{type}</label>
                <input
                  type="number"
                  placeholder="Rate"
                  value={newMarket.matchTypes[type].rate}
                  onChange={(e) => handleMatchTypeChange(type, "rate", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Min Stake"
                  value={newMarket.matchTypes[type].minStake}
                  onChange={(e) => handleMatchTypeChange(type, "minStake", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max Stake"
                  value={newMarket.matchTypes[type].maxStake}
                  onChange={(e) => handleMatchTypeChange(type, "maxStake", e.target.value)}
                />
              </div>
            ))}

            <div className="modal-actions">
              <button onClick={addMarket}>Save</button>
              <button onClick={() => setShowAddMarket(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Markets Table */}
      <div className="wm-table-container">
        <table className="wm-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Market Name</th>
              <th>Category</th>
              <th>Message</th>
              <th>Open Suspend</th>
              <th>Close Suspend</th>
              <th>All Suspend</th>
              <th>Status</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {markets.map((m, i) => (
              <tr key={m._id}>
                <td>{i + 1}</td>
                <td>{m.name || m.match_title}</td>
                <td>{m.category_name || "-"}</td>
                <td>
                  <div className="message-input-box">
                    <input
                      type="text"
                      value={m.newMessage || ""}
                      onChange={(e) =>
                        setMarkets((prev) =>
                          prev.map((x) =>
                            x._id === m._id ? { ...x, newMessage: e.target.value } : x
                          )
                        )
                      }
                      placeholder="Enter message..."
                      className="message-input"
                    />
                    <button
                      className="save-btn"
                      onClick={() => updateMarketMessage(m._id, m.newMessage)}
                      title="Save Message"
                    >
                      <FaRegSave size={18} />
                    </button>
                  </div>
                </td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={m.open_suspend}
                      onChange={() => toggleSuspend(m._id, "open", m.open_suspend)}
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={m.close_suspend}
                      onChange={() => toggleSuspend(m._id, "close", m.close_suspend)}
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={m.open_suspend && m.close_suspend}
                      onChange={() => toggleSuspendAll(m._id, m.open_suspend, m.close_suspend)}
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td>
                  <button
                    className={m.is_active ? "active" : "inactive"}
                    onClick={() => toggleMarketStatus(m._id, m.is_active)}
                  >
                    {m.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td>
                  <button className="delete" onClick={() => deleteMarket(m._id)}>
                    <FaTrash /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {markets.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>
                  No markets found ❌
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorliManage;
