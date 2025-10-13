import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Header from "./Header"; // ✅ Reusable Header component
import axiosInstance from "../api/axiosInstance";


const Home = () => {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [games, setGames] = useState([]);
  const [activeCat, setActiveCat] = useState("all");
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    axiosInstance.get("/banners")
  .then((res) => setBanners(res.data.banners || []))
  .catch(console.error);

    axiosInstance.get("/categories")
      .then((res) => setCategories(res.data.categories || []))
      .catch(console.error);

    fetchGamesByCategory("all");
  }, []);

  const fetchGamesByCategory = (catKey) => {
  setLoading(true);
  setGames([]);

  // ✅ Use categorywise API
  let url = `/categorywise/${catKey}`; // 'all', 'live-casino', 'slots', etc.

  axiosInstance
    .get(url)
    .then((res) => setGames(res.data.games || []))
    .catch(console.error)
    .finally(() => setLoading(false));
};

  const handleCategoryClick = (catKey) => {
    if (catKey === "matka") {
      navigate("/matka"); // 🔹 Navigate to Matka page
      return;
    }
    if (catKey === "cricket-fight") {
      navigate("/cricket-fight"); // 🔹 Navigate to Cricket Fight page
      return;
    }

    setActiveCat(catKey);
    fetchGamesByCategory(catKey);
  };

  const handleGameClick = (gameName) => {
    navigate(`/games/${gameName}`); // 🔹 Navigate to selected game
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
  };

  return (
    <div className="home-container">
      {/* ✅ Reusable Header */}
      <Header />

      {/* ---------- BANNER ---------- */}
      <section className="home-banner">
        <Slider {...settings}>
          {banners.map((banner, idx) => (
            <div className="banner-slide" key={idx}>
              <img src={banner.imageUrl} alt={`Banner ${idx}`} />
            </div>
          ))}
        </Slider>
      </section>

      {/* ---------- CATEGORIES ---------- */}
      <section className="categories">
        <div
          key="all"
          className={`category ${activeCat === "all" ? "active" : ""}`}
          onClick={() => handleCategoryClick("all")}
        >
          <img src="/images/ALL.png" alt="All Games" />
          <p>ALL</p>
        </div>

        {categories.map((cat) => (
          <div
            key={cat._id}
            className={`category ${activeCat === cat.key ? "active" : ""}`}
            onClick={() => handleCategoryClick(cat.key)}
          >
            <img
              src={
                cat.key === "live-casino"
                  ? "/images/Live_arena_icons.webp"
                  : cat.img
              }
              alt={cat.label}
            />
            <p>{cat.label}</p>
          </div>
        ))}

        {/* 🔹 EXTRA CATEGORY: MATKA */}
        <div
          key="matka"
          className={`category ${activeCat === "matka" ? "active" : ""}`}
          onClick={() => handleCategoryClick("matka")}
        >
          <img src="/images/nw-sp-matka.de43a991.svg" alt="Matka" />
          <p>MATKA</p>
        </div>
        {/* 🔹 EXTRA CATEGORY: Cricket-fight */}
        <div
          key="cricket-fight"
          className={`category ${activeCat === "cricket-fight" ? "active" : ""}`}
          onClick={() => handleCategoryClick("cricket-fight")}
        >
          <img src="/images/download.png" alt="Cricket Fight" />
          <p>CRICKET FIGHT</p>
        </div>
      </section>

      {/* ---------- GAME GRID ---------- */}
      <section className="games-grid">
        <h3>
          {activeCat === "all"
            ? "All Games"
            : categories.find((c) => c.key === activeCat)?.label}
        </h3>
        <div
          className="grid"
          style={{ backgroundColor: loading ? "#000" : "transparent" }}
        >
          {loading
            ? null
            : games.map((game) => (
                <div
                  className="game-card"
                  key={game._id}
                  onClick={() => handleGameClick(game.name)}
                  style={{ cursor: "pointer" }}
                >
                  <img src={game.thumbnailUrl} alt={game.name} />
                </div>
              ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
