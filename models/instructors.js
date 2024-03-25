/* eslint-disable */
import BaseModel from "./base_model.js";
import dbClient from "../utils/db.js";
import mongoose from "mongoose";

export default class Instructors extends BaseModel {
    constructor(obj={}) {
        super(obj);

        if (typeof obj != 'object') {
            new Error('obj must be an object')
        }
        const allowedObj = ['name', 'email', 'password',
                            'age', 'phone', 'type', 'dept',
                            'qualification', 'courses_assigned',
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
        const date = new Date();
        const year = date.getFullYear();
        newSchema.add({
            dept: {
                type: String,
                required: true
            },
            qualification: {
                type: String,
                required: true
            },
            coursesAssigned: [{
                name: String,
                credit: Number,
                numberClass: Number,
                year: {
                    type: String,
                    default: year
                },
                semister: Number,
                batch: String
            }],
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
            assignedStudents: [{
                    course: String,
                    credit: Number,
                    StudentID: String,
                    grade: {
                        type: String,
                        default: "-",
                        enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', '-']
                    },
                    attendance: {
                        type: Number,
                        default: 0
                    },
                    batch: String,
                    semister: Number,
                    year: {
                        type: String,
                        default: year
                    },
                    add: {
                        type: Boolean,
                        default: false,
                    }
            }]
        });
        this.schema = newSchema;
        this.model = Object.assign({}, this.model, obj);
        const Model = mongoose.models.instructors || mongoose.model('instructors', this.schema);
        this.instructorsModel = new Model(this.model);
    }

    async save() {
        return await super.save(this.instructorsModel);
    }

    async findBy(obj, coll) {
        if (coll === null) {
            return new Error('collection must be string and in available collections');
        }
        let result = [];
        await this.instructorsModel.model(coll).find(obj)
        .then(async (res) => {
            result = res;
        })

        return result;
    }

    async updateDoc(doc, upDoc, coll) {
        if (coll === null) {
            return new Error('collection must be string and in available collections');
        }
        let result;
        result = await this.instructorsModel.model(coll).findOneAndUpdate(doc, upDoc, { returnDocument: 'after'});
        return result;
    }

    async updateDocList(obj, upDoc, coll) {
        if (typeof obj != 'object'){
            return new Error('document must be an object');
          }
        let result = [];
        // console.log(obj)
        result = await this.instructorsModel.model(coll).findOneAndUpdate(obj, {$push: upDoc}, { returnDocument: 'after' })
        return result;
    }
}
