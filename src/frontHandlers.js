const debug = require('debug')('slimonitor:frontHandlers');
const Health = require('../schema/health.js');
const Memcache = require('fast-memory-cache');
const config = require('../config.js');

const subscriptions = new Memcache(); // todo: currenly stored by clients in memory
let healthLoop = null; // todo: example
const dataTypeHandlers = {
    'hostHealth': retrieveHealthData
};

/**
 * {timeline => {time => {host => {currentLoad, ...}}, hosts: [...]}
 * @returns {Promise}
 */
function retrieveHealthData() {
    let till = new Date();
    let from = new Date();
    from.setTime(from.getTime() - config.displayWindow);
    return Health.aggregate().match({ // limit display window
        '$and': [
            {'timestamp': {'$gte': from}},
            {'timestamp': {'$lte': till}}
        ]
    }).lookup({ // get information about hosts
        from: 'hosts',
        localField: 'host',
        foreignField: '_id',
        as: 'hostData'
    }).unwind('hostData').project({
        '_id': 0,
        'hostname': '$hostData.name',
        'currentLoad': '$load.currentload', // select required data
        'timestamp': '$timestamp'
    }).sort({'timestamp': 1}).exec().then(dump => { // sort can not be performed by mongo due to $push used
        let timeline = {};
        let hosts = [];
        dump.forEach(row => {
            let reducedDate = new Date(row.timestamp.setMilliseconds(0));
            if (timeline[reducedDate] === undefined) {
                timeline[reducedDate] = {};
            }
            if (timeline[reducedDate][row.hostname] === undefined) {
                timeline[reducedDate][row.hostname] = {
                    currentLoad: row.currentLoad
                };
            }
            if (hosts.indexOf(row.hostname) === -1) {
                hosts.push(row.hostname);
            }
        });
        return {timeline, hosts};
    });
}

function disconnectFront(client) {
    debug('Frontend disconnected', client.id);
    if (healthLoop) {
        clearInterval(healthLoop);
    }
}

/**
 * Refresh client data
 * @param client socket
 */
function pushUpdate(client) {
    debug('Polling update');
    let task = Promise.resolve({});
    const clientSubscriptions = subscriptions.get(client.id);
    if (!clientSubscriptions) {
        return;
    }
    const requestedTypes = Object.keys(clientSubscriptions);
    requestedTypes.forEach(type => {
        const handler = dataTypeHandlers[type];
        if (handler !== undefined) {
            task = task.then(updates => {
                return handler().then(data => {
                    return {
                        ...updates,
                        [type]: data
                    };
                });
            });
        }
    });
    task.then(updates => {
        client.emit('update', updates);
    }).catch(err => {
        debug(err.toString());
    });
}

/**
 * Subscribe to data feed
 * @param client socket
 * @param type string
 * @returns Promise
 */
function subscribeToUpdates(client, type, cb) {
    debug('Client subscribes to', type);
    subscriptions.set(client.id, {
        ...subscriptions.get(client.id),
        [type]: true
    });
    let list = subscriptions.get(client.id);
    if (Object.keys(list).length > 0) {
        debug('Setting up regular notifications'); // todo: example
        healthLoop = setInterval(pushUpdate.bind(this, client), config.refreshRate);
    }
    cb(list);
}

module.exports = client => {
    debug('Frontend connected', client.id);
    client.on('subscribe', subscribeToUpdates.bind(this, client));
    client.on('disconnect', disconnectFront.bind(this, client));
};
