/* eslint-disable */
import BaseModel from "./base_model.js";
import dbClient from "../utils/db.js";
import mongoose from "mongoose";
import pwdHash from "../utils/pwd.js";


export default class Students extends BaseModel {
    constructor(obj={}) {
        super(obj);
        if (typeof obj != 'object') {
            new Error('obj must be an object')
        }
        const allowedObj = ['name', 'email', 'password',
                            'age', 'phone', 'type', 'dept',
                            'batch', 'courses', 'StudentID',
                            'requests', 'drop_out',
                            'dropped_courses', 'add_courses',
                        ];
        // ensures allowed properties only added to mods
        for (const key of Object.keys(obj)) {
            if (!allowedObj.includes(key)) {
                delete obj[key]
            }
        }
        let newSchema = super.getSchema();

        //database schema for student
        newSchema.add({
            dept: {
                type: String,
                required: true
            },
            batch: {
                type: String,
                required: true
            },
            courses: [{
                instructor: String,
                name: String,
                credit: Number,
                grade: {
                    type: String,
                    default: "-"
                },
                attendance: Number
            }],
            StudentID: {
                type: String,
                required: true
            },
            registered: {
                type: Boolean,
                default: false
            },
            requests: [{
                requestId: {
                    type: mongoose.ObjectId,
                    ref: 'requests'
                }
            }],
            recieved: [{
                id: mongoose.ObjectId,
                sender: mongoose.ObjectId
            }],
            responses: [{
                info: {
                    id: mongoose.ObjectId,
                    sender: mongoose.ObjectId
                },
                body: String,
                responseDate: {
                    type: Date,
                    default: Date.now
                }
            }],
            drop_out: {
                type: Boolean,
                data: [{
                    dropped_sems: String,
                    return_sems: String,
                    dropped_date: {
                        type: Date,
                        default: Date.now
                    }
                }],
                default: false
            },
            dropped_courses: [{
                name: String,
                credit: Number,
                reason: String,
                grade: {
                    type: String,
                    default: 'F'
                }               
            }],
            add_courses: [{
                name: String,
                credit: Number,
            }]
        });
       
        this.schema = newSchema;
        this.model = Object.assign({}, this.model, obj);
        const Model = mongoose.models.students || mongoose.model('students', this.schema);
        this.studentModel = new Model(this.model); 
    }

    async findBy(obj, coll) {
        if (coll === null) {
            return new Error('collection must be string and in available collections');
        }
        let result = [];
        await this.studentModel.model(coll).find(obj)
        .then(async (res) => {
            // res = await res.toArray();
            result = res;
        })
        return result;
    }

    async updateDoc(doc, upDoc, coll) {
        if (coll === null) {
            return new Error('collection must be string and in available collections');
        }
        let result;
        result = await this.studentModel.model(coll).findOneAndUpdate(doc, upDoc, { returnDocument: 'after'});
        return result;
    }

    async updateDocList(obj, upDoc, coll) {
        if (typeof obj != 'object'){
            return new Error('document must be an object');
          }
        let result = [];
        // console.log(obj)
        result = await this.studentModel.model(coll).findOneAndUpdate(obj, {$push: upDoc}, { returnDocument: 'after' })
        return result;
    }


    async save(model) {
        if (!(model instanceof mongoose.Model)) {
            return new Error('model is not Mongoose type')
        }
        let returnValue = false;
        await model.save()
        .then((_savedData) => {
            // console.log(_savedData)
            returnValue = true;
        })
        .catch((err) => {
            console.log(`error saving data ${err}`);
        })
        return returnValue;
    }

}
