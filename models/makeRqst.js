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

    async makeRequest() {
        this.chechUsers();
        let id = mongoose.Types.ObjectId.createFromHexString(this.user.id)
        await this.save()
        .then(async (savedData) => {
            let requestId = (savedData._id)
            const update = {requests: {requestId}}
            await dbClient.updateDocList({'_id': id}, update, this.user.coll)
        })
    }

    async deleteReq(model) {
        let reqId = mongoose.Types.ObjectId.createFromHexString(model.id)
        await dbClient.deleteDoc({'_id': reqId}, 'requests');
        let id = mongoose.Types.ObjectId.createFromHexString(this.user.id);
        const update = {requests: {'requestId': reqId}}
        await dbClient.deleteDocList({'_id': id}, update, this.user.coll);
    }

    
}
