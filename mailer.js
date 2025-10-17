// ================================
// mailer.js - Gmail SMTP Transport
// ================================
require("dotenv").config();
const nodemailer = require("nodemailer");

// ================================
// 📨 Create Transporter
// ================================
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 465,
  secure: process.env.EMAIL_SECURE === "true", // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ================================
// ✅ Verify Connection
// ================================
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP connection error:", error.message);
  } else {
    console.log("✅ SMTP server is ready to send emails.");
  }
});

// ================================
// ✉️ Send Email Function
// ================================
async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"NutriSteck Secure Banking" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`📤 Email sent to ${to}. Message ID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error("❌ Email sending failed:", err.message);
    throw err;
  }
}

// ================================
// 📦 Export
// ================================
module.exports = sendEmail;