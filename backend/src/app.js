const express = require('express');
const cors = require('cors');
const { requireAuth } = require('./auth');
const devAuthRoutes = require('./devAuthRoutes');
const taskRoutes = require('./taskRoutes');

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/', devAuthRoutes);
  app.use('/tasks', requireAuth, taskRoutes);

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  return app;
}

module.exports = createApp;
