const pool = require('./db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connection successful! Current time:', res.rows[0]);
  }
  pool.end();
});