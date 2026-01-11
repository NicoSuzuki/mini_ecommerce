const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health.routes');
const dbCheckRoutes = require('./routes/dbcheck.routes')

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1', healthRoutes);
app.use('/api/v1', dbCheckRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});


module.exports = app;
