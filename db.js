// =====================================
// db.js — PostgreSQL Connection (Local + Render Safe)
// =====================================
require("dotenv").config();
const { Pool } = require("pg");

const isRender = process.env.RENDER === "true"; // flag for Render environment

const pool = new Pool(
  isRender
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        user: process.env.PGUSER || "postgres",
        host: process.env.PGHOST || "localhost",
        database: process.env.PGDATABASE || "nutristeck_secure",
        password: process.env.PGPASSWORD || "Yellow@1413@",
        port: process.env.PGPORT || 5432,
      }
);

pool
  .connect()
  .then(() =>
    console.log(
      `✅ PostgreSQL connected successfully in ${isRender ? "Render" : "Local"} mode.`
    )
  )
  .catch((err) => console.error("❌ PostgreSQL connection error:", err.message));

module.exports = pool;
