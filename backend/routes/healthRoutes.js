const express = require('express');
const healthController = require('../controllers/healthController');

const router = express.Router();

// GET /api/v1/health
router.get('/', healthController.getHealth);

module.exports = router;

