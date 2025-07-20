const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

// JWT secret - should match baseGeek's secret
const JWT_SECRET = process.env.JWT_SECRET || 'e96335fedffb854e850eef650989f75e1c577bb1e0e95921901e726e951fd58f1f511f0c8aafe9e6657f854f09d9ff3ec35877a3027220766b4b063bb70d0654';

// Debug: Log the JWT secret being used (first 10 chars for security)
console.log('JWT_SECRET being used:', JWT_SECRET.substring(0, 10) + '...');
console.log('JWT_SECRET length:', JWT_SECRET.length);
console.log('process.env.JWT_SECRET:', process.env.JWT_SECRET ? 'set' : 'not set');

// Verify JWT token middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    logger.warn('No token provided', { ip: req.ip, path: req.path });
    return res.status(401).json({
      success: false,
      error: {
        message: 'Access token required',
        code: 'TOKEN_REQUIRED'
      }
    });
  }

  try {
    // Debug logging
    logger.info('Attempting to verify token', {
      tokenLength: token.length,
      secretLength: JWT_SECRET.length,
      path: req.path
    });

    // Verify token using baseGeek's secret
    const decoded = jwt.verify(token, JWT_SECRET);

    // Add user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username
    };

    logger.info('Token verified successfully', {
      userId: req.user.id,
      path: req.path
    });

    next();
  } catch (error) {
    logger.warn('Invalid token', {
      error: error.message,
      errorName: error.name,
      tokenLength: token.length,
      ip: req.ip,
      path: req.path
    });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        }
      });
    }

    return res.status(403).json({
      success: false,
      error: {
        message: 'Invalid token',
        code: 'TOKEN_INVALID'
      }
    });
  }
};

// Optional authentication middleware (for public endpoints)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        id: decoded.id,
        email: decoded.email,
        username: decoded.username
      };
    } catch (error) {
      // Token is invalid, but we don't fail the request
      logger.debug('Optional auth failed', { error: error.message });
    }
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
};