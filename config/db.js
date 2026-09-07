require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize = null;
let dbDialect = 'mysql';

// Initialize Sequelize instance (lazy, safe for serverless and persistent servers)
async function initDatabase() {
  if (sequelize) return sequelize;

  const DATABASE_URL = process.env.DATABASE_URL || '';
  const DB_HOST = process.env.DB_HOST || '';
  const DB_USER = process.env.DB_USER || '';
  const DB_PASSWORD = process.env.DB_PASSWORD || '';
  const DB_NAME = process.env.DB_NAME || 'defaultdb';
  const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
  const isCloud = (DB_HOST && DB_HOST !== 'localhost' && DB_HOST !== '127.0.0.1') || DATABASE_URL.includes('aivencloud.com');

  // Priority 1: Cloud MySQL via DATABASE_URL or remote host (Aiven)
  if (DATABASE_URL || isCloud) {
    if (DATABASE_URL) {
      console.log('Connecting to Cloud MySQL via DATABASE_URL...');
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
      console.log(`Connecting to Cloud MySQL at ${DB_HOST}:${DB_PORT}/${DB_NAME}...`);
      sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
        host: DB_HOST,
        port: DB_PORT,
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
    }

    await sequelize.authenticate();
    console.log(`✓ Connected to MySQL database (${DB_NAME}) successfully.`);
    dbDialect = 'mysql';
    return sequelize;
  }

  // Priority 2: Local MySQL (if configured and running)
  if (DB_HOST === 'localhost' || DB_HOST === '127.0.0.1') {
    try {
      sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
        host: DB_HOST,
        port: DB_PORT,
        dialect: 'mysql',
        logging: false
      });
      await sequelize.authenticate();
      console.log(`✓ Connected to local MySQL successfully.`);
      dbDialect = 'mysql';
      return sequelize;
    } catch (localMySqlErr) {
      console.warn(`! Local MySQL connection failed (${localMySqlErr.message}).`);
    }
  }

  // Priority 3: Fallback to SQLite (Local development only, NEVER on Vercel)
  if (!process.env.VERCEL) {
    console.log('Falling back to local SQLite database for local offline development.');
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

  throw new Error('Database configuration missing on Vercel. Please set DB_HOST, DB_USER, DB_PASSWORD in Vercel settings.');
}

module.exports = {
  initDatabase,
  getDialect: () => dbDialect
};
