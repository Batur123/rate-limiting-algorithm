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
exports.rateLimitingMiddleware = exports.authMiddleware = void 0;
require("dotenv/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_client_1 = require("../database/redis-client");
const mongodb_1 = require("../database/mongodb");
const user_db_1 = __importDefault(require("../users/user_db"));
const user = new user_db_1.default((0, mongodb_1.getDb)());
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req === null || req === void 0 ? void 0 : req.headers["authorization"]) === null || _a === void 0 ? void 0 : _a.split("Bearer")[1].trim();
    const { username, password } = req === null || req === void 0 ? void 0 : req.query;
    res.locals.token = token;
    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    if (!username || !password) {
        return res.status(403).send("Username of password required for authentication");
    }
    // remove empty options brackets if doesn't works
    jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET, {}, (err, result) => {
        if (err) {
            return res.status(401).send("Invalid Token");
        }
        if (result.username !== username && result.password !== password) {
            return res.status(401).send("Your token and credentials are not matching.");
        }
        user.authUser(String(username), String(password)).then(result => {
            return result ? next() : res.status(401).send("Wrong username or password.");
        });
    });
});
exports.authMiddleware = authMiddleware;
const expireDurationInSeconds = parseInt(process.env.RATE_LIMIT_DURATION_IN_MINUTES_FOR_TOKEN, 10) * 60;
const maximumAllowedRequest = parseInt(process.env.RATE_LIMIT_FOR_TOKEN, 10);
/*
const rateLimitingMiddlewareThen = (requestWeight) => {
    return (req, res, next) => {
        const token = res.locals.token;

        redisClient.multi()
            .get(token)
            .incrBy(token, requestWeight)
            .ttl(token)
            .exec()
            .then(result => {
                const [prevValue, requests, ttl] = result;

                if ((requests > 1 && ttl < 0) || prevValue === null) {
                    redisClient.expire(token, expireDurationInSeconds);
                }

                if (requests > maximumAllowedRequest) {
                    return res.status(503).json({
                        response: 'Error',
                        maximumLimitForThisRoute: parseInt(process.env.RATE_LIMIT_FOR_TOKEN),
                        routeWeight: parseInt(requestWeight),
                        totalWeightUsed: requests,
                        msg: 'You have exceed the rate limit',
                        limitWillExceedInSeconds: ttl,
                    });
                }

                return next();
            });
    }
}
*/
const rateLimitingMiddleware = (requestWeight) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const token = res.locals.token;
        const [prevValue, requests, ttl] = yield redis_client_1.redisClient.multi()
            .get(token)
            .incrBy(token, requestWeight)
            .ttl(token)
            .exec();
        if ((requests > 1 && ttl < 0) || prevValue === null) {
            redis_client_1.redisClient.expire(token, expireDurationInSeconds);
        }
        if (requests > maximumAllowedRequest) {
            return res.status(503).json({
                response: 'Error',
                maximumLimitForThisRoute: parseInt(process.env.RATE_LIMIT_FOR_TOKEN, 10),
                routeWeight: requestWeight,
                totalWeightUsed: requests,
                msg: 'You have exceed the rate limit',
                limitWillExceedInSeconds: ttl,
            });
        }
        return next();
    });
};
exports.rateLimitingMiddleware = rateLimitingMiddleware;
