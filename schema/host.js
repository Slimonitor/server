const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports = mongoose.model('Host', {
    name: {type: String, index: true},
    hostname: {type: String},
    description: {type: String},
    cluster: {type: String},
    ip: {type: String},
    cpuInfo: {type: Object}
});
