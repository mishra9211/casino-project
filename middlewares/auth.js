const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ---------------- CONFIG ----------------
const SECRET = process.env.JWT_SECRET || "mysecret";
const TOKEN_EXPIRY = process.env.JWT_EXPIRY || "10s"; // .env ke hisaab se

console.log("JWT SECRET:", SECRET);
console.log("JWT EXPIRY:", TOKEN_EXPIRY); // Debug: check kya load ho raha hai

// ---------------- AUTH MIDDLEWARE ----------------
async function auth(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token. Please login again." });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;

    // Fetch user from DB
    req.dbUser = await User.findById(decoded.user_id);
    if (!req.dbUser) return res.status(401).json({ error: "User not found. Please login again." });

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please login again." });
    }
    return res.status(403).json({ error: "Invalid token. Please login again." });
  }
}

// ---------------- ROLE CHECK MIDDLEWARE ----------------
function requireRoles(roles) {
  return (req, res, next) => {
    if (!req.dbUser || !roles.includes(req.dbUser.role)) {
      return res.status(403).json({ error: "Not allowed" });
    }
    next();
  };
}

// ---------------- HELPER: GENERATE TOKEN ----------------
function generateToken(user) {
  // Hamesha .env ka value use hoga, default fallback 10s
  return jwt.sign(
    { user_id: user._id, role: user.role },
    SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

module.exports = { auth, requireRoles, generateToken };
