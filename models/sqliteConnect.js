const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const log = require('../logger');

const filePath = path.join(__dirname, 'final.db');

module.exports = new sqlite3.Database(filePath, (err) => {
  if (err) {
    log.error(err.message);
  }
  log.info('Connected to the in-memory SQlite database.');
});

