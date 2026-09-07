require('dotenv').config();
const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const path = require('path');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'fitadapt';
const DB_PORT = process.env.DB_PORT || 3306;

let sequelize;
let dbDialect = 'mysql';

// Initialize Sequelize instance
async function initDatabase() {
  try {
    // Step 1: Try creating MySQL database if it doesn't exist
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await connection.end();

    // Step 2: Connect to MySQL with Sequelize
    sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      host: DB_HOST,
      port: DB_PORT,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });

    await sequelize.authenticate();
    console.log(`✓ Connected to MySQL database '${DB_NAME}' successfully.`);
    dbDialect = 'mysql';
    return sequelize;
  } catch (err) {
    console.warn(`! MySQL connection failed (${err.message}). Falling back to local SQLite database for zero-downtime development.`);
    console.warn(`! To use MySQL, ensure MySQL is running and set valid DB_PASSWORD in .env.`);

    // Fallback to SQLite so the app runs smoothly without blocking
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '..', 'fitadapt.sqlite'),
      logging: false
    });

    await sequelize.authenticate();
    console.log(`✓ Connected to local SQLite fallback database successfully.`);
    dbDialect = 'sqlite';
    return sequelize;
  }
}

// Instantiate default sequelize instance
sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false
});

module.exports = {
  sequelize,
  initDatabase,
  getDialect: () => dbDialect
};
