const debug = require('debug')('slimonitor:index');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const util = require('util');

const app = express();
const config = require('../config.js');
const handlers = require('./apiHandlers.js');

mongoose.Promise = global.Promise;
app.use(bodyParser.json({limit: '50mb'}));
app.post('/host/register', handlers.registerHost);
app.post('/host/data', handlers.collectIncomingData);
app.use(errorHandler);

mongoose.set('useFindAndModify', false); // todo: remove in production phase after mongo updates crud
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
