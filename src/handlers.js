const utils = require('./utils.js');
const debug = require('debug')('slimonitor:handlers');

/**
 * Filters message data according to message type
 * @param message object
 * @returns object message with filtered data
 * @throws Error when unknown message type
 */
function filterSignificantMessageData(message) {
    let filteredMessage = utils.filterObjectKeys(message, ['type', 'timestamp', 'data']);
    switch (filteredMessage.type) {
        case 'hostHeath':
            filteredMessage.data = utils.filterObjectKeys(message.data, ['cpuInfo', 'mem', 'load']);
            break;
        default:
            throw new Error('Unknown message type');
    }
    return filteredMessage;
}

module.exports = {
    collectIncomingData: (req, res) => {
        const hostName = req.body.host;
        const messages = req.body.messages.map(message => {
            try {
                return filterSignificantMessageData(message);
            } catch (error) {
                return null;
            }
        }).filter(msg => msg);
        debug('got', messages.length, 'messages from', hostName);
        res.json({
            error: false,
            message: 'OK'
        });
    },
    catchError: (err, req, res, next) => {
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
};
