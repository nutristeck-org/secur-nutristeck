// =====================================
// db.js — PostgreSQL Connection (Render)
// =====================================
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // ✅ uses Render’s variable
  ssl: {
    rejectUnauthorized: false, // ✅ required for Render PostgreSQL
  },
});

pool
  .connect()
  .then(() => console.log("✅ PostgreSQL connected successfully."))
  .catch((err) => console.error("❌ PostgreSQL connection error:", err.message));

module.exports = pool;
