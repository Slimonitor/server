const debug = require('debug')('slimonitor:frontHandlers');
const Health = require('../schema/health.js');
const Memcache = require('fast-memory-cache');
const config = require('../config.js');

/**
 * clientId => {list, loop}
 */
const subscriptions = new Memcache(); // todo: currently stored by clients in memory
const dataTypeHandlers = {
    'hostHealth': retrieveHealthData
};

/**
 * {timeline => {time => {host => {currentLoad, ...}}, hosts: [...]}
 * @todo: use number of records instead and ensure constant number frames in window
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
    const clientSubscriptions = subscriptions.get(client.id);
    if (clientSubscriptions && clientSubscriptions.loop) {
        clearInterval(clientSubscriptions.loop);
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
    clientSubscriptions.list.forEach(type => {
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
 * @param cb function to pass the list of active subscriptions
 */
function subscribeToUpdates(client, type, cb) {
    debug('Client subscribes to', type);
    let clientSubscriptions = subscriptions.get(client.id) || {
        list: [],
        loop: null
    };
    if (clientSubscriptions.list.indexOf(type) === -1) {
        clientSubscriptions.list = clientSubscriptions.list.concat([type]);
        if (clientSubscriptions.loop) {
            clearInterval(clientSubscriptions.loop);
        }
        clientSubscriptions.loop = setInterval(pushUpdate.bind(this, client), config.refreshRate);
        subscriptions.set(client.id, clientSubscriptions);
    }
    cb(clientSubscriptions.list);
}

module.exports = client => {
    debug('Frontend connected', client.id);
    client.on('subscribe', subscribeToUpdates.bind(this, client));
    client.on('disconnect', disconnectFront.bind(this, client));
};
