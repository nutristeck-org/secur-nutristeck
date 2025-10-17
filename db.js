require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'nutristeck_secure',
  password: process.env.PGPASSWORD || 'Yellow@1413@',
  port: process.env.PGPORT || 5432,
});

module.exports = pool;