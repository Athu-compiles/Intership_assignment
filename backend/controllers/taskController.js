const { pool } = require('../config/db');
const apiResponse = require('../utils/apiResponse');

const ALLOWED_STATUSES = ['pending', 'completed'];

/**
 * Create a new task for the authenticated user.
 * POST /api/v1/tasks
 */
async function createTask(req, res, next) {
  const { title, description, status } = req.body || {};

  if (!title) {
    return apiResponse(res, {
      statusCode: 400,
      success: false,
      message: 'title is required',
    });
  }

  if (status && !ALLOWED_STATUSES.includes(status)) {
    return apiResponse(res, {
      statusCode: 400,
      success: false,
      message: `status must be one of: ${ALLOWED_STATUSES.join(', ')}`,
    });
  }

  const userId = req.user.id;

  try {
    const client = await pool.connect();

    try {
      const insertQuery = `
        INSERT INTO tasks (id, title, description, status, user_id)
        VALUES (gen_random_uuid(), $1, $2, COALESCE($3, 'pending'), $4)
        RETURNING id, title, description, status, user_id, created_at;
      `;

      const values = [title, description || null, status || null, userId];

      const { rows } = await client.query(insertQuery, values);
      const task = rows[0];

      return apiResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Task created successfully',
        data: { task },
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

/**
 * Get tasks with pagination.
 * - Users: only their own tasks
 * - Admin: all tasks
 * GET /api/v1/tasks
 */
async function getTasks(req, res, next) {
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const safePage = page > 0 ? page : 1;
  const safeLimit = limit > 0 && limit <= 100 ? limit : 10;
  const offset = (safePage - 1) * safeLimit;

  const isAdmin = req.user.role === 'admin';
  const userId = req.user.id;

  try {
    const client = await pool.connect();

    try {
      let countQuery = 'SELECT COUNT(*) AS total FROM tasks';
      let dataQuery =
        'SELECT id, title, description, status, user_id, created_at FROM tasks';
      const values = [];

      if (!isAdmin) {
        countQuery += ' WHERE user_id = $1';
        dataQuery += ' WHERE user_id = $1';
        values.push(userId);
      }

      dataQuery += ' ORDER BY created_at DESC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
      values.push(safeLimit, offset);

      const countResult = await client.query(countQuery, isAdmin ? [] : [userId]);
      const total = Number.parseInt(countResult.rows[0].total, 10) || 0;

      const dataResult = await client.query(dataQuery, values);
      const tasks = dataResult.rows;

      const totalPages = Math.ceil(total / safeLimit) || 1;

      return apiResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Tasks fetched successfully',
        data: {
          tasks,
          pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages,
          },
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

/**
 * Get a single task by id.
 * - Users: only their own task
 * - Admin: any task
 * GET /api/v1/tasks/:id
 */
async function getTaskById(req, res, next) {
  const { id } = req.params;
  const isAdmin = req.user.role === 'admin';
  const userId = req.user.id;

  try {
    const client = await pool.connect();

    try {
      const query = `
        SELECT id, title, description, status, user_id, created_at
        FROM tasks
        WHERE id = $1
        LIMIT 1;
      `;

      const { rows } = await client.query(query, [id]);

      if (rows.length === 0) {
        return apiResponse(res, {
          statusCode: 404,
          success: false,
          message: 'Task not found',
        });
      }

      const task = rows[0];

      if (!isAdmin && task.user_id !== userId) {
        return apiResponse(res, {
          statusCode: 403,
          success: false,
          message: 'You are not allowed to access this task',
        });
      }

      return apiResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Task fetched successfully',
        data: { task },
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

/**
 * Update a task.
 * - Users: only their own task
 * - Admin: any task
 * PUT /api/v1/tasks/:id
 */
async function updateTask(req, res, next) {
  const { id } = req.params;
  const { title, description, status } = req.body || {};
  const isAdmin = req.user.role === 'admin';
  const userId = req.user.id;

  if (!title && !description && !status) {
    return apiResponse(res, {
      statusCode: 400,
      success: false,
      message: 'At least one of title, description, or status must be provided',
    });
  }

  if (status && !ALLOWED_STATUSES.includes(status)) {
    return apiResponse(res, {
      statusCode: 400,
      success: false,
      message: `status must be one of: ${ALLOWED_STATUSES.join(', ')}`,
    });
  }

  try {
    const client = await pool.connect();

    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (title !== undefined) {
        fields.push(`title = $${paramIndex++}`);
        values.push(title);
      }
      if (description !== undefined) {
        fields.push(`description = $${paramIndex++}`);
        values.push(description);
      }
      if (status !== undefined) {
        fields.push(`status = $${paramIndex++}`);
        values.push(status);
      }

      let query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
      values.push(id);

      if (!isAdmin) {
        query += ` AND user_id = $${paramIndex + 1}`;
        values.push(userId);
      }

      query += ' RETURNING id, title, description, status, user_id, created_at;';

      const { rows } = await client.query(query, values);

      if (rows.length === 0) {
        return apiResponse(res, {
          statusCode: 404,
          success: false,
          message: 'Task not found or you are not allowed to modify it',
        });
      }

      const task = rows[0];

      return apiResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Task updated successfully',
        data: { task },
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

/**
 * Delete a task.
 * - Only admin can delete (enforced via route-level middleware)
 * DELETE /api/v1/tasks/:id
 */
async function deleteTask(req, res, next) {
  const { id } = req.params;

  try {
    const client = await pool.connect();

    try {
      const query = `
        DELETE FROM tasks
        WHERE id = $1
        RETURNING id;
      `;

      const { rows } = await client.query(query, [id]);

      if (rows.length === 0) {
        return apiResponse(res, {
          statusCode: 404,
          success: false,
          message: 'Task not found',
        });
      }

      return apiResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Task deleted successfully',
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
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};

