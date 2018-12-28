const debug = require('debug')('slimonitor:frontHandlers');
const Health = require('../schema/health.js');
const Memcache = require('fast-memory-cache');
const config = require('../config.js');

const subscriptions = new Memcache(); // todo: currenly stored by clients in memory
const dataTypeHandlers = {
    'hostHealth': retrieveHealthData
};

function retrieveHealthData() {
    let till = new Date();
    let from = new Date();
    from.setTime(from.getTime() - config.displayWindow);
    return Health.aggregate().match({
        '$and': [ // todo - argument
            {'timestamp': {'$gte': from}},
            {'timestamp': {'$lte': till}}
        ]
    }).lookup({
        from: 'hosts',
        localField: 'host',
        foreignField: '_id',
        as: 'hostData'
    }).unwind('hostData').project({
        '_id': 0,
        'hostname': '$hostData.name',
        'currentLoad': '$load.currentload',
        'timestamp': 1
    }).sort({
        'timestamp': 1
    }).exec();
}

module.exports = {
    /**
     * Subscribe to data feed
     * @param client socket
     * @param type string
     * @param cb function to return all current subscriptions
     */
    subscribeToUpdates: (client, type, cb) => {
        debug('Client subscribes to', type);
        subscriptions.set(client.id, {
            ...subscriptions.get(client.id),
            [type]: true
        });
        cb(subscriptions.get(client.id));
    },
    /**
     * Refresh client data
     * @param client socket
     */
    pushUpdate: (client) => {
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
};
