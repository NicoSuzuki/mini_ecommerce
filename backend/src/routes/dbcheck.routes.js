const express = require('express');
const router = express.Router();
const pool = require('../../db/pool')

router.get('/db-check', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: true, db: rows[0].ok === 1 });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
