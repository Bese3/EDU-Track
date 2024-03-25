import AuthController from "../controllers/AuthController.js";
import StudentController from "../controllers/StudentController.js";
import AppController from "../controllers/AppController.js";
import InstructorController from "../controllers/InstructorController.js";


export default function injectRoutes(app) {
    app.get('/status', AppController.getStatus);
    app.get('/', (req, res) => {
        res.send("Home page")
    })
    app.get('/student/login', AuthController.studGetConnect);
    app.post('/student/issue', AuthController.verifyUser, StudentController.makeReq);
    app.post('/student/resolve', AuthController.verifyUser, StudentController.studResponse);
    app.get('/instructor/login', AuthController.instGetConnect);
    app.get('/admin/login', AuthController.adminGetConnect);
    app.get('/logout', AuthController.GetDisconnect);
    app.post('/admin/create/student', AuthController.verifyUser, StudentController.creatStudent)
    app.post('/admin/create/instructor', AuthController.verifyUser, InstructorController.creatInstructor);
    app.put('/admin/qualification/instructor', AuthController.verifyUser, InstructorController.chgQfc);
    app.put('/admin/reg/student', AuthController.verifyUser, StudentController.regStudent);
    app.put('/admin/unreg/student', AuthController.verifyUser, StudentController.unRegStudent);
    app.put('/admin/department/student', AuthController.verifyUser, StudentController.chgDept);
    app.post('/admin/course/student', AuthController.verifyUser, StudentController.regCourse);
    app.put('/admin/drop/student', AuthController.verifyUser, StudentController.dropStudent);
    app.put('/instructor/grade/student', AuthController.verifyUser, StudentController.gradStudent);
    app.put('/instructor/attendance/student', AuthController.verifyUser, StudentController.putAttend);
    app.post('/instructor/issue', AuthController.verifyUser, InstructorController.makeReq);
    app.post('/instructor/resolve', AuthController.verifyUser, InstructorController.instResponse);
}