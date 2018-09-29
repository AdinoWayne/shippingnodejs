const fs = require('fs');
const Log = require('log');

const appendStream = fs.createWriteStream('server.log', { flags: 'a' });

const log = new Log('debug', appendStream);
module.exports = log;
