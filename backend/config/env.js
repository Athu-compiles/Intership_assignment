const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env at the project root
dotenv.config({
  path: path.resolve(__dirname, '..', '.env'),
});

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 7000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
};

module.exports = env;

