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
exports.rateLimitingMiddleware = void 0;
require("dotenv/config");
const { redisClient } = require("../database/redis-client");
const expireDurationInSeconds = parseInt(process.env.RATE_LIMIT_DURATION_IN_MINUTES_FOR_IP, 10) * 60;
const maximumAllowedRequest = parseInt(process.env.RATE_LIMIT_FOR_IP, 10);
/**
 * Rate-Limiter for Public routes by IP Address
 * @param requestWeight
 * @returns {(function(*, *, *): void)|*}
 */
const rateLimitingMiddleware = (requestWeight) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const result = yield redisClient.multi()
            .get(ip)
            .incrBy(ip, requestWeight)
            .ttl(ip)
            .exec();
        const [prevValue, requests, ttl] = result;
        if ((requests > 1 && ttl < 0) || prevValue === null) {
            redisClient.expire(ip, expireDurationInSeconds);
        }
        if (requests > maximumAllowedRequest) {
            return res.status(503).json({
                response: 'Error',
                maximumLimitForThisRoute: parseInt(process.env.RATE_LIMIT_FOR_IP, 10),
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
