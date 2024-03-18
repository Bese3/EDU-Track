import mongoose from 'mongoose';
import dbClient from '../utils/db.js';
const { Schema } = mongoose;


export default class makeRqst {

    constructor (reqst, user) {

        if (typeof reqst != 'object') {
            new Error('request must be object');
        }

        const allowedRqst = ['title', 'body', 'issueDate', 'response'];
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
                    default: null
                },
                body: {
                    type: String,
                    default: null
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
        const Model = mongoose.model('requests', this.schema);
        this.reqModel = new Model(this.model);
        this.user = user;
    }

    async chechUsers() {
        let id = mongoose.Types.ObjectId.createFromHexString(this.user.id)
        let users = await dbClient.findBy({'_id': id}, this.user.coll);
        // console.log(users)
        if (users.length === 0) {
            return new Error('no users found');
        }
        return true;
    }

    async save() {
        if (!(this.reqModel instanceof mongoose.Model)) {
            return new Error('model is not Mongoose type')
        }
        return await this.reqModel.save()
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
