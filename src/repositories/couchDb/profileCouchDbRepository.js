const dbConnector = require('../../config/couchDbConnector');
const utils = require('../../helpers/utils');

module.exports.getById = async (id) => {
    let db = dbConnector.connectDb();

    try {
        return await db.getAsync(id);
    } catch (err) {
        if (err && err.statusCode)
            if (err.statusCode == 404)
                return null;

        throw err;
    }
}

module.exports.getByCpf = async (cpf) => {
    let db = dbConnector.connectDb();

    try {
        let query = { "cpf": cpf };

        //TODO: (R) Descobrir como indexar corretamente (use_index: '_design/profiles')
        let result = await db.findAsync({ selector: query });

        return result.docs[0];
    } catch (err) {
        if (err && err.statusCode)
            if (err.statusCode == 404)
                return null;

        throw err;
    }
}

module.exports.getByCro = async (cro) => {
    let db = dbConnector.connectDb();

    try {
        let query = { "cro": cro };

        //TODO: (R) Descobrir como indexar corretamente (use_index: '_design/profiles')
        let result = await db.findAsync({ selector: query });

        return result.docs[0];
    } catch (err) {
        if (err && err.statusCode)
            if (err.statusCode == 404)
                return null;

        throw err;
    }
}

module.exports.insert = async (profile) => {
    let db = dbConnector.connectDb();

    profile._id = 'profile:' + utils.uuIDv4(true);

    try {
        return await db.insertAsync(profile);
    } catch (err) {
        // if (err && err.statusCode)
        //     if (err.statusCode == 404)
        //         return null;

        throw err;
    }
}

module.exports.update = async (profile) => {
    let db = dbConnector.connectDb();

    try {
        return await db.insertAsync(profile);
    } catch (err) {
        // if (err && err.statusCode)
        //     if (err.statusCode == 404)
        //         return null;

        throw err;
    }
}