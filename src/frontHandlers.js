const debug = require('debug')('slimonitor:frontHandlers');
const Health = require('../schema/health.js');

const dataTypeHandlers = {
    'hostHealth': retrieveHealthData
};

function retrieveHealthData() {
    return Health.aggregate().match({
        '$and': [ // todo - argument
            {'timestamp': {'$gte': new Date(Date.UTC(2018, 11, 27, 23, 0, 0))}},
            {'timestamp': {'$lte': new Date(Date.UTC(2018, 11, 27, 23, 6, 0))}}
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
    retrieveStoredData: (client) => {
        debug('Polling data');
        Promise.resolve().then(() => {
            const type = 'hostHealth'; // todo: example
            const handler = dataTypeHandlers[type];
            if (handler === undefined) {
                throw new Error('Unknown data type');
            }
            return handler();
        }).then(data => {
            client.emit('health', data);
        }).catch(err => {
            debug(err.toString());
        });
    }
};
