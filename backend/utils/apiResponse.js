/**
 * Standard API response helper to keep responses consistent.
 *
 * @param {import('express').Response} res
 * @param {Object} options
 * @param {number} [options.statusCode=200]
 * @param {boolean} [options.success=true]
 * @param {string} [options.message='']
 * @param {any} [options.data]
 * @returns {import('express').Response}
 */
function apiResponse(res, { statusCode = 200, success = true, message = '', data } = {}) {
  const payload = { success, message };

  if (data !== undefined) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
}

module.exports = apiResponse;

