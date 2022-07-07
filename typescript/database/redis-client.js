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
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToRedis = exports.redisClient = void 0;
require("dotenv/config");
const redis = require('redis');
const client = redis.createClient(`${process.env.REDIS_HOST_NAME}:${process.env.REDIS_PORT}`, { onlyMaster: false });
exports.redisClient = client;
client.on('error', (err) => console.log('Redis Client Error', err));
const connectToRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    yield client.connect();
});
exports.connectToRedis = connectToRedis;
