const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Expects: Authorization: Bearer <token>
 * Attaches decoded user payload to req.user on success.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Access denied. No authorization token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Token is empty.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, iat, exp }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Session expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token. Please log in again.',
        code: 'TOKEN_INVALID',
      });
    }
    return res.status(500).json({ message: 'Token verification failed.' });
  }
};

module.exports = authMiddleware;
