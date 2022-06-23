require('dotenv').config()
const redis = require('redis');
const client = redis.createClient(`${process.env.REDIS_HOST_NAME}:${process.env.REDIS_PORT}`, {onlyMaster: false});
client.on('error', (err) => console.log('Redis Client Error', err));

const connectToRedis = async () => {
    await client.connect()
}

exports.connectToRedis = connectToRedis;
exports.redisClient = client;
