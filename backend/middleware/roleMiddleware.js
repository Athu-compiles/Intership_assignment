const apiResponse = require('../utils/apiResponse');

/**
 * Role-based authorization middleware.
 * Usage:
 *   router.get('/admin', authMiddleware, roleMiddleware('admin'), handler);
 *   router.get('/staff', authMiddleware, roleMiddleware(['admin', 'user']), handler);
 */
function roleMiddleware(requiredRole) {
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  return (req, res, next) => {
    const user = req.user;

    if (!user || !user.role) {
      return apiResponse(res, {
        statusCode: 403,
        success: false,
        message: 'Access forbidden: missing user role',
      });
    }

    if (!requiredRoles.includes(user.role)) {
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

