"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
const mongodb_1 = require("./database/mongodb");
const redis_client_1 = require("./database/redis-client");
const user_db_1 = __importDefault(require("./users/user_db"));
const express_1 = __importDefault(require("express"));
const totalCPUs = os_1.default.cpus().length;
const port = parseInt(process.env.PORT, 10) || 8080;
(() => __awaiter(void 0, void 0, void 0, function* () {
    if (cluster_1.default.isMaster) {
        console.log(`CPU Number: ${totalCPUs} - Master ${process.pid} is running`);
        for (let i = 0; i < totalCPUs; i++) {
            cluster_1.default.fork();
        }
        cluster_1.default.on("exit", (worker, code, signal) => {
            console.log(`Worker number -> ${worker.process.pid} died.`);
            cluster_1.default.fork();
        });
    }
    else {
        const app = (0, express_1.default)();
        yield (0, mongodb_1.getInstance)();
        yield (0, redis_client_1.connectToRedis)();
        const user = new user_db_1.default((0, mongodb_1.getDb)());
        yield user.createUserCollectionIfNotExists();
        yield user.cacheUsersIntoRedis();
        const publicRoutes = require('./routes/public_routes.ts');
        const privateRoutes = require('./routes/private_routes.ts');
        app.use(express_1.default.urlencoded({ extended: true }));
        app.use(publicRoutes);
        app.use(privateRoutes);
        app.listen(port, () => {
            console.log(`Server started on port: ${port}`);
        });
    }
}))();
