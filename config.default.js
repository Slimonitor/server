module.exports = {
    port: 80,
    mongoDbUrl: 'mongodb://<user>:<password>@<host>:<port>/<database>',
    mongooseOptions: {
        useNewUrlParser: true,
        useCreateIndex: true, // todo: remove after update
        useFindAndModify: false, // todo: remove after update
        keepAlive: 300000,
        connectTimeoutMS: 30000
    }
};
