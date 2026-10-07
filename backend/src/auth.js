const jwt = require('jsonwebtoken');

// Fixed secret for the assessment demo only - never do this in production.
const JWT_SECRET = process.env.JWT_SECRET || 'flezi-demo-secret-do-not-use-in-prod';

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Express middleware: requires `Authorization: Bearer <token>`.
 * Attaches `req.userId` on success, otherwise responds 401.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { signToken, requireAuth, JWT_SECRET };
