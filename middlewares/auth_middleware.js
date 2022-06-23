require('dotenv').config()
const jwt = require('jsonwebtoken');
const { redisClient } = require('../database/redis-client.js');
const User = require('../users/user_db.js');
const {getDb} = require('../database/mongodb.js');
const user = new User(getDb());

/**
 * Middleware for /private route
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const authMiddleware = async (req,res,next) => {
    const token = req?.headers["authorization"]?.split("Bearer")[1].trim();
    const {username, password} = req?.query;
    res.locals.token = token;

    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }

    if (!username || !password) {
        return res.status(403).send("Username of password required for authentication");
    }

    try {
        const tokenConfirmation = jwt.verify(token, process.env.TOKEN_SECRET);

        if(tokenConfirmation.username !== username && tokenConfirmation.password !== password) {
            return res.status(401).send("Your token and credentials are not matching.");
        }

        user.authUser(username,password).then(result => {
            return result ? next() : res.status(401).send("Wrong username or password.");
        });

    } catch (ex) {
        return res.status(401).send("Invalid Token");
    }
}

const expireDurationInSeconds = process.env.RATE_LIMIT_DURATION_IN_MINUTES_FOR_TOKEN * 60;
const maximumAllowedRequest = process.env.RATE_LIMIT_FOR_TOKEN;

/**
 * Rate-Limiter for Private Routes by Token
 * @param requestWeight
 * @returns {(function(*, *, *): void)|*}
 */
const rateLimitingMiddleware = (requestWeight) => {
    return (req, res, next) => {
        const token = res.locals.token;

        redisClient.multi()
            .get(token)
            .incrBy(token, requestWeight)
            .ttl(token)
            .exec()
            .then(result => {
                const [prevValue,requests, ttl] = result;

                if ((requests > 1 && ttl === -2) || prevValue === null) {
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

exports.authMiddleware = authMiddleware;
exports.privateRateLimitingMiddleware = rateLimitingMiddleware;
