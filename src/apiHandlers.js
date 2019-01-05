const assert = require('assert');
const debug = require('debug')('slimonitor:apiHandlers');
const Memcache = require('fast-memory-cache');
const utils = require('./utils.js');
const Host = require('../schema/host.js');
const Health = require('../schema/health.js');

const knownHosts = new Memcache();
const messageTypes = {
    'hostHealth': {
        keys: ['mem', 'load'],
        handler: handleHealthData
    }
};

/**
 * Filters message data according to message type
 * @param message object
 * @returns object message with filtered data
 * @throws Error when unknown message type
 */
function filterSignificantMessageData(message) {
    let filteredMessage = utils.filterObjectKeys(message, ['type', 'timestamp', 'data']);
    if (messageTypes[filteredMessage.type] === undefined) {
        throw new Error('Unknown message type');
    }
    if (messageTypes[filteredMessage.type].keys) {
        filteredMessage.data = utils.filterObjectKeys(message.data, messageTypes[filteredMessage.type].keys);
    }
    return filteredMessage;
}

/**
 * Groups messages by type
 * @param messages array of objects
 * @returns object type => [messages]
 */
function groupMessagesByType(messages) {
    let groups = {};
    messages.forEach(message => {
        if (message.type in groups) {
            groups[message.type].push(message);
        } else {
            groups[message.type] = [message];
        }
    });
    return groups;
}

/**
 * Save host health data in database
 * @param hostId string
 * @param messages array of objects
 */
function handleHealthData(hostId, messages) {
    return Health.insertMany(messages.map(message => {
        return {
            host: hostId,
            timestamp: message.timestamp,
            mem: message.data.mem,
            load: message.data.load
        };
    }));
}

module.exports = {
    registerHost: (req, res) => {
        Promise.resolve().then(() => {
            assert.ok(req.body.host.name, 'Argument host.name is not defined');
            assert.ok(typeof(req.body.host.name) === 'string', 'Argument host.name must be a string');
            assert.ok(req.body.host.hostname, 'Argument host.hostname is not defined');
            assert.ok(typeof(req.body.host.hostname) === 'string', 'Argument host.hostname must be a string');
            assert.ok(req.body.host.description, 'Argument host.description is not defined');
            assert.ok(typeof(req.body.host.description) === 'string', 'Argument host.description must be a string');
            assert.ok(req.body.host.cluster, 'Argument host.cluster is not defined');
            assert.ok(typeof(req.body.host.cluster) === 'string', 'Argument host.cluster must be a string');
            assert.ok(req.body.cpuInfo, 'Argument cpuInfo is not defined');
            assert.ok(typeof(req.body.cpuInfo) === 'object', 'Argument cpuInfo must be an object');
        }).then(() => {
            return Host.findOneAndUpdate(
                {name: req.body.name},
                {
                    ip: req.ip,
                    cpuInfo: req.body.cpuInfo,
                    hostname: req.body.host.hostname,
                    description: req.body.host.description,
                    cluster: req.body.host.cluster
                },
                {new: true}
            );
        }).then(host => {
            if (host) {
                return {host: host, isNew: false};
            }
            host = new Host({
                name: req.body.host.name,
                hostname: req.body.host.hostname,
                description: req.body.host.description,
                cluster: req.body.host.cluster,
                ip: req.ip,
                cpuInfo: req.body.cpuInfo
            });
            return host.save().then(document => ({host: document, isNew: true}));
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
            debug('Received', req.body.messages.length, 'messages from', hostId);
            return {
                hostId: hostId,
                groupsOfMessages: groupMessagesByType(req.body.messages.map(message => {
                    try {
                        return filterSignificantMessageData(message);
                    } catch (error) {
                        return null;
                    }
                }).filter(msg => msg))
            };
        }).then(({hostId, groupsOfMessages}) => {
            return Promise.all(Object.keys(groupsOfMessages).map(messageType => {
                const messages = groupsOfMessages[messageType];
                messageTypes[messageType].handler(hostId, messages);
            }));
        }).then(() => {
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
    }
};
