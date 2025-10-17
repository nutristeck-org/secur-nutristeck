// ================================
// app.js - Main Server Entry (FINAL STABLE)
// ================================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const pool = require("./db");
const sendEmail = require("./mailer"); // ✅ FIXED: removed curly braces

// Import routes
const authRoutes = require("./routes/auth");
const testRoutes = require("./routes/testRoutes");

const app = express();

// ================================
// 🧩 Middleware
// ================================
app.use(express.json());
app.use(cors());

// ================================
// 🧠 Verify DB Connection
// ================================
(async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ Connected to PostgreSQL successfully.");
  } catch (err) {
    console.error("❌ PostgreSQL connection error:", err.message);
  }
})();

// ================================
// 📨 Test Email Route
// ================================
app.get("/api/test-email", async (req, res) => {
  try {
    await sendEmail(
      "nutristecksecure@gmail.com",
      "✅ Nutristeck Secure Mail Test",
      "<h2>Email System Working</h2><p>Your SMTP configuration is correct.</p>"
    );
    res.json({ success: true, message: "✅ Test email sent successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================================
// 🔐 Routes
// ================================
app.use("/api/auth", authRoutes);
app.use("/api", testRoutes);

// ================================
// 👑 Auto-create Default Admin if Missing
// ================================
(async () => {
  try {
    const { rows } = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    if (parseInt(rows[0].count) === 0) {
      const hashedPassword = await bcrypt.hash("Admin@1413", 10);
      const hashedPin = await bcrypt.hash("0000", 10);

      await pool.query(
        `INSERT INTO users (name, username, email, password, pin_hash, role, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [
          "System Administrator",
          "superadmin",
          "admin@nutristeck.com",
          hashedPassword,
          hashedPin,
          "admin",
        ]
      );

      console.log("✅ Default admin account created:");
      console.log("   Email: admin@nutristeck.com");
      console.log("   Password: Admin@1413");
      console.log("   PIN: 0000");
    } else {
      console.log("ℹ️ Admin account already exists. Skipping creation.");
    }
  } catch (err) {
    console.error("❌ Error creating default admin:", err.message);
  }
})();

// ================================
// 🏁 Root Route
// ================================
app.get("/", (req, res) => {
  res.send("✅ Nutristeck Secure API is running perfectly.");
});

// ================================
// 🚀 Start Server
// ================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});