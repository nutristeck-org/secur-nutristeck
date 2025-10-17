// ================================
// testRoutes.js - For email testing
// ================================
const express = require("express");
const router = express.Router();
const sendEmail = require("../mailer"); // ✅ correct import (no curly braces)

// ================================
// 📬 Test Email Endpoint
// ================================
router.post("/send-test-email", async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ success: false, error: "Recipient email 'to' is required." });
    }

    await sendEmail(
      to,
      "NutriSteck Test Email ✅",
      "<h1>✅ Your Node.js mailer works!</h1><p>This message confirms your SMTP setup is working perfectly.</p>"
    );

    res.json({ success: true, message: `Email sent to ${to}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;