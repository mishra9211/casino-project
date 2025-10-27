import React, { useState, useEffect } from "react";
import axiosInstance from '../../api/axiosInstance';
import "./BannerSettings.css";

const BannerSettings = () => {
  const [file, setFile] = useState(null);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await axiosInstance.get("/banners"); // ✅ GET banners
      setBanners(res.data.banners || []);
    } catch (err) {
      console.error("Failed to fetch banners:", err);
    }
  };

  const uploadBanner = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("banner", file);

    try {
      const res = await axiosInstance.post("/banners", formData, {
        headers: { "Content-Type": "multipart/form-data" }, // ✅ important
      });
      setBanners(res.data.banners);
      alert("Banner added!");
      setFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
      alert(err.response?.data?.error || "Upload failed ❌");
    }
  };

  const deleteBanner = async (id) => {
    if (!window.confirm("Delete this banner?")) return;

    try {
      await axiosInstance.delete(`/banners/${id}`);
      fetchBanners(); // refresh list
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.error || "Delete failed ❌");
    }
  };

  return (
    <div className="banner-settings">
      <h2>Banner Settings</h2>

      {banners.length > 0 && (
        <div className="banner-current">
          <h4>Current Banners:</h4>
          <table className="banner-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Preview</th>
                <th>Image URL</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner, idx) => (
                <tr key={banner._id || idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <img
                      src={banner.imageUrl}
                      alt={`banner-${idx}`}
                      style={{ width: "120px", borderRadius: "6px" }}
                    />
                  </td>
                  <td className="url-cell">{banner.imageUrl}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => deleteBanner(banner._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="banner-upload">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button onClick={uploadBanner}>Upload New Banner</button>
      </div>
    </div>
  );
};

export default BannerSettings;
