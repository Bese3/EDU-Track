import AuthController from "../controllers/AuthController.js";
import StudentController from "../controllers/StudentController.js";
import AppController from "../controllers/AppController.js";


export default function injectRoutes(app) {
    app.get('/status', AppController.getStatus);
    app.get('/student/login', AuthController.studGetConnect);
    app.post('/student/issue', AuthController.verifyUser, StudentController.makeReq);
    app.post('/student/resolve', AuthController.verifyUser, StudentController.studResponse);
    app.get('/instructor/login', AuthController.instGetConnect);
    app.get('/admin/login', AuthController.adminGetConnect);
    app.get('/logout', AuthController.GetDisconnect);
    app.post('/admin/create/student', AuthController.verifyUser, StudentController.creatStudent)
    app.put('/admin/reg/student', AuthController.verifyUser, StudentController.regStudent);
    app.put('/admin/unreg/student', AuthController.verifyUser, StudentController.unRegStudent);
    app.put('/admin/department/student', AuthController.verifyUser, StudentController.chgDept);
    app.post('/admin/course/student', AuthController.verifyUser, StudentController.regCourse);
    app.put('/admin/drop/student', AuthController.verifyUser, StudentController.dropStudent);
    app.put('/instructor/grade/student', AuthController.verifyUser, StudentController.gradStudent);
}