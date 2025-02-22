import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Check required environment variable
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in the environment variables.");
}

// Parse the DATABASE_URL to extract connection details
const url = new URL(process.env.DATABASE_URL);
const dbConfig = {
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.replace(/^\//, ''), // Remove leading slash
  port: Number(url.port) || 3306 // Default to 3306 if port is not specified
};

const pool = mysql.createPool(dbConfig);

// Export the pool to use in other parts of your application
export { pool };