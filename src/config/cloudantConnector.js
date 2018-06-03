const Cloudant = require('@cloudant/cloudant');
const env = require('../.env');

module.exports.connectDb = () => {
    let db = prepare().db.use(env.DB_NAME);

    return db;
}

const prepare = () => {
    return new Cloudant(
        {
            url: env.COUCHDB_URI,
            plugins: [ 'promises' ]
        }
    );
}
