const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports = mongoose.model('Health', {
    host: {type: mongoose.Schema.Types.ObjectId, ref: 'Host'},
    timestamp: {type: Date},
    mem: {type: Object},
    load: {type: Object}
});
