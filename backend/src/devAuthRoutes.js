const express = require('express');
const db = require('./db');
const { signToken } = require('./auth');

const router = express.Router();

/**
 * POST /dev-login
 * Simplified login for assessment purposes (full auth is Task 1's scope).
 * Body: { userId: "user-a" | "user-b" }
 */
router.post('/dev-login', (req, res) => {
  const { userId } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

  if (!user) {
    return res.status(400).json({ error: 'Unknown userId. Use "user-a" or "user-b".' });
  }

  const token = signToken(user.id);
  return res.status(200).json({ token, expiresIn: 3600, user: { id: user.id, email: user.email } });
});

module.exports = router;
