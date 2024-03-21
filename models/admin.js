/* eslint-disable */
import BaseModel from "./base_model.js";
import dbClient from "../utils/db.js";
import mongoose from "mongoose";

export default class Admins extends BaseModel {
    constructor(obj) {
        super(obj);

        if (typeof obj != 'object') {
            new Error('obj must be an object')
        }

        this.schema = super.getSchema();
        this.model = Object.assign({}, this.model, obj);
        const Model = mongoose.model('admins', this.schema);
        this.adminsModel = new Model(this.model);
    }

    save() {
        super.save(this.adminsModel);
    }

    async findBy(obj, coll) {
        if (coll === null) {
            return new Error('collection must be string and in available collections');
        }
        let result = [];
        await this.adminsModel.model(coll).find(obj)
        .then(async (res) => {
            result = res;
        })
        return result;
    }
}
