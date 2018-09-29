
const express = require('express');
const bodyParser = require('body-parser');
const controller = require('./controllers/controllerApi');
const log = require('./logger');
const bodyParserError = require('bodyparser-json-error');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParserError.beautify());


app.post('/client/getquote', controller.controllerGetQuote);
app.post('/client/creatshipment', controller.controllerCreatShipment);
app.get('/client/getshipment', controller.controllerGetShipment);
app.delete('/client/deleteshipment', controller.controllerDeleteShipment);
app.listen(8000, () => {
  log.info('===================Server start===================');
});

module.exports = app;
