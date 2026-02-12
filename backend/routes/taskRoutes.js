const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const taskController = require('../controllers/taskController');

const router = express.Router();

// All task routes require authentication
router.use(authMiddleware);

// POST /api/v1/tasks
router.post('/', taskController.createTask);

// GET /api/v1/tasks
router.get('/', taskController.getTasks);

// GET /api/v1/tasks/:id
router.get('/:id', taskController.getTaskById);

// PUT /api/v1/tasks/:id
router.put('/:id', taskController.updateTask);

// DELETE /api/v1/tasks/:id - only admin
router.delete('/:id', roleMiddleware('admin'), taskController.deleteTask);

module.exports = router;

