const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports = mongoose.model('Host', {
    name: {type: String, index: true},
    ip: {type: String},
    cpuInfo: {type: Object}
});
