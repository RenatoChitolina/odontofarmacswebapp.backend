const nano = require('nano');
const bluebird = require('bluebird');
const env = require('../.env');

module.exports.connectDb = () => {
    let db = prepare().db.use(env.DB_NAME);

    bluebird.promisifyAll(db)

    return db;
}

const prepare = () => {
    return nano(env.COUCHDB_URI);
}