/* eslint-disable */
import Instructors from "../models/instructors.js";
import AuthController from "./AuthController.js";
import pwdHash from "../utils/pwd.js";
import makeRqst from "../models/makeRqst.js";
import Bull from 'bull';
import mongoose from "mongoose";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const requestQueue = new Bull('instrequestQueue', REDIS_URL);
const responseQueue = new Bull('instresponseQueue', REDIS_URL);


export default class InstructorController {
    static async creatInstructor(req, res) {
        if (req.payload.type != 'admin') {
            return res.status(403).json({'error': 'Admin privelage only'});
        }
        if (!req.body.instructor) {
            return res.status(403).json({'error': 'Missing data'});
        }
        let email = req.body.instructor.email;
        let result = await AuthController.instmodel().findBy({email}, 'instructors');
        if (result.length > 0) {
            return res.status(403).json({'error': 'Instructor already exists'});
        }
        try {
            req.body.instructor.password = await pwdHash.generateHash(req.body.instructor.password);
            let inst = new Instructors(req.body.instructor);
            result = await inst.save(inst.instructorsModel);
        } catch(err) {
            console.log(err)
            return res.status(400).json({'error': 'Instructor data not specified'});
        }
        result.password = "*****"
        return res.status(201).json(result);
    }

    static async chgQfc(req, res) {
        if (req.payload.type != 'admin') {
            return res.status(403).json({'error': 'Admin privelage only'});
        }
        if (!req.body.instructor) {
            return res.status(403).json({'error': 'Missing data'});
        }
        let email = req.body.instructor.email;
        let result = await AuthController.instmodel().findBy({email}, 'instructors');
        if (result.length == 0) {
            return res.status(403).json({'error': 'Instructor doesn\'t exists'});
        }
        let qualification = req.body.instructor.qualification;
        result = await AuthController.instmodel().updateDoc({email}, {qualification}, 'instructors');
        result.password = "*****"
        res.status(200).json(result)
    }

    static async makeReq(req, res) {
        if (req.payload.type != 'instructor') {
            return res.status(403).json({'error': 'Instructor privelage only'});
        }
        if (!req.body.instructor) {
            return res.status(403).json({'error': 'Missing data'});
        }

        let email = req.body.instructor.email;
        let result = await AuthController.instmodel().findBy({email}, 'instructors');
        if (result.length === 0) {
            return res.status(403).json({'error': 'Instructor doesn\'t exist'});
        }
        result = result[0]
        req.body.instructor.info.sender = result._id.toString();
        // student exists and continuing to create new req
        let Doc = {requests: {
            title: req.body.instructor.title,
            body: req.body.instructor.body,
            info: req.body.instructor.info
            }
         };

        //  check reciever instructor is available in database
         let stuId = mongoose.Types.ObjectId.createFromHexString(Doc.requests.info.reciever);
         result = await AuthController.stumodel().findBy({'_id': stuId}, 'students');
        //  console.log(r)
         if (result.length === 0) {
            return res.status(403).json({'error': 'Student doesn\'t exist'});
        }

        // student exists
        try {
            // creating a new request based on instructor's data
            let newReq = new makeRqst(Doc);
            result = await newReq.save();

            //   create Job producer for the request
            Doc.requests.info.id = result._id.toString();
            await requestQueue.add(Doc.requests.info)

            return res.status(200).json(result.requests);
        }
        catch (err) {
            res.status(403).json({'error': 'Missing data in your request'});
        }
    }

    static async instResponse(req, res) {
        if (req.payload.type != 'instructor') {
            return res.status(403).json({'error': 'Instructor privelage only'});
        }
        if (!req.body.instructor) {
            return res.status(403).json({'error': 'Missing data'});
        }

        let email = req.body.instructor.email;
        let result = await AuthController.stumodel().findBy({email}, 'instructors');
        if (result.length === 0) {
            return res.status(403).json({'error': 'Instructor doesn\'t exist'});
        }
        let sender = mongoose.Types.ObjectId.createFromHexString(req.body.instructor.info.sender);
        result = await AuthController.instmodel().findBy({'_id': sender}, 'instructors');
        if (result.length === 0) {
            return res.status(404).json({'error': 'Instructor is no longer available login for more'});
        }
        let body = req.body.instructor.body;
        let id  = req.body.instructor.info.id;
        sender = sender.toString();
        responseQueue.add({id, body, sender, email});
        return res.status(201).json({sent: body});
    }

}