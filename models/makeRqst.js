import mongoose from 'mongoose';
import dbClient from '../utils/db.js';
const { Schema } = mongoose;


export default class makeRqst {

    constructor (reqst) {

        if (typeof reqst != 'object') {
            new Error('request must be object');
        }

        const allowedRqst = ['title', 'body', 'issueDate', 'to', 'response'];
        for (const key of Object.keys(reqst.requests)) {
            if(!allowedRqst.includes(key)) {
                delete reqst[key];
            }
        }
        this.model = reqst;
        this.schema = new Schema({
            requests: {
                title: {
                    type: String,
                    required: true
                },
                body: {
                    type: String,
                    required: true
                },
                info: {
                    sender: mongoose.ObjectId,
                    reciever: mongoose.ObjectId,
                },
                issueDate: {
                    type: Date,
                    default: Date.now
                },
                response: {
                    message: {
                        type: String,
                        default: null
                    },
                    responseDate: {
                        type: Date,
                        default: Date.now
                    }
                },
            }
        });
        const Model = mongoose.models.requests || mongoose.model('requests', this.schema);
        this.reqModel = new Model(this.model);
    }


    async save() {
        if (!(this.reqModel instanceof mongoose.Model)) {
            return new Error('model is not Mongoose type')
        }
        let result;
        await this.reqModel.save()
        .then((data) => {
            result = data;
        });
        return result;
    }

    async updateDocList(obj, upDoc, coll) {
        if (typeof obj != 'object'){
            return new Error('document must be an object');
          }
        let result = [];
        // console.log(obj)
        result = await this.reqModel.model(coll).findOneAndUpdate(obj, {$push: upDoc}, { returnDocument: 'after' })
        return result;
    }

    
}
