const debug = require('debug')('slimonitor:index');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const util = require('util');

const app = express();
const config = require('../config.js');
const apiHandlers = require('./apiHandlers.js');
const frontHandlers = require('./frontHandlers.js');

mongoose.Promise = global.Promise;
app.use(bodyParser.json({limit: '50mb'}));
app.post('/host/register', apiHandlers.registerHost);
app.post('/host/data', apiHandlers.collectIncomingData);
app.get('/data/:type', frontHandlers.retrieveStoredData);
app.use(errorHandler);

mongoose.connect(config.mongoDbUrl, config.mongooseOptions).then(() => {
    debug('Connected to MongoDb');
    return util.promisify(app.listen).call(app, config.port);
}).then(() => {
    debug('Start serving on port', config.port);
}).catch(err => {
    debug(err.toString());
});

function errorHandler(err, req, res, next) {
    if (err) {
        debug('ERROR', err.toString());
        res.json({
            error: true,
            message: err.toString()
        });
    } else {
        next();
    }
}
