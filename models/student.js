/* eslint-disable */
import BaseModel from "./base_model.js";
import db from "../utils/db.js";
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
                name: String,
                credit: Number,
                grade: String,
                attendance: Number
            }],
            StudentID: {
                type: String,
                required: true
            },
            requests: [{
                title: String,
                body: String,
                issueDate: {
                    type: Date,
                    default: Date.now
                },
                response: {
                    message: String,
                    responseDate: {
                        type: Date,
                        default: Date.now
                    }
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
                default: false
            },
            dropped_courses: [{
                name: String,
                credit: Number,
                reason: String                
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

    save() {
        super.save(this.studentModel);
    }
}

// const obj = {
//     dept: 'Electrical',
//     batch: '2015 Graduate',
//     StudentID: 'ETS0136/12'
// }
// const b = new Students("Besufikad", "07yilmabese@gmail.com", "paswrod", 23, 0, 'student', obj);
// b.save();
// console.log(b);