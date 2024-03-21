/* eslint-disable */
import Students from "../models/student.js";
import AuthController from "./AuthController.js";
import pwdHash from "../utils/pwd.js";
import makeRqst from "../models/makeRqst.js";
import mongoose from "mongoose";
import Bull from 'bull';
import { response } from "express";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const requestQueue = new Bull('studrequestQueue', REDIS_URL);
const responseQueue = new Bull('studresponseQueue', REDIS_URL);


export default class StudentController {
    static async creatStudent (req, res) {
        if (req.payload.type != 'admin') {
            return res.status(403).json({'error': 'Admin privelage only'});
        }
        if (!req.body.student) {
            return res.status(403).json({'error': 'Missing data'});
        }
        let email = req.body.student.email;
        let result = await AuthController.stumodel().findBy({email}, 'students');
        if (result.length > 0) {
            return res.status(403).json({'error': 'Student already exists'});
        }
        try {
            req.body.student.password = await pwdHash.generateHash(req.body.student.password);
            let stud = new Students(req.body.student);
            result = await stud.save(stud.studentModel);
        } catch(err) {
            return res.status(400).json({'error': 'student data not specified'});
        }
        return res.status(201).json({'message': result});
    }

    static async regStudent(req, res) {
        if (req.payload.type != 'admin') {
            return res.status(403).json({'error': 'Admin privelage only'});
        }
        if (!req.body.student) {
            return res.status(403).json({'error': 'Missing data'});
        }

        let email = req.body.student.email;
        let result = await AuthController.stumodel().findBy({email}, 'students');
        if (result.length === 0) {
            return res.status(403).json({'error': 'Student doesn\'t exist'});
        }
        const upDoc = {registered: true};
        result = await AuthController.stumodel().updateDoc({email}, upDoc, 'students');
        result.password = "*****"
        return res.status(200).json(result);
    }

    static async unRegStudent(req, res) {
        if (req.payload.type != 'admin') {
            return res.status(403).json({'error': 'Admin privelage only'});
        }
        if (!req.body.student) {
            return res.status(403).json({'error': 'Missing data'});
        }

        let email = req.body.student.email;
        let result = await AuthController.stumodel().findBy({email}, 'students');
        if (result.length === 0) {
            return res.status(403).json({'error': 'Student doesn\'t exist'});
        }
        const upDoc = {registered: false};
        result = await AuthController.stumodel().updateDoc({email}, upDoc, 'students');
        result.password = "*****"
        return res.status(200).json(result);
    }

    static async chgDept(req, res) {
        if (req.payload.type != 'admin') {
            return res.status(403).json({'error': 'Admin privelage only'});
        }
        if (!req.body.student) {
            return res.status(403).json({'error': 'Missing data'});
        }

        let email = req.body.student.email;
        let result = await AuthController.stumodel().findBy({email}, 'students');
        if (result.length === 0) {
            return res.status(403).json({'error': 'Student doesn\'t exist'});
        }

        const upDoc = {dept: req.body.student.dept};
        result = await AuthController.stumodel().updateDoc({email}, upDoc, 'students');
        result.password = "*****"
        return res.status(200).json(result);
    }

    // drop out batch change
    static async batchChange(req, res) {
        if (req.payload.type != 'admin') {
            return res.status(403).json({'error': 'Admin privelage only'});
        }
        if (!req.body.student) {
            return res.status(403).json({'error': 'Missing data'});
        }

        let email = req.body.student.email;
        let result = await AuthController.stumodel().findBy({email}, 'students');
        if (result.length === 0) {
            return res.status(403).json({'error': 'Student doesn\'t exist'});
        }

        const upDoc = {batch: req.body.student.batch};
        result = await AuthController.stumodel().updateDoc({email}, upDoc, 'students');
        result.password = "*****"
        return res.status(200).json(result);
    }

    static async regCourse(req, res) {
        if (req.payload.type != 'admin') {
            return res.status(403).json({'error': 'Admin privelage only'});
        }
        if (!req.body.student) {
            return res.status(403).json({'error': 'Missing data'});
        }

        let email = req.body.student.email;
        let result = await AuthController.stumodel().findBy({email}, 'students');
        if (result.length === 0) {
            return res.status(403).json({'error': 'Student doesn\'t exist'});
        }
        // checking if instrcutor is available in db
        let name = req.body.student.instructor;
        result = await AuthController.instmodel().findBy({name}, 'instrcutors');
        if (result.length === 0) {
            return res.status(403).json({'error': 'instructor not found'});
        }
        const upDoc = {courses: {
                            instructor: req.body.student.instructor,
                            name: req.body.student.name,
                            credit: req.body.student.credit,
                            grade: req.body.student.grade,
                            attendance: req.body.student.attendance
                      }};
        result = await AuthController.stumodel().updateDocList({email}, upDoc, 'students');
        result.password = "*****"
        return res.status(200).json(result);
    }

    static async makeReq(req, res) {
        if (req.payload.type != 'student') {
            return res.status(403).json({'error': 'Student privelage only'});
        }
        if (!req.body.student) {
            return res.status(403).json({'error': 'Missing data'});
        }

        let email = req.body.student.email;
        let result = await AuthController.stumodel().findBy({email}, 'students');
        if (result.length === 0) {
            return res.status(403).json({'error': 'Student doesn\'t exist'});
        }
        result = result[0]
        req.body.student.info.sender = result._id.toString();
        // student exists and continuing to create new req
        let Doc = {requests: {
            title: req.body.student.title,
            body: req.body.student.body,
            info: req.body.student.info
            }
         };

        //  check reciever instructor is available in database
         let instId = mongoose.Types.ObjectId.createFromHexString(Doc.requests.info.reciever);
         result = await AuthController.instmodel().findBy({'_id': instId}, 'instructors');
         if (result.length === 0) {
            return res.status(403).json({'error': 'Instructor doesn\'t exist'});
        }

        // instructor exists
        try {
            // creating a new request based on student data
            let newReq = new makeRqst(Doc);
            result = await newReq.save();

            //   create Job producer for the request
            Doc.requests.info.id = result._id.toString();
            console.log(result)
            console.log(Doc.requests.info)
            await requestQueue.add(Doc.requests.info)

            return res.status(200).json(result.requests);
        }
        catch (err) {
            res.status(403).json({'error': 'Missing data in your request'});
        }
    }

    static async studResponse(req, res) {
        if (req.payload.type != 'student') {
            return res.status(403).json({'error': 'Student privelage only'});
        }
        if (!req.body.student) {
            return res.status(403).json({'error': 'Missing data'});
        }

        let email = req.body.student.email;
        let result = await AuthController.stumodel().findBy({email}, 'students');
        if (result.length === 0) {
            return res.status(403).json({'error': 'Student doesn\'t exist'});
        }
        let sender = mongoose.Types.ObjectId.createFromHexString(req.body.student.info.sender);
        result = await AuthController.instmodel().findBy({'_id': sender}, 'instructors');
        if (result.length === 0) {
            return res.status(404).json({'error': 'instructor is no longer available'});
        }
        let body = req.body.student.body;
        let id  = req.body.student.info.id;
        sender = sender.toString();
        responseQueue.add({id, body, sender, email});
            return res.status(201).json({sent: body});
    }
}