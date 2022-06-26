require('dotenv').config();
const cluster = require("cluster");
const totalCPUs = require("os").cpus().length;
const {getInstance,getDb} = require('./database/mongodb.js');
const {connectToRedis} = require('./database/redis-client.js');
const express = require('express');
const port = process.env.PORT || 8080;

if(cluster.isMaster) {
    console.log(`CPU Number: ${totalCPUs} - Master ${process.pid} is running`);

    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker number -> ${worker.process.pid} died.`);
        cluster.fork();
    });
} else {
    const app = express();

    getInstance().then(async () => {
        await connectToRedis();

        const UserDB = require('./users/user_db.js');
        const User = new UserDB(getDb())
        await User.createUserCollectionIfNotExists();
        await User.cacheUsersIntoRedis();

        const publicRoutes = require('./routes/public_routes.js');
        const privateRoutes = require('./routes/private_routes.js');

        app.use(express.urlencoded({extended: true}))
        app.use(publicRoutes);
        app.use(privateRoutes);

        app.listen(port, () => {
            console.log(`Server started on port: ${port}`)
        });
    });
}