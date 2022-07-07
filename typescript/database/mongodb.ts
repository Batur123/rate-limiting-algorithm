import 'dotenv/config';
import {Db, MongoClient, ServerApiVersion} from "mongodb";

const uri : string = `mongodb+srv://${process.env.MONGODB_USERNAME!}:${process.env.MONGODB_PASSWORD!}@${process.env.MONGODB_CLUSTER!}/?retryWrites=true&w=majority`;
const options : object = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
};


let connectionInstance : MongoClient | undefined ;
let db : Db | undefined;

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
        db = client?.db(process.env.MONGODB_DB_NAME!);

        return resolve(connectionInstance);
    });
});

const getDb = () => {
    if (!db) {
        throw new Error("db object is not initialized!");
    }

    return db;
};

export {getDb,getInstance};
