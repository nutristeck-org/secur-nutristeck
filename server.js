// ================================
// server.js — Main App Server (Final Stable Build)
// ================================
require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const pool = require("./db");
const sendEmail = require("./mailer");

// Routes
const authRoutes = require("./routes/auth");
const testRoutes = require("./routes/testRoutes");

const app = express();

// ================================
// 🌐 Middleware
// ================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================
// 🧠 PostgreSQL Connection Check
// ================================
(async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ Connected to PostgreSQL successfully.");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
})();

// ================================
// 📂 Serve Static Frontend Files
// ================================
const publicPath = path.join(__dirname);
app.use(express.static(publicPath));

// Default routes for static files (HTML pages)
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(publicPath, "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(publicPath, "signup.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(publicPath, "dashboard.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(publicPath, "admin.html"));
});

// ================================
// 📨 Email Test Route
// ================================
app.get("/api/test-email", async (req, res) => {
  try {
    await sendEmail(
      "nutristecksecure@gmail.com",
      "✅ Nutristeck Secure Test",
      "<h3>Email system working successfully!</h3>"
    );
    res.json({ success: true, message: "Test email sent successfully!" });
  } catch (err) {
    console.error("❌ Email error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================================
// 🔐 API Routes
// ================================
app.use("/api/auth", authRoutes);
app.use("/api", testRoutes);

// ================================
// 🧱 Fallback (404 for missing routes)
// ================================
app.use((req, res) => {
  res.status(404).sendFile(path.join(publicPath, "404.html"));
});

// ================================
// 🚀 Start Server
// ================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Nutristeck Secure Server running on port ${PORT}`);
});
