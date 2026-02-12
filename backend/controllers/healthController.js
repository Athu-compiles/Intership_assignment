const apiResponse = require('../utils/apiResponse');

/**
 * GET /api/v1/health
 */
function getHealth(req, res, next) {
  return apiResponse(res, {
    statusCode: 200,
    success: true,
    message: 'API is running',
  });
}

module.exports = {
  getHealth,
};

