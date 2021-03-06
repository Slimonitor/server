const debug = require('debug')('slimonitor:index');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const util = require('util');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const config = require('../config.js');
const apiHandlers = require('./apiHandlers.js');
const frontHandlers = require('./frontHandlers.js');

mongoose.Promise = global.Promise;
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.static('static', {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['html', 'js']
}));
app.post('/host/register', apiHandlers.registerHost);
app.post('/host/data', apiHandlers.collectIncomingData);
io.on('connection', frontHandlers);
app.use(errorHandler);

mongoose.connect(config.mongoDbUrl, config.mongooseOptions).then(() => {
    debug('Connected to MongoDb');
    return util.promisify(server.listen).call(server, config.listen);
}).then(() => {
    debug('Started serving on', config.listen);
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
