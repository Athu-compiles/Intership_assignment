const apiResponse = require('../utils/apiResponse');

/**
 * Role-based authorization middleware.
 * Usage: router.get('/admin', authMiddleware, roleMiddleware('admin'), handler);
 */
function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    const user = req.user;

    if (!user || !user.role) {
      return apiResponse(res, {
        statusCode: 403,
        success: false,
        message: 'Access forbidden: missing user role',
      });
    }

    if (user.role !== requiredRole) {
      return apiResponse(res, {
        statusCode: 403,
        success: false,
        message: 'Access forbidden: insufficient permissions',
      });
    }

    return next();
  };
}

module.exports = roleMiddleware;

