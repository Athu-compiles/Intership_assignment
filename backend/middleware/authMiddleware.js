const jwt = require('jsonwebtoken');
const env = require('../config/env');
const apiResponse = require('../utils/apiResponse');

/**
 * Authentication middleware.
 * - Extracts Bearer token from Authorization header
 * - Verifies JWT
 * - Attaches decoded payload to req.user
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return apiResponse(res, {
      statusCode: 401,
      success: false,
      message: 'Authorization token missing or malformed',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!env.jwtSecret) {
    return apiResponse(res, {
      statusCode: 500,
      success: false,
      message: 'JWT secret is not configured on the server',
    });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded;
    return next();
  } catch (error) {
    return apiResponse(res, {
      statusCode: 401,
      success: false,
      message: 'Invalid or expired token',
    });
  }
}

module.exports = authMiddleware;

