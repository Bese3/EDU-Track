/* eslint-disable */
import Students from "../models/student.js";
import AuthController from "./AuthController.js";
import pwdHash from "../utils/pwd.js";
import makeRqst from "../models/makeRqst.js";
import mongoose from "mongoose";
import Bull from 'bull';

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
            result.password = "*****"
            return res.status(201).json(result);
        } catch(err) {
            return res.status(400).json({'error': 'student data not specified'});
        }
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
        if (result[0].registered) {
            return res.status(403).json({'error': `Student ${result[0].name} already registered`})
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
        if (!result[0].registered) {
            return res.status(403).json({'error': `Student ${result[0].name} already unregistered`})
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
        if (!result[0].registered) {
            return res.status(403).json({'error': `Student ${result[0].name} is not Registered`})
        }
        let dropped;
        // check if the course is dropped
        for (const course of result[0].courses) {
            if (course.name === req.body.student.name && (course.status == 'taking' || course.status == 'taken')){
                return res.status(403).json({'error': 'Course already in Student catalog'});
            }

            if (course.name === req.body.student.name && course.status == 'dropped'){
                dropped  = course;
            } 
        }

        let student = result[0];

        // checking if instrcutor is available in db
        let name = req.body.student.instructor;
        let inst = await AuthController.instmodel().findBy({name}, 'instructors');
        if (inst.length === 0) {
            return res.status(403).json({'error': 'instructor not found'});
        }
        
        if (dropped) {
            dropped.status = 'taking'
            result = await AuthController.stumodel().studentModel.model('students').findOneAndUpdate({email, 'droppedCourses.name': dropped.name}, {$unset: {'droppedCourses.$': ''}}, {returnDocument: 'after'});
            let newDoc = [];
            for (const i of result.droppedCourses) {
                if (i != null) {
                    newDoc.push(i)
                }
            }
            // removing null values
            await AuthController.stumodel().updateDoc({email}, {droppedCourses: newDoc}, 'students');

            result = await AuthController.stumodel().studentModel.model('students').findOneAndUpdate({email, 'courses.name': dropped.name}, {$set: {'courses.$': dropped}}, {returnDocument: 'after'});
            // coursesAssigned property for instructor
            let courseAlreadyIstructor = false;
            for (const course of inst[0].coursesAssigned) {
                if (course.name == req.body.student.name) {
                    courseAlreadyIstructor = true;
                    course.numberClass += 1
                    await AuthController.instmodel().instructorsModel.model('instructors').findOneAndUpdate({name, 'coursesAssigned.name': course.name}, {'coursesAssigned.$': course})
                }
            }
            if (!courseAlreadyIstructor) {
                await AuthController.instmodel().updateDocList({name}, {coursesAssigned: {
                    name: req.body.student.name,
                    credit: req.body.student.credit,
                    numberClass: 1,
                    semister: req.body.student.semister,
                    batch: req.body.student.batch
                }}, 'instructors')
            }

            // assigned students for specific courses
            const assignStud = {assignedStudents : {
                    course: req.body.student.name,
                    StudentID: student.StudentID,
                    credit: req.body.student.credit,
                    grade: req.body.student.grade,
                    attendance: req.body.student.attendance,
                    batch: req.body.student.batch,
                    semister: req.body.student.semister,

            }};
            let studentAlreadyAssigned = false;
            for (const assigned of inst[0].assignedStudents) {
                if (assigned.course == req.body.student.name && student.StudentID == assigned.StudentID) {
                    studentAlreadyAssigned = true;
                }
            }
            if (!studentAlreadyAssigned)
                await AuthController.instmodel().updateDocList({'email': inst[0].email}, assignStud, 'instructors');

            dropped.status = 'taken'
            let alreadyAdd = false;
            for (const i of student.addCourses) {
                if (i.name === dropped.name) {
                    alreadyAdd = true;
                }
            }
            if (!alreadyAdd)
                await AuthController.stumodel().updateDocList({email}, {addCourses: dropped}, 'students');
            result.password = "*****"
            return res.status(200).json(result)
        }

        const upDoc = {courses: {
                            instructor: req.body.student.instructor,
                            name: req.body.student.name,
                            credit: req.body.student.credit,
                            semister: req.body.student.semister,
                            grade: req.body.student.grade,
                            attendance: req.body.student.attendance,
                            status: 'taking'
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
        result = await AuthController.stumodel().findBy({'_id': sender}, 'students');
        if (result.length === 0) {
            return res.status(404).json({'error': 'student is no longer available log in for more'});
        }
        let body = req.body.student.body;
        let id  = req.body.student.info.id;
        sender = sender.toString();
        responseQueue.add({id, body, sender, email});
        return res.status(201).json({sent: body});
    }

    static async dropStudent(req, res) {
        if (req.payload.type != 'admin') {
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
        const droppedSem = req.body.student.droppedSem;
        const date = new Date();
        const year = date.getFullYear();
        const courseName = req.body.student.name;
        let upDoc = await AuthController.stumodel().findBy({email}, 'students');
        upDoc = upDoc[0]
        let newDoc = [];
        for (const course of upDoc.courses) {
            if (course.semister == droppedSem && course.year == year && course.name == courseName) {
                course.status = 'dropped'
            }
            newDoc.push(course)
        }
        //updating status
            await AuthController.stumodel().studentModel.model('students').findOneAndUpdate({email}, {$set: {'courses': []}}, {returnDocument: 'after'});
            await AuthController.stumodel().studentModel.model('students').findOneAndUpdate({email}, {$set: {'courses': newDoc}}, {returnDocument: 'after'});
        let dropDoc = [];
        let alreadyDroped = [];
        for (const dropped of upDoc.droppedCourses) {
            alreadyDroped.push(dropped.name);
        }
        if (upDoc.droppedCourses.length === 0) {
            // if the dropped course is already empty add all dropping course
               newDoc.forEach((elem) => {
                   if (elem.status == 'dropped'){
                       dropDoc.push(elem);
                   }
               })
        } else {
        newDoc.forEach((elem, idx, arr) => {
            if (!alreadyDroped.includes(elem.name) && elem.status == 'dropped') {
                dropDoc.push(arr[idx])
            }
          }) 
        }
        
        dropDoc = {droppedCourses: dropDoc};
        if (dropDoc.droppedCourses.length > 0){
            result = await AuthController.stumodel().updateDocList({email}, dropDoc, 'students');
        } else {
            return res.status(404).json({'error': 'no course to drop'})
        }
        let instructorEmail = req.body.student.instructorEmail
        let instructor = await AuthController.instmodel().findBy({'email': instructorEmail}, 'instructors');
        for (const assigned of instructor[0].coursesAssigned) {
            if (assigned.name == courseName) {
                assigned.numberClass -= 1
                await AuthController.instmodel().instructorsModel.model('instructors').findOneAndUpdate({'email': instructorEmail,
                                                'coursesAssigned.name': courseName}, {$set: {'coursesAssigned.$': assigned}});
            }
        }

        result.password = "*****";
        return res.status(200).json(result)
    }

    static async gradStudent(req, res) {
        if (req.payload.type != 'instructor') {
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
        let grade = req.body.student.grade;
        let instructor = req.body.student.instructor;
        let name = req.body.student.name;
        for (const course of result.courses) {
            if (course.name == name && course.instructor == instructor && course.status == 'taking') {
                course.grade = grade
                result = await AuthController.stumodel().studentModel.model('students').findOneAndUpdate({email, 'courses.name': course.name}, {$set: {'courses.$': course}}, {returnDocument: 'after'});
                result.password = "*****";
                return res.status(200).json(result)
            }
        }

        return res.status(404).json({'error': 'No course found'});

    }

    static async putAttend(req, res) {
        if (req.payload.type != 'instructor') {
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
        let attendance = req.body.student.attendance;
        let instructor = req.body.student.instructor;
        let name = req.body.student.name;
        for (const course of result.courses) {
            if (course.name == name && course.instructor == instructor && course.status == 'taking') {
                course.attendance = attendance
                result = await AuthController.stumodel().studentModel.model('students').findOneAndUpdate({email, 'courses.name': course.name}, {$set: {'courses.$': course}}, {returnDocument: 'after'});
                result.password = "*****";
                return res.status(200).json(result)
            }
        }

        return res.status(404).json({'error': 'No course found'});

    }
}