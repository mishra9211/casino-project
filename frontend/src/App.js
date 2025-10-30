import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

// ---------------- Admin Imports ----------------
import AdminLogin from "./admin/pages/AdminLogin";
import AdminLayout from "./admin/pages/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import Market from "./admin/pages/Market";
import Bets from "./admin/pages/Bets";
import Members from "./admin/pages/Members";
import BannerSettings from "./admin/pages/BannerSettings";
import GameSettings from "./admin/pages/GameSettings";
import GameRules from "./admin/pages/GameRules";
import WorliManage from "./admin/pages/WorliManage";
import MembersInner from "./admin/pages/MembersInner";

// ---------------- User Imports ----------------
import UserLogin from "./pages/UserLogin";
import Home from "./pages/Home";
import GamesLayout from "./pages/GamesLayout";
import GamePage from "./pages/GamePage";
import Matka from "./pages/Matka";
import MatkaGame from "./pages/MatkaGame";
import CricketFight from "./pages/CricketFight";

// Styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// ---------------- Protected Route Components ----------------
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("user_token");
  if (!token) return <Navigate to="/" state={{ from: location }} replace />;
  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("admin_token");
  if (!token) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return children;
};

// ---------------- App Wrapper ----------------
const AppWrapper = () => {
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
      <Route
        path="/games"
        element={
          <ProtectedRoute>
            <GamesLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<div>Select a game from left sidebar</div>} />
        <Route path=":gameName" element={<GamePage />} />
      </Route>

      {/* ---------- ADMIN ROUTES ---------- */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
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
        <Route path="/admin/members/:userId" element={<MembersInner />} />
      </Route>

      {/* ---------- DEFAULT FALLBACK ---------- */}
      <Route path="*" element={<Navigate to="/" replace />} />
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
