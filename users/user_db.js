require('dotenv').config()
const jwt = require('jsonwebtoken');
const { redisClient } = require('../database/redis-client.js');
const expireDurationInMinutes = parseInt(process.env.REDIS_CACHE_EXPIRE_DURATION_IN_MINUTES,10) * 60 || 10 * 60;

class User {
    constructor(db) {
        this.collection = db.collection('user');
        this.db = db;

        //Usernames have to be unique.
        this.users = [
            {_id: 1, username: 'admin', password: 'root'},
            {_id: 2, username: 'test1', password: 'test1'},
            {_id: 3, username: 'test2', password: 'test2'},
            {_id: 4, username: 'batu', password: '123'}
        ].map(v => Object.assign(v, {token: jwt.sign(v, process.env.TOKEN_SECRET)}));
         // Note: jwt.sign is normally not used like this. It is used when user logged-in via login page. It is just example.
         // We dont need to implement login-register for now.
    }

    async getAllUsers() {
        this.collection.find({}).toArray((err, result) => {
            if (err) {
                throw err;
            }

            console.log(result);
        })
    }

    async createUserCollectionIfNotExists() {
        const collections = await this.db
            .listCollections()
            .toArray();

        const collectionNames = collections
            .map(c => c.name);

        if (collectionNames === undefined || collectionNames.length === 0) {
            await this.db.createCollection("user");

            const options = {ordered: true};
            const result = await this.collection.insertMany(this.users, options);
            console.log(`${result.insertedCount} user has been inserted to the database.`)
        }
    }

    async cacheUsersIntoRedis() {
        this.users.forEach(x => {
            redisClient.multi()
                .set(`cache:user:${x.username}`, JSON.stringify(x))
                .expire(`cache:user:${x.username}`, expireDurationInMinutes)
                .exec();
        });
    }

    /**
     * Auth user by using redis-mongodb-cache results. If cache is expired then get results from MongoDB and add to cache with new expire duration.
     * Initial state of caching returns average 200ms in HTTP GET, after caching it returns average 5-10ms. Cache uses usernames as key's, so
     * usernames have to be unique.
     * @param username
     * @param password
     * @returns {Promise<ConvertArgumentType<RedisCommandReply<{IS_READ_ONLY: boolean; transformArguments(key: RedisCommandArgument): RedisCommandArguments; transformReply(): (RedisCommandArgument | null); FIRST_KEY_INDEX: number}>, CommandOptions<ClientCommandOptions>["returnBuffers"] extends true ? Buffer : string>>}
     */
    async authUser(username, password) {
        return redisClient.get(`cache:user:${username}`).then(redisResponse => {
            if (redisResponse === null) {
                return this.db.collection("user").findOne({username: username, password: password}).then(mongoResponse => {
                    if (mongoResponse !== null) {
                        redisClient.multi()
                            .set(`cache:user:${mongoResponse.username}`, JSON.stringify(mongoResponse))
                            .expire(`cache:user:${mongoResponse.username}`, expireDurationInMinutes)
                            .exec()
                        return true;
                    }

                    return false;
                });
            }


            let redisResultJSON = JSON.parse(redisResponse);
            redisClient.expire(`cache:user:${redisResultJSON.username}`,expireDurationInMinutes);
            return redisResultJSON.username === username && redisResultJSON.password === password;
        });
    }

    /**
     * @deprecated Await version
     */
    async authUserAnotheImplementation(username, password) {
        const redisResult = await redisClient.get(`cache:user:${username}`);

        if (redisResult === null) {
            let mongoResult = await this.db.collection("user").findOne({username: username, password: password});

            if (mongoResult !== null) {
                await redisClient.multi()
                    .set(`cache:user:${mongoResult.username}`, JSON.stringify(mongoResult))
                    .expire(`cache:user:${mongoResult.username}`, expireDurationInMinutes)
                    .exec();

                return true;
            }

            return false;
        }

        let redisResultJSON = JSON.parse(redisResult);
        return redisResultJSON.username === username && redisResultJSON.password === password;
    }
}

module.exports = User;



