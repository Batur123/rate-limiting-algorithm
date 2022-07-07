require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/?retryWrites=true&w=majority`;
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
};

module.exports = (() => {
    let connectionInstance;
    let db;

    const getInstance = () => new Promise((resolve, reject) => {
        if (connectionInstance) {
            return resolve(connectionInstance);
        }

        MongoClient.connect(uri, options, (err, client) => {
            if (err) {
                return reject(err);
            }

            console.log("MongoDB connection established.");
            connectionInstance = client;
            db = client.db(process.env.MONGODB_DB_NAME);

            return resolve(connectionInstance);
        });
    });

    const getDb = () => {
        if (!db) {
            throw new Error("db object is not initialized!");
        }

        return db;
    };

    return {
        getInstance,
        getDb
    };
})();
