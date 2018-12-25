const debug = require('debug')('slimonitor:index');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const config = require('../config.js');
const handlers = require('./handlers.js');

app.use(bodyParser.json());
app.post('/host/data', handlers.collectIncomingData);
app.use(handlers.catchError);

app.listen(config.port, () => {
    debug('Start serving on port', config.port);
});

