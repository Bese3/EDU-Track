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

    isAlive() {
        return new Promise((resolve, reject) => {
            if (this.client.readyState === 1) {
                resolve(true); // MongoDB connection is alive
            } else {
                reject(false); // MongoDB connection is not alive
            }
        });
    }

    async all(coll) {
        if (coll === null) {
            return new Error('collection must be string and in available collections');
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

    async findBy(obj, coll, schema) {
        if (coll === null) {
            return new Error('collection must be string and in available collections');
        }
        let result = [];
        // console.log(this.client.collection.find)
        await this.client.model(coll).find(obj)
        .then(async (res) => {
            res = await res.toArray();
            result = res;
        })
        return result;
    }

    async updateDoc(obj, updDoc, coll) {
        if (typeof obj != 'object'){
            return new Error('document must be an object');
          }
        let result = [];
        await this.client.collection(coll).findOneAndUpdate(obj, updDoc, { returnDocument: 'after' })
        .then(async (res) => {
            // res = await res.toArray();
            result = [...res];
        })
        return result;
    }

    async deleteDoc(obj, coll) {
        if (typeof obj != 'object'){
            return new Error('document must be an object');
          }
        await this.client.collection(coll).deleteOne(obj)
    }

    async deleteDocList(obj, upDoc, coll) {
        if (typeof obj != 'object'){
            return new Error('document must be an object');
          }
        let result = [];
        result = await this.client.collection(coll).updateOne(obj, {$pull: upDoc}, { new: true });
        return result;
    }

}

const dbClient = new DBStorage();

export default dbClient;
