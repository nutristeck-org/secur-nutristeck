const jwt = require("jsonwebtoken");
require("dotenv").config();

// ===============================
// Authenticate JWT Token
// ===============================
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Expect: "Bearer TOKEN"

  if (!token) return res.status(401).json({ error: "Access token missing" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user; // attach user info to request
    next();
  });
}

// ===============================
// Role-based Authorization
// ===============================
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied: insufficient permissions." });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };