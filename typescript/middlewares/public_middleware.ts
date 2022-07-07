"use strict";
import 'dotenv/config';
import {NextFunction, Request, Response} from "express";

const {redisClient} = require("../database/redis-client");
const expireDurationInSeconds: number = parseInt(process.env.RATE_LIMIT_DURATION_IN_MINUTES_FOR_IP!,10) * 60;
const maximumAllowedRequest: number = parseInt(process.env.RATE_LIMIT_FOR_IP!,10);

/**
 * Rate-Limiter for Public routes by IP Address
 * @param requestWeight
 * @returns {(function(*, *, *): void)|*}
 */
export const rateLimitingMiddleware = (requestWeight: number) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const ip: any = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        const result: [any, any, any] = await redisClient.multi()
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
                maximumLimitForThisRoute: parseInt(process.env.RATE_LIMIT_FOR_IP!, 10),
                routeWeight: requestWeight,
                totalWeightUsed: requests,
                msg: 'You have exceed the rate limit',
                limitWillExceedInSeconds: ttl,
            });
        }

        return next();
    }
}