import 'dotenv/config';
import jwt from 'jsonwebtoken';
import {redisClient} from "../database/redis-client";
import {getDb} from "../database/mongodb";
import User from "../users/user_db";
import {Request, Response, NextFunction} from "express";
const user = new User(getDb());

export const authMiddleware = async (req:Request, res:Response, next:NextFunction) => {
    const token = req?.headers["authorization"]?.split("Bearer")[1].trim();
    const {username, password} = req?.query;
    res.locals.token = token;

    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }

    if (!username || !password) {
        return res.status(403).send("Username of password required for authentication");
    }

    // remove empty options brackets if doesn't works
    jwt.verify(token, process.env.TOKEN_SECRET!, {}, (err, result: any) => {
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
}

const expireDurationInSeconds : number = parseInt(process.env.RATE_LIMIT_DURATION_IN_MINUTES_FOR_TOKEN!,10) * 60;
const maximumAllowedRequest : number = parseInt(process.env.RATE_LIMIT_FOR_TOKEN!,10);

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

export const rateLimitingMiddleware = (requestWeight : number) => {
    return async (req:Request, res:Response, next:NextFunction) => {
        const token = res.locals.token;

        const [prevValue, requests, ttl] = await redisClient.multi()
            .get(token)
            .incrBy(token, requestWeight)
            .ttl(token)
            .exec();

        if ((requests > 1 && ttl < 0) || prevValue === null) {
            redisClient.expire(token, expireDurationInSeconds);
        }

        if (requests > maximumAllowedRequest) {
            return res.status(503).json({
                response: 'Error',
                maximumLimitForThisRoute: parseInt(process.env.RATE_LIMIT_FOR_TOKEN!,10),
                routeWeight: requestWeight,
                totalWeightUsed: requests,
                msg: 'You have exceed the rate limit',
                limitWillExceedInSeconds: ttl,
            });
        }

        return next();
    }
}
