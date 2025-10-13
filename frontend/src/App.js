import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import axiosInstance from "./api/axiosInstance";
import jwtDecode from "jwt-decode";

// Admin Imports
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Market from "./pages/Market";
import Bets from "./pages/Bets";
import Members from "./pages/Members";
import BannerSettings from "./pages/BannerSettings";
import GameSettings from "./pages/GameSettings";
import GameRules from "./pages/GameRules";

// User Imports
import UserLogin from "./pages/UserLogin";
import Home from "./pages/Home";
import GamesLayout from "./pages/GamesLayout";
import GamePage from "./pages/GamePage";
import Matka from "./pages/Matka";
import MatkaGame from "./pages/MatkaGame";
import CricketFight from "./pages/CricketFight";
import WorliManage from "./pages/WorliManage";

// Styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// ---------------- Auto logout hook ----------------
const useAutoLogoutPing = () => {
  React.useEffect(() => {
    const path = window.location.pathname;
    const tokenKey = path.startsWith("/admin") ? "admin_token" : "token";
    const token = localStorage.getItem(tokenKey);
    if (!token) return;

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch {
      localStorage.removeItem(tokenKey);
      return;
    }

    const expTime = decoded.exp * 1000;
    const now = Date.now();
    const timeout = expTime - now;

    if (timeout <= 0) {
      localStorage.removeItem(tokenKey);
      return;
    }

    const timer = setTimeout(() => {
      localStorage.removeItem(tokenKey);
      window.location.reload();
    }, timeout);

    const pingTimer = setTimeout(async () => {
      try {
        await axiosInstance.get("/users/ping");
      } catch {
        localStorage.removeItem(tokenKey);
        window.location.reload();
      }
    }, timeout - 5000 > 0 ? timeout - 5000 : 0);

    return () => {
      clearTimeout(timer);
      clearTimeout(pingTimer);
    };
  }, []);
};

// ---------------- Protected Route ----------------
const ProtectedRoute = ({ children, isAdmin = false }) => {
  const tokenKey = isAdmin ? "admin_token" : "token";
  const token = localStorage.getItem(tokenKey);
  const location = useLocation();

  if (!token) {
    return isAdmin ? (
      <Navigate to="/admin/login" state={{ from: location }} replace />
    ) : (
      <Navigate to="https://casino-project-1.onrender.com" replace />
    );
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem(tokenKey);
      return isAdmin ? (
        <Navigate to="/admin/login" replace />
      ) : (
        <Navigate to="https://casino-project-1.onrender.com" replace />
      );
    }
  } catch {
    localStorage.removeItem(tokenKey);
    return isAdmin ? (
      <Navigate to="/admin/login" replace />
    ) : (
      <Navigate to="https://casino-project-1.onrender.com" replace />
    );
  }

  return children;
};

// ---------------- App Wrapper ----------------
const AppWrapper = () => {
  useAutoLogoutPing();

  return (
    <Routes>
      {/* ---------- USER ROUTES ---------- */}
      <Route path="/" element={<UserLogin />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/matka"
        element={
          <ProtectedRoute>
            <Matka />
          </ProtectedRoute>
        }
      />
      <Route
        path="/matka-game/:id"
        element={
          <ProtectedRoute>
            <MatkaGame />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cricket-fight"
        element={
          <ProtectedRoute>
            <CricketFight />
          </ProtectedRoute>
        }
      />

      {/* ---------- ADMIN ROUTES ---------- */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute isAdmin={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="market" element={<Market />} />
        <Route path="bets" element={<Bets />} />
        <Route path="members" element={<Members />} />
        <Route path="banner" element={<BannerSettings />} />
        <Route path="games" element={<GameSettings />} />
        <Route path="game-rules" element={<GameRules />} />
        <Route path="worli-manage" element={<WorliManage />} />
      </Route>

      {/* ---------- GAMES ROUTES ---------- */}
      <Route
        path="/games"
        element={
          <ProtectedRoute>
            <GamesLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<div>Select a game from left sidebar</div>} />
        <Route
          path=":gameName"
          element={
            <ProtectedRoute>
              <GamePage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

// ---------------- Main App ----------------
function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
