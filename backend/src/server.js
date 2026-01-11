require('dotenv').config();
const app = require('./app');
const pool = require('../db/pool')

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ Connected to MySQL database');

    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ MySQL connection error:', err.message || err);
    process.exit(1);
  }
}

start();