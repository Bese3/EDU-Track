import mongoose from "mongoose";
import { config } from 'dotenv';
config()


class DBStorage {
    constructor () {
        const port = process.env.DB_PORT || 27017;
        const host = process.env.DB_HOST || "127.0.0.1";
        const db = process.env.DB_DATABASE || "edu-track";
        this.dbUrl = `mongodb://${host}:${port}/${db}`;
        mongoose.connect(this.dbUrl);
        this.client = mongoose.connection;
        
        // if (!(this.client.readyState === 1)) {
        //     console.log(`error connecting to mongodb`)
        // }

    }

    async all(coll) {
        if (coll === null) {
            return new Error('collection must be string available collections');
        }
        let result = [];
        await this.client.collection(coll).find({})
        .then(async (res) => {
            // console.log(res)
            res = await res.toArray()
            result = [...res]
        });
        return result;
    }

}

const db = new DBStorage();

export default db;
