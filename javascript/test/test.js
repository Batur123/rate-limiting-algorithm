/*
const publicRoutes = require('../routes/public_routes.js');
const privateRoutes = require('../routes/private_routes.js');
const {MongoClient, ServerApiVersion} = require('mongodb');

const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/?retryWrites=true&w=majority`;
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
};

describe('Test Handlers', function () {

    let connection;
    let db;

    beforeAll(async () => {
        connection = await MongoClient.connect(uri,options)
        db = await connection.db(process.env.MONGODB_DB_NAME);
    });

    afterAll(async () => {
        await connection.close();
    });

    test('responds to /private', () => {
        const req = { body: {username:"admin",password:"root"} };

        const res = { text: '',
            send: function(input) { this.text = input }
        };
        privateRoutes(req, res);

        expect(res.text).toEqual('hello world!');
    });
});
*/