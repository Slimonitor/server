const assert = require('assert');
const debug = require('debug')('slimonitor:handlers');
const Memcache = require('fast-memory-cache');
const utils = require('./utils.js');
const Host = require('../schema/host.js');

const knownHosts = new Memcache();

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
            filteredMessage.data = utils.filterObjectKeys(message.data, ['mem', 'load']);
            break;
        default:
            throw new Error('Unknown message type');
    }
    return filteredMessage;
}

module.exports = {
    registerHost: (req, res) => {
        Promise.resolve().then(() => {
            assert.ok(req.body.name, 'Argument name is not defined');
            assert.ok(typeof(req.body.name) === 'string', 'Argument name must be a string');
            assert.ok(req.body.cpuInfo, 'Argument cpuInfo is not defined');
            assert.ok(typeof(req.body.cpuInfo) === 'object', 'Argument cpuInfo must be an object');
        }).then(() => {
            return Host.findOneAndUpdate(
                {name: req.body.name},
                {ip: req.ip, cpuInfo: req.body.cpuInfo},
                {new: true}
            );
        }).then(host => {
            if (host) {
                return {host: host, isNew: false};
            }
            host = new Host({
                name: req.body.name,
                ip: req.ip,
                cpuInfo: req.body.cpuInfo
            });
            return {host: host.save(), isNew: true};
        }).then(({host, isNew}) => {
            knownHosts.set(host._id, true);
            debug(isNew ? 'Registered new host' : 'Known host', host);
            res.json({
                error: false,
                message: host._id
            });
        }).catch(err => {
            res.json({
                error: true,
                message: err.toString()
            });
        });
    },
    collectIncomingData: (req, res) => {
        Promise.resolve().then(() => {
            assert.ok(req.body.hostId, 'Argument hostId is not defined');
            assert.ok(typeof(req.body.hostId) === 'string', 'Argument hostId must be a string');
            return true;
        }).then(() => {
            return knownHosts.get(req.body.hostId) ? Promise.resolve(req.body.hostId) :
                Host.findById(req.body.hostId).exec().then(host => {
                    if (!host) {
                        throw new Error('Host is not registered');
                    }
                    return host._id;
                });
        }).then(hostId => {
            const messages = req.body.messages.map(message => {
                try {
                    return filterSignificantMessageData(message);
                } catch (error) {
                    return null;
                }
            }).filter(msg => msg);
            debug('got', messages.length, 'messages from', hostId);
            res.json({
                error: false,
                message: 'OK'
            });
        }).catch(err => {
            res.json({
                error: true,
                message: err.toString()
            });
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
