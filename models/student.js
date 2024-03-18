/* eslint-disable */
import BaseModel from "./base_model.js";
import dbClient from "../utils/db.js";
import mongoose from "mongoose";


export default class Students extends BaseModel {
    constructor(name, email, password, age, phone, type, obj={}) {
        super(name, email, password, age, phone, type);
        if (typeof obj != 'object') {
            new Error('obj must be an object')
        }

        const allowedObj = ['dept', 'batch', 'courses',
                            'StudentID',
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
                grade: String,
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
            responses: [{
                to: String,
                body: String,
                resposneDate: {
                    type: Date,
                    default: true
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
        const Model = mongoose.model('students', this.schema);
        this.studentModel = new Model(this.model);
    }

    async addCourse(obj, doc) {
        console.log(0)
        if (!(typeof doc === 'object') || !(typeof obj === 'object')) {
            new Error('must be type object');
        }
        const allowedArgs = ['instructor', 'name', 'credit', 'grade', 'attendance'];
        for (const key of Object.keys(doc)) {
            if (!allowedArgs.includes(key)) {
                delete doc[key]
            }
        }
        let docToAdd = {courses: doc};
        obj._id = mongoose.Types.ObjectId.createFromHexString(obj._id)
        console.log(await dbClient.updateDocList(obj, docToAdd, 'students'));
    }

     save(model) {
        if (!(model instanceof mongoose.Model)) {
            return new Error('model is not Mongoose type')
        }
        let returnValue = false;
        model.save()
        .then((_savedData) => {
            console.log(`data saved`);
            returnValue = true;
        })
        .catch((err) => {
            console.log(`error saving data ${err}`);
        })
        return returnValue;
    }

    async reg_unreg(filter, isReg, coll) {
        let result = await dbClient.updateDoc(filter, {registered: isReg}, coll);
        return result;
    }

}
