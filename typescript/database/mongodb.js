"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstance = exports.getDb = void 0;
require("dotenv/config");
const mongodb_1 = require("mongodb");
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/?retryWrites=true&w=majority`;
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: mongodb_1.ServerApiVersion.v1
};
let connectionInstance;
let db;
const getInstance = () => new Promise((resolve, reject) => {
    if (connectionInstance) {
        return resolve(connectionInstance);
    }
    mongodb_1.MongoClient.connect(uri, options, (err, client) => {
        if (err) {
            return reject(err);
        }
        console.log("MongoDB connection established.");
        connectionInstance = client;
        db = client === null || client === void 0 ? void 0 : client.db(process.env.MONGODB_DB_NAME);
        return resolve(connectionInstance);
    });
});
exports.getInstance = getInstance;
const getDb = () => {
    if (!db) {
        throw new Error("db object is not initialized!");
    }
    return db;
};
exports.getDb = getDb;
