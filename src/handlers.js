const debug = require('debug')('slimonitor:handlers');

module.exports = {
    collectIncomingData: (req, res) => {
        debug('got data', req.body);
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
