const debug = require('debug')('slimonitor:index');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const util = require('util');

const app = express();
const config = require('../config.js');
const handlers = require('./handlers.js');

mongoose.Promise = global.Promise;
app.use(bodyParser.json({limit: '50mb'}));
app.post('/host/data', handlers.collectIncomingData);
app.use(handlers.catchError);


mongoose.connect(config.mongoDbUrl, config.mongooseOptions).then(() => {
    debug('Connected to MongoDb');
    return util.promisify(app.listen).bind(app)(config.port);
}).then(() => {
    debug('Start serving on port', config.port);
}).catch(err => {
    debug(err.toString());
});

