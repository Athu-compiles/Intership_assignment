const env = require('../config/env');

/**
 * Global error handling middleware.
 * Ensures all errors return a consistent JSON structure.
 */
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  const responseBody = {
    success: false,
    message,
  };

  if (env.nodeEnv === 'development' && err.stack) {
    responseBody.stack = err.stack;
  }

  // Basic logging; in production you might plug in a real logger
  console.error(err);

  res.status(statusCode).json(responseBody);
}

module.exports = errorHandler;

