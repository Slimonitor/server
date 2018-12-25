module.exports = {
    port: 80,
    mongoDbUrl: 'mongodb://<user>:<password>@<host>:<port>/<database>',
    mongooseOptions: {
        useNewUrlParser: true,
        keepAlive: 300000,
        connectTimeoutMS: 30000
    }
};
