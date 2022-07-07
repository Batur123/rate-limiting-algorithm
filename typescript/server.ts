import 'dotenv/config';
import cluster from "cluster";
import os from "os";
import {getDb, getInstance} from "./database/mongodb";
import {connectToRedis} from "./database/redis-client";
import User from "./users/user_db";
import express, {Express} from "express";

const totalCPUs : number = os.cpus().length;
const port: number = parseInt(process.env.PORT!,10) || 8080;

(async () => {
    if (cluster.isMaster) {
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

        await getInstance();
        await connectToRedis();

        const user = new User(getDb())
        await user.createUserCollectionIfNotExists();
        await user.cacheUsersIntoRedis();

        const publicRoutes = require('./routes/public_routes.ts');
        const privateRoutes = require('./routes/private_routes.ts');

        app.use(express.urlencoded({extended: true}))
        app.use(publicRoutes);
        app.use(privateRoutes);

        app.listen(port, () => {
            console.log(`Server started on port: ${port}`)
        });
    }
})();
