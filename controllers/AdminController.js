/* eslint-disable */
import Admins from "../models/admin.js";

export default class AdminController {
    static async creatAdmin(req, res) {
        if (req.payload.type != 'admin') {
            return res.status(403).json({'error': 'Admin privelage only'});
        }
        if (!req.body.admin) {
            return res.status(403).json({'error': 'Missing data'});
        }
        let email = req.body.admin.email;
        let result = await AuthController.admModel().findBy({email}, 'admins');
        if (result.length > 0) {
            return res.status(403).json({'error': 'Admin already exists'});
        }
        try {
            req.body.admin.password = await pwdHash.generateHash(req.body.admin.password);
            let admin = new Admins(req.body.admin);
            result = await admin.save(admin.adminsModel);
            result.password = "*****"
            return res.status(201).json(result);
        } catch(err) {
            return res.status(400).json({'error': 'admin data not specified'});
        }
    }
}