// ================================
// defaultAdmin.js - Create Default Admin User (FINAL FIXED)
// ================================
require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("./db");

(async () => {
  try {
    console.log("🔍 Checking for existing admin...");

    // 1️⃣ Check if an admin already exists
    const checkAdmin = await pool.query(
      "SELECT * FROM users WHERE role = $1 LIMIT 1",
      ["admin"]
    );

    if (checkAdmin.rows.length > 0) {
      console.log("ℹ️ Admin already exists. Nothing to do.");
      process.exit(0);
    }

    // 2️⃣ Define default admin credentials
    const name = "System Administrator";
    const username = "superadmin";
    const email = "admin@nutristeck.com";
    const password = "Admin@1234";
    const pin = "0000";
    const role = "admin";

    // 3️⃣ Hash password & pin
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPin = await bcrypt.hash(pin, 10);

    // 4️⃣ Insert into users table (include all mandatory columns)
    const insertQuery = `
      INSERT INTO users (name, username, email, password, pin_hash, role, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING id, name, email, role;
    `;

    const result = await pool.query(insertQuery, [
      name,
      username,
      email,
      hashedPassword,
      hashedPin,
      role,
    ]);

    console.log("✅ Admin account created successfully!");
    console.log(result.rows[0]);
    console.log("\n🪪 Default Admin Credentials:");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Username:", username);
    console.log("Password:", password);
    console.log("PIN:", pin);
    console.log("Role:", role);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
    process.exit(1);
  }
})();