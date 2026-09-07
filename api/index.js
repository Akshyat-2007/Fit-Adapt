// Force Vercel NFT bundler to trace and bundle mysql2 and ejs
require('mysql2');
require('ejs');

const app = require('../server');

module.exports = app;
