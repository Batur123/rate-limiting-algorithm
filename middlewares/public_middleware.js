"use strict";
require('dotenv').config()
const {redisClient} = require("../database/redis-client");
const expireDurationInSeconds = process.env.RATE_LIMIT_DURATION_IN_MINUTES_FOR_IP * 60;
const maximumAllowedRequest = process.env.RATE_LIMIT_FOR_IP;

/**
 * Rate-Limiter for Public routes by IP Address
 * @param requestWeight
 * @returns {(function(*, *, *): void)|*}
 */
const rateLimitingMiddleware = (requestWeight) => {
    return (req, res, next) => {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        redisClient.multi()
            .get(ip)
            .incrBy(ip, requestWeight)
            .ttl(ip)
            .exec()
            .then(result => {
                const [prevValue,requests, ttl] = result;

                if ((requests > 1 && ttl < 0) || prevValue === null) {
                    redisClient.expire(ip, expireDurationInSeconds);
                }

                if (requests > maximumAllowedRequest) {
                    return res.status(503).json({
                        response: 'Error',
                        maximumLimitForThisRoute: parseInt(process.env.RATE_LIMIT_FOR_IP),
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

exports.publicRateLimitMiddleware = rateLimitingMiddleware;