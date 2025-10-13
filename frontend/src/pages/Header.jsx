import React from "react";
import { FaGlobe, FaUser, FaWallet, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // 👈 import useNavigate
import "./Home.css"; // reuse same styles from Home

const Header = () => {
  const navigate = useNavigate(); // 👈 hook initialize

  const handleLogoClick = () => {
    navigate("/home"); // 👈 navigate to /home
  };

  return (
    <header className="home-header">
      <div className="logo" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
        <img src="/Logo888.png" alt="888 CASINO" />
      </div>
      <div className="header-right">
        <div className="header-icons">
          <FaGlobe className="header-icon" />
          <FaUser className="header-icon" />
          <span className="username">mishra</span>
          <FaWallet className="header-icon" />
          <span className="balance">$ 0.00</span>
        </div>
        <button className="deposit-btn">DEPOSIT</button>
        <FaSignOutAlt className="header-icon logout-icon" />
      </div>
    </header>
  );
};

export default Header;
