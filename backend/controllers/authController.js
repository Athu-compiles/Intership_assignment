const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const env = require('../config/env');
const apiResponse = require('../utils/apiResponse');

const SALT_ROUNDS = 10;

/**
 * POST /api/v1/auth/register
 */
async function register(req, res, next) {
  const { name, email, password, role } = req.body || {};

  // Basic validation
  if (!name || !email || !password) {
    return apiResponse(res, {
      statusCode: 400,
      success: false,
      message: 'name, email and password are required',
    });
  }

  try {
    const client = await pool.connect();

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Insert user
      const insertQuery = `
        INSERT INTO users (id, name, email, password, role)
        VALUES (gen_random_uuid(), $1, $2, $3, COALESCE($4, 'user'))
        RETURNING id, name, email, role, created_at;
      `;

      const values = [name, email, hashedPassword, role];

      const { rows } = await client.query(insertQuery, values);
      const user = rows[0];

      return apiResponse(res, {
        statusCode: 201,
        success: true,
        message: 'User registered successfully',
        data: { user },
      });
    } catch (error) {
      // Handle duplicate email (unique violation)
      if (error.code === '23505') {
        return apiResponse(res, {
          statusCode: 409,
          success: false,
          message: 'Email already registered',
        });
      }
      return next(error);
    } finally {
      client.release();
    }
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/v1/auth/login
 */
async function login(req, res, next) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return apiResponse(res, {
      statusCode: 400,
      success: false,
      message: 'email and password are required',
    });
  }

  try {
    const client = await pool.connect();

    try {
      const findUserQuery = `
        SELECT id, name, email, password, role
        FROM users
        WHERE email = $1
        LIMIT 1;
      `;

      const { rows } = await client.query(findUserQuery, [email]);

      if (rows.length === 0) {
        return apiResponse(res, {
          statusCode: 401,
          success: false,
          message: 'Invalid credentials',
        });
      }

      const user = rows[0];

      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return apiResponse(res, {
          statusCode: 401,
          success: false,
          message: 'Invalid credentials',
        });
      }

      if (!env.jwtSecret) {
        return apiResponse(res, {
          statusCode: 500,
          success: false,
          message: 'JWT secret is not configured on the server',
        });
      }

      const tokenPayload = {
        id: user.id,
        role: user.role,
      };

      const token = jwt.sign(tokenPayload, env.jwtSecret, {
        expiresIn: '1h',
      });

      // Do not return password
      delete user.password;

      return apiResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Login successful',
        data: {
          token,
          user,
        },
      });
    } catch (error) {
      return next(error);
    } finally {
      client.release();
    }
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
};

