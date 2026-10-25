const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    next();
  } catch (e) { res.status(401).json({ error: 'Unauthorized' }); }
}

// Usage: router.post('/', auth, requireRole('instructor', 'admin'), ...)
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden for role '${req.user?.role || 'unknown'}'` });
    }
    next();
  };
}

module.exports = requireAuth;
module.exports.requireAuth = requireAuth;
module.exports.requireRole = requireRole;
