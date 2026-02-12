/**
 * Handle 404 for any route that wasn't matched above.
 */
function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
}

module.exports = notFound;

