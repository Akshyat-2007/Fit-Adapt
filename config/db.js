require('dotenv').config();
const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'fitadapt';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_SSL = process.env.DB_SSL === 'true' || (DB_HOST !== 'localhost' && DB_HOST !== '127.0.0.1') || DATABASE_URL.includes('aivencloud.com');

let sequelize;
let dbDialect = 'mysql';

// Initialize Sequelize instance
async function initDatabase() {
  try {
    if (DATABASE_URL) {
      console.log('Connecting to MySQL via DATABASE_URL...');
      sequelize = new Sequelize(DATABASE_URL, {
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      });
    } else {
      // If remote cloud MySQL, ensure DB exists or connect directly
      if (!DB_SSL) {
        try {
          const connection = await mysql.createConnection({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD
          });
          await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
          await connection.end();
        } catch (e) {
          // In managed cloud databases, DB is pre-created and user may not have CREATE DATABASE permissions
        }
      }

      sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
        host: DB_HOST,
        port: DB_PORT,
        dialect: 'mysql',
        logging: false,
        dialectOptions: DB_SSL ? {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        } : {},
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      });
    }

    await sequelize.authenticate();
    console.log(`✓ Connected to MySQL database (${DB_NAME || 'remote'}) successfully.`);
    dbDialect = 'mysql';
    return sequelize;
  } catch (err) {
    console.warn(`! MySQL connection failed (${err.message}). Falling back to local SQLite database.`);

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

// Default instance reference
sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'fitadapt.sqlite'),
  logging: false
});

module.exports = {
  sequelize,
  initDatabase,
  getDialect: () => dbDialect
};
