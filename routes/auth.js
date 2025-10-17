// auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const pool = require("../db");
const { sendEmail } = require("../mailer"); // ✅ destructured import
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

/* ================================
   USER REGISTRATION
================================ */
router.post("/register", async (req, res) => {
  const { name, username, email, password, pin } = req.body;

  if (!name || !username || !email || !password)
    return res.status(400).json({ error: "All fields are required." });

  try {
    // Check if email or username already exists
    const existingEmail = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (existingEmail.rows.length > 0)
      return res.status(400).json({ error: "Email already registered." });

    const existingUsername = await pool.query("SELECT * FROM users WHERE username=$1", [username]);
    if (existingUsername.rows.length > 0)
      return res.status(400).json({ error: "Username already taken." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Insert user into DB
    await pool.query(
      `INSERT INTO users 
      (name, username, email, password, otp_code, otp_expires, role) 
      VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [name, username, email, hashedPassword, otp, otpExpires, "user"]
    );

    // Send OTP email
    const subject = "Welcome! Verify Your Email";
    const html = `
      <h2>Welcome, ${name}!</h2>
      <p>Your OTP to verify your email is: <b>${otp}</b></p>
      <p>Or click this link to verify: <a href="#">Verify Email</a></p>
      <small>This OTP expires in 10 minutes.</small>
    `;
    await sendEmail(email, subject, html);

    res.json({ message: "Registration successful. Check your email for OTP." });
  } catch (err) {
    console.error("❌ Registration Error:", err.message);
    res.status(500).json({ error: "Internal server error during registration." });
  }
});

/* ================================
   OTP VERIFICATION
================================ */
router.post("/verify-otp", async (req, res) => {
  const { email, otp_code } = req.body;
  if (!email || !otp_code)
    return res.status(400).json({ error: "Email and OTP are required." });

  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (result.rows.length === 0)
      return res.status(400).json({ error: "Email not found." });

    const user = result.rows[0];
    if (user.is_verified)
      return res.status(400).json({ error: "Account already verified." });
    if (user.otp_code !== otp_code)
      return res.status(400).json({ error: "Invalid OTP." });
    if (Date.now() > user.otp_expires)
      return res.status(400).json({ error: "OTP expired." });

    await pool.query(
      "UPDATE users SET is_verified=true, otp_code=NULL, otp_expires=NULL WHERE id=$1",
      [user.id]
    );

    res.send("OTP verified successfully! You can now log in.");
  } catch (err) {
    console.error("❌ OTP Verification Error:", err.message);
    res.status(500).json({ error: "Server error during OTP verification." });
  }
});

/* ================================
   LOGIN
================================ */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required." });

  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (result.rows.length === 0)
      return res.status(400).json({ error: "Invalid email or password." });

    const user = result.rows[0];

    if (!user.is_verified)
      return res.status(403).json({ error: "Please verify your email first." });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ error: "Invalid email or password." });

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).json({ error: "Server error during login." });
  }
});

/* ================================
   ADMIN ROUTE
================================ */
router.get("/admin", authenticateToken, authorizeRoles("admin"), (req, res) => {
  res.send("Welcome Admin! You have full access.");
});

/* ================================
   REFRESH TOKEN
================================ */
router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ error: "Refresh token required." });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (err) {
    console.error("❌ Refresh Token Error:", err.message);
    res.status(403).json({ error: "Invalid or expired refresh token." });
  }
});

/* ================================
   LOGOUT
================================ */
router.post("/logout", async (req, res) => {
  res.status(200).json({ message: "Logout successful. Tokens cleared client-side." });
});

/* ================================
   PROFILE (Protected)
================================ */
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, name, email, role, created_at FROM users WHERE id=$1",
      [req.user.id]
    );
    const user = result.rows[0];
    res.status(200).json({ message: "Profile retrieved successfully", user });
  } catch (err) {
    console.error("❌ Profile Error:", err.message);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

module.exports = router;