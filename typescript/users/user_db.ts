import 'dotenv/config';
import jwt from 'jsonwebtoken';
import {redisClient} from "../database/redis-client";
import {Collection, Db} from "mongodb";

const expireDurationInMinutes : number = 10 * 60 || parseInt(process.env.REDIS_CACHE_EXPIRE_DURATION_IN_MINUTES!,10) * 60 ;

export default class User {
    collection: Collection;
    db: Db;
    users: Array<any>;

    constructor(db: Db) {
        this.collection = db.collection('user');
        this.db = db;

        //Usernames have to be unique.
        this.users = [
            {_id: 1, username: 'admin', password: 'root'},
            {_id: 2, username: 'test1', password: 'test1'},
            {_id: 3, username: 'test2', password: 'test2'},
            {_id: 4, username: 'batu', password: '123'}
        ].map(v => Object.assign(v, {token: jwt.sign(v, process.env.TOKEN_SECRET!)}));
    }

    async createUserCollectionIfNotExists() {
        const collections: any = await this.db
            .listCollections()
            .toArray();

        const collectionNames: any = collections
            .map((c: { name: any; }) => c.name);

        if (collectionNames === undefined || collectionNames.length === 0) {
            await this.db.createCollection("user");

            const options: object = {ordered: true};
            const result: any = await this.collection.insertMany(this.users, options);
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

    async authUser(username: string, password: string) {
        const redisResult: any = await redisClient.get(`cache:user:${username}`);

        if (redisResult === null) {
            let mongoResult: any = await this.db.collection("user").findOne({username: username, password: password});

            if (mongoResult !== null) {
                await redisClient.multi()
                    .set(`cache:user:${mongoResult.username}`, JSON.stringify(mongoResult))
                    .expire(`cache:user:${mongoResult.username}`, expireDurationInMinutes)
                    .exec();

                return true;
            }

            return false;
        }

        let redisResultJSON: any = JSON.parse(redisResult);
        redisClient.expire(`cache:user:${redisResultJSON.username}`, expireDurationInMinutes);
        return redisResultJSON.username === username && redisResultJSON.password === password;
    }
}