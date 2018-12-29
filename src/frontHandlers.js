const debug = require('debug')('slimonitor:frontHandlers');
const Health = require('../schema/health.js');
const Memcache = require('fast-memory-cache');
const config = require('../config.js');

const subscriptions = new Memcache(); // todo: currenly stored by clients in memory
const dataTypeHandlers = {
    'hostHealth': retrieveHealthData
};

/**
 * {type => [{
 *      hostname, values => [{
 *          axis, currentLoad
 *      }]
 * }]}
 * @returns {Promise}
 * @todo: simplify on node side?
 */
function retrieveHealthData() {
    let till = new Date();
    let from = new Date();
    from.setTime(from.getTime() - config.displayWindow);
    return Health.aggregate().match({ // limit time frame
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
        'hostname': '$hostData.name', // leave only name
        'currentLoad': '$load.currentload', // select required data
        'axis': { // prepare time to reduce accuracy to the seconds level
            'year': {'$year': '$timestamp'},
            'month': {'$month': '$timestamp'},
            'day': {'$dayOfMonth': '$timestamp'},
            'hour': {'$hour': '$timestamp'},
            'minute': {'$minute': '$timestamp'},
            'second': {'$second': '$timestamp'}
        }
    }).group({ // reduce accuracy to ensure consistency between hosts
        '_id': {
            'hostname': '$hostname',
            'axis': '$axis'
        },
        'currentLoad': {
            '$first': '$currentLoad'
        }
    }).group({ // final array of values
        '_id': '$_id.hostname',
        'values': {
            '$push': {
                'axis': '$_id.axis',
                'currentLoad': '$currentLoad'
            }
        }
    }).project({ // renames
        '_id': 0,
        'hostname': '$_id',
        'values': '$values'
    }).exec().then(result => { // sort can not be performed by mongo due to $push used
        result.forEach(hostLevel => hostLevel.values.sort((a, b) => {
            let aDate = new Date(a.axis.year, a.axis.month - 1, a.axis.day, a.axis.hour, a.axis.minute, a.axis.second);
            let bDate = new Date(b.axis.year, b.axis.month - 1, b.axis.day, b.axis.hour, b.axis.minute, b.axis.second);
            // dates can not be same due to group operation performed by mongo
            return aDate < bDate ? -1 : 1;
        }));
        return result;
    });
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
