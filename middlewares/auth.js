const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ---------------- CONFIG ----------------
const SECRET = process.env.JWT_SECRET || "mysecret";
const TOKEN_EXPIRY = process.env.JWT_EXPIRY || "1d"; // default 1 day

console.log("JWT SECRET:", SECRET);
console.log("JWT EXPIRY:", TOKEN_EXPIRY);

// ---------------- MAIN AUTH (For Admin / Master routes) ----------------
async function auth(req, res, next) {
  // ✅ Read token from header OR cookie
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ error: "No token. Please login again." });

  try {
    const decoded = jwt.verify(token, SECRET);

    const user = await User.findById(decoded.user_id);
    if (!user) return res.status(401).json({ error: "User not found. Please login again." });

    if ((decoded.tokenVersion || 0) !== (user.tokenVersion || 0)) {
      return res.status(401).json({ error: "Token expired due to password change. Please login again." });
    }

    req.dbUser = user;
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please login again." });
    }
    return res.status(403).json({ error: "Invalid token. Please login again." });
  }
}

// ---------------- verifyToken (For Public APIs with JWT) ----------------
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please login again." });
    }
    console.error("verifyToken error:", err);
    return res.status(403).json({ error: "Invalid token" });
  }
}

// ---------------- ROLE CHECK ----------------
function requireRoles(roles) {
  return (req, res, next) => {
    if (!req.dbUser || !roles.includes(req.dbUser.role)) {
      return res.status(403).json({ error: "Not allowed" });
    }
    next();
  };
}

// ---------------- GENERATE TOKEN ----------------
function generateToken(user) {
  return jwt.sign(
    { 
      user_id: user._id, 
      role: user.role,
      tokenVersion: user.tokenVersion || 0 // ✅ Add tokenVersion
    },
    SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

module.exports = { auth, verifyToken, requireRoles, generateToken };
