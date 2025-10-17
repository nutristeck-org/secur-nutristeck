const express = require('express');
const { Pool } = require('pg');
const router = express.Router();
const pool = new Pool();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, description, price } = req.body;
  if (!name || !price) return res.status(400).json({ error: "Name and price are required." });
  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING *',
      [name, description, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.detail || err.message });
  }
});

module.exports = router;