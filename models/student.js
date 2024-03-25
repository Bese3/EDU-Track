/* eslint-disable */
import BaseModel from "./base_model.js";
import dbClient from "../utils/db.js";
import mongoose from "mongoose";


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
        const date = new Date();
        const year = date.getFullYear();

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
                year: {
                    type: String,
                    default: year
                },
                semister: Number,
                grade: {
                    type: String,
                    default: "-",
                    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', '-']
                },
                attendance: Number,
                status: {
                    type: String,
                    enum: ['taken', 'taking', 'dropped'],
                    default: 'taking'
                }
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
            // dropOut: {
            //     dropped: {
            //         type: Boolean,
            //         default: false
            //     },
            //     droppedSem: Number,
            //     returnSem: {
            //         type: String,
            //         default: null
            //     },
            //     droppedDate: {
            //         type: Date,
            //         default: Date.now
            //     }
            // },
            droppedCourses: [{
                instructor: String,
                name: String,
                credit: Number,
                year: {
                    type: String,
                    default: year
                },
                semister: Number,
                attendance: Number,
                status: {
                    type: String,
                    enum: ['taken', 'taking', 'dropped'],
                    default: 'taking'
                },
                grade: {
                    type: String,
                    default: 'F'
                }               
            }],
            addCourses: [{
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

    // async save() {
    //     return await super.save(this.instructorsModel);
    // }

    async save(model) {
        if (!(model instanceof mongoose.Model)) {
            return new Error('model is not Mongoose type')
        }
        let returnValue = false;
        await model.save()
        .then((_savedData) => {
            // console.log(_savedData)  
            returnValue = _savedData;
        })
        .catch((err) => {
            console.log(`error saving data ${err}`);
        })
        return returnValue;
    }

}
