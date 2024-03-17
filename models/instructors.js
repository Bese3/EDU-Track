/* eslint-disable */
import BaseModel from "./base_model.js";
import db from "../utils/db.js";
import mongoose from "mongoose";

export default class Instructors extends BaseModel {
    constructor(name, email, password, age, phone, type, obj={}) {
        super(name, email, password, age, phone, type);

        if (typeof obj != 'object') {
            new Error('obj must be an object')
        }
        const allowedObj = ['dept', 'qualification', 'courses_assigned',
                            'TeacherID', 'requests',
                            'responses', 'assigned_students',
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
            qualification: {
                type: String,
                required: true
            },
            courses_assigned: [{
                name: String,
                credits: Number,
                no_class: Number
            }],
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
            assigned_students: [{
                dept: [{
                    name: String,
                    credit: Number,
                    grade: String,
                    attendance: Number
                }]
            }]
        });
        this.schema = newSchema;
        this.model = Object.assign({}, this.model, obj);
        const Model = mongoose.model('instructors', this.schema);
        this.instructorsModel = new Model(this.model);
    }

    save() {
        super.save(this.instructorsModel);
    }
}