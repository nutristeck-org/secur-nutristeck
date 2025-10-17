const express = require("express");
const sendMail = require("./mailer");

const router = express.Router();

router.get("/test-email", async (req, res) => {
  try {
    await sendMail(
      "nutristecksecure@gmail.com", // change this to your test inbox if needed
      "✅ Test Email from NutriSteck API",
      `<h2>SMTP Test Successful</h2>
       <p>Your backend successfully sent this test email.</p>`
    );

    res.json({ success: true, message: "Test email sent successfully." });
  } catch (error) {
    console.error("❌ Error sending test email:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;