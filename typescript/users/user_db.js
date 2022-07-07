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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_client_1 = require("../database/redis-client");
const expireDurationInMinutes = 10 * 60 || parseInt(process.env.REDIS_CACHE_EXPIRE_DURATION_IN_MINUTES, 10) * 60;
class User {
    constructor(db) {
        this.collection = db.collection('user');
        this.db = db;
        //Usernames have to be unique.
        this.users = [
            { _id: 1, username: 'admin', password: 'root' },
            { _id: 2, username: 'test1', password: 'test1' },
            { _id: 3, username: 'test2', password: 'test2' },
            { _id: 4, username: 'batu', password: '123' }
        ].map(v => Object.assign(v, { token: jsonwebtoken_1.default.sign(v, process.env.TOKEN_SECRET) }));
    }
    createUserCollectionIfNotExists() {
        return __awaiter(this, void 0, void 0, function* () {
            const collections = yield this.db
                .listCollections()
                .toArray();
            const collectionNames = collections
                .map((c) => c.name);
            if (collectionNames === undefined || collectionNames.length === 0) {
                yield this.db.createCollection("user");
                const options = { ordered: true };
                const result = yield this.collection.insertMany(this.users, options);
                console.log(`${result.insertedCount} user has been inserted to the database.`);
            }
        });
    }
    cacheUsersIntoRedis() {
        return __awaiter(this, void 0, void 0, function* () {
            this.users.forEach(x => {
                redis_client_1.redisClient.multi()
                    .set(`cache:user:${x.username}`, JSON.stringify(x))
                    .expire(`cache:user:${x.username}`, expireDurationInMinutes)
                    .exec();
            });
        });
    }
    authUser(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const redisResult = yield redis_client_1.redisClient.get(`cache:user:${username}`);
            if (redisResult === null) {
                let mongoResult = yield this.db.collection("user").findOne({ username: username, password: password });
                if (mongoResult !== null) {
                    yield redis_client_1.redisClient.multi()
                        .set(`cache:user:${mongoResult.username}`, JSON.stringify(mongoResult))
                        .expire(`cache:user:${mongoResult.username}`, expireDurationInMinutes)
                        .exec();
                    return true;
                }
                return false;
            }
            let redisResultJSON = JSON.parse(redisResult);
            redis_client_1.redisClient.expire(`cache:user:${redisResultJSON.username}`, expireDurationInMinutes);
            return redisResultJSON.username === username && redisResultJSON.password === password;
        });
    }
}
exports.default = User;
