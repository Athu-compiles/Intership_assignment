const express = require('express');
const cors = require('cors');

// Ensure environment variables are loaded
const env = require('./config/env');

const apiRoutes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Core middlewares
app.use(
  cors({
    origin:
      env.nodeEnv === 'development'
        ? ['http://localhost:5173', 'http://localhost:3000']
        : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json());

// API routes
app.use('/api/v1', apiRoutes);

// 404 handler
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;

