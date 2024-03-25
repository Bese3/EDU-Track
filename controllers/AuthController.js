import dbClient from "../utils/db.js";
import pwdHash from "../utils/pwd.js";
import jwt from "jsonwebtoken";
import Admins from "../models/admin.js";
import Instructors from "../models/instructors.js";
import Students from "../models/student.js";
import makeRqst from "../models/makeRqst.js";

let testemail = 'email'
let admin = new Admins({testemail});
let instructor = new Instructors({testemail});
let student = new Students({testemail});
let reqst = new makeRqst({requests: testemail});


export default class AuthController {
    static stumodel() {
        return student
    }

    static instmodel() {
        return instructor
    }

    static reqmodel() {
        return reqst
    }

    static async studGetConnect (req, res, next) {
        if (!req.headers['authorization']) {
            return res.status(401).json({'error': 'Unauthorized'});
        }
        // extracting base64
        const base = req.headers['authorization'].split(' ')[1];
        let data = Buffer.from(base, 'base64').toString('utf-8');
        let email = data.split(':')[0]
        let password = data.split(':')[1]
        let result = await student.findBy({email}, 'students');
        if (result.length === 0) {
            return res.status(403).json({'error': 'Forbidden'});
        }
        result = result[0];
        if (pwdHash.compare(password, result.password)) {
            const payload = {'id': result._id, 'email': result.email,
                            'StudentID': result.StudentID, 'type': result.type};
            const secKey = process.env.SECRET_KEY || "secret_key";
            const token = jwt.sign(payload, secKey, {expiresIn: '2h'});
            res.cookie('token', token);
            // req.body = Object.assign({}, req.body, result);
            result['password'] = "*****"
            res.status(200).json(result)
        } else {
            return res.status(403).json({'error': 'Incorrect Password'});
        }
    }

    static async GetDisconnect (req, res) {
        if (!req.headers['authorization']) {
            return res.status(401).json({'error': 'Unauthorized'});
        }
        let token = req.headers['authorization'].split(' ')[1];
        const secKey = process.env.SECRET_KEY || "secret_key";
        jwt.verify(token, secKey, (err, dec) => {
            if (err) {
                return res.status(403).json({'error': 'Not logged in'});
            }
        })
        // res.clearHeaders()
        res.status(204).redirect('/')
    }

    static async instGetConnect(req, res){
        if (!req.headers['authorization']) {
            return res.status(401).json({'error': 'Unauthorized'});
        }
        // extracting base64
        const base = req.headers['authorization'].split(' ')[1];
        let data = Buffer.from(base, 'base64').toString('utf-8');
        // data extraction
        let email = data.split(':')[0]
        let password = data.split(':')[1]
        let result = await instructor.findBy({email}, 'instructors');
        if (result.length === 0) {
            return res.status(403).json({'error': 'Forbidden'});
        }
        result = result[0];
        if (pwdHash.compare(password, result.password)) {
            const payload = {'id': result._id, 'email': result.email,
                            'TeacherID': result.TeacherID, 'type': result.type};
            const secKey = process.env.SECRET_KEY || "secret_key";
            const token = jwt.sign(payload, secKey, {expiresIn: '1h'});
            res.cookie('token', token);
            // req.body = Object.assign({}, req.body, result);
            result['password'] = "*****"
            res.status(200).json(result)
        } else {
            return res.status(403).json({'error': 'Forbidden'});
        }
    }

    static async adminGetConnect(req, res) {
        if (!req.headers['authorization']) {
            return res.status(401).json({'error': 'Unauthorized'});
        }
        // extracting base64
        const base = req.headers['authorization'].split(' ')[1];
        let data = Buffer.from(base, 'base64').toString('utf-8');
        let email = data.split(':')[0]
        let password = data.split(':')[1]
        let result = await admin.findBy({email}, 'admins');
        if (result.length === 0) {
            return res.status(403).json({'error': 'No user'});
        }
        result = result[0];
        if (pwdHash.compare(password, result.password)) {
            const payload = {'id': result._id, 'email': result.email,
                            'name': result.name, 'type': result.type};
            const secKey = process.env.SECRET_KEY || "secret_key";
            const token = jwt.sign(payload, secKey, {expiresIn: '30m'});
            res.cookie('token', token);
            // req.body = Object.assign({}, req.body, result);
            result['password'] = "*****"
            res.status(200).json(result)
        } else {
            return res.status(403).json({'error': 'email or password didn\'t match'});
        }

    }

    static async verifyUser(req, res, next) {
        if (!req.headers['authorization']) {
            return res.status(401).json({'error': 'Unauthorized'});
        }
        // extract base64
        const encoded = req.headers['authorization'].split(' ')[1];

        // verify jwt token
        const secKey = process.env.SECRET_KEY || "secret_key";
        jwt.verify(encoded, secKey, (err, payload) => {
            if (err) {
                return res.status(403).json({'error': 'Sorry your session expired or incorrect Authentication'});
            } else {
                // add payload data to req to rap up middleware
                req.payload = payload;
                next();
            }
        })
    }
}