import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Header from "./Header"; 
import axiosInstance from "../api/axiosInstance";

const CACHE_EXPIRY = 1000 * 60 * 5; // 5 minutes

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

    // ---------- BANNERS ----------
    const cachedBanners = JSON.parse(localStorage.getItem("banners") || "null");
    if (cachedBanners && Date.now() - cachedBanners.timestamp < CACHE_EXPIRY) {
      setBanners(cachedBanners.data);
    } else {
      axiosInstance.get("/banners")
        .then(res => {
          setBanners(res.data.banners || []);
          localStorage.setItem(
            "banners",
            JSON.stringify({ data: res.data.banners || [], timestamp: Date.now() })
          );
        })
        .catch(console.error);
    }

    // ---------- CATEGORIES ----------
    const cachedCategories = JSON.parse(localStorage.getItem("categories") || "null");
    if (cachedCategories && Date.now() - cachedCategories.timestamp < CACHE_EXPIRY) {
      setCategories(cachedCategories.data);
    } else {
      axiosInstance.get("/categories")
        .then(res => {
          setCategories(res.data.categories || []);
          localStorage.setItem(
            "categories",
            JSON.stringify({ data: res.data.categories || [], timestamp: Date.now() })
          );
        })
        .catch(console.error);
    }

    fetchGamesByCategory("all");
  }, []);

  const fetchGamesByCategory = (catKey) => {
    setLoading(true);
    setGames([]);

    const cacheKey = `games_${catKey}`;
    const cachedGames = JSON.parse(localStorage.getItem(cacheKey) || "null");

    if (cachedGames && Date.now() - cachedGames.timestamp < CACHE_EXPIRY) {
      setGames(cachedGames.data);
      setLoading(false);
    } else {
      axiosInstance.get(`/categorywise/${catKey}`)
        .then(res => {
          setGames(res.data.games || []);
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ data: res.data.games || [], timestamp: Date.now() })
          );
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  const handleCategoryClick = (catKey) => {
    if (catKey === "matka") return navigate("/matka");
    if (catKey === "cricket-fight") return navigate("/cricket-fight");

    setActiveCat(catKey);
    fetchGamesByCategory(catKey);
  };

  const handleGameClick = (gameName) => navigate(`/games/${gameName}`);

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
      <Header />

      {/* BANNERS */}
      <section className="home-banner">
        <Slider {...settings}>
          {banners.map((banner, idx) => (
            <div className="banner-slide" key={idx}>
              <img src={banner.imageUrl} alt={`Banner ${idx}`} />
            </div>
          ))}
        </Slider>
      </section>

      {/* CATEGORIES */}
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

        <div
          key="matka"
          className={`category ${activeCat === "matka" ? "active" : ""}`}
          onClick={() => handleCategoryClick("matka")}
        >
          <img src="/images/nw-sp-matka.de43a991.svg" alt="Matka" />
          <p>MATKA</p>
        </div>
        <div
          key="cricket-fight"
          className={`category ${activeCat === "cricket-fight" ? "active" : ""}`}
          onClick={() => handleCategoryClick("cricket-fight")}
        >
          <img src="/images/download.png" alt="Cricket Fight" />
          <p>CRICKET FIGHT</p>
        </div>
      </section>

      {/* GAMES GRID */}
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
