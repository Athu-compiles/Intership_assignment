const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { testConnection, initializeDatabase } = require('./config/db');

const server = http.createServer(app);

async function startServer() {
  try {
    // Ensure the database is reachable
    await testConnection();

    // Initialize required tables
    await initializeDatabase();

    server.listen(env.port, () => {
      console.log(
        `Server is running on port ${env.port} in ${env.nodeEnv} mode`,
      );
    });
  } catch (error) {
    console.error('Failed to start server due to database error:', error);
    process.exit(1);
  }
}

startServer();

module.exports = server;

