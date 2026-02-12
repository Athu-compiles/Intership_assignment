const { Pool } = require('pg');
const env = require('./env');

let pool = null;

if (!env.databaseUrl) {
  console.warn(
    'DATABASE_URL is not set. Skipping PostgreSQL pool creation; server startup will fail when DB is required.',
  );
} else {
  // Create a connection pool using DATABASE_URL
  pool = new Pool({
    connectionString: env.databaseUrl,
    // Optionally enable SSL for production deployments:
    // ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
  });
}

/**
 * Simple connectivity check to verify the database is reachable.
 */
async function testConnection() {
  try {
    if (!pool) {
      throw new Error(
        'DATABASE_URL is not configured. Set it in your .env file before starting the server.',
      );
    }
    await pool.query('SELECT 1');
    console.log('PostgreSQL connection successful.');
  } catch (error) {
    console.error('PostgreSQL connection failed:', error);
    throw error;
  }
}

/**
 * Initialize database tables if they do not exist.
 * Currently ensures the `users` and `tasks` tables are present.
 */
async function initializeDatabase() {
  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name VARCHAR NOT NULL,
      email VARCHAR UNIQUE NOT NULL,
      password VARCHAR NOT NULL,
      role VARCHAR CHECK (role IN ('user', 'admin')) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createTasksTableQuery = `
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY,
      title VARCHAR NOT NULL,
      description TEXT,
      status VARCHAR CHECK (status IN ('pending','completed')) DEFAULT 'pending',
      user_id UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  if (!pool) {
    throw new Error(
      'DATABASE_URL is not configured. Cannot initialize database tables.',
    );
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(createUsersTableQuery);
    await client.query(createTasksTableQuery);
    await client.query('COMMIT');
    console.log('Database tables initialized (users, tasks).');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  testConnection,
  initializeDatabase,
};

