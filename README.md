# EDU Track

[![Coverage Status](https://coveralls.io/repos/github/Bese3/EDU-Track/badge.svg?branch=main)](https://coveralls.io/github/Bese3/EDU-Track?branch=main)

A simple Educational Organization progress tracking system API built with Express, MongoDB/Mongoose, Bull, and Node.js.

## Requirements
+ MongoDB server
+ Redis server
+ Mongoose ODM
+ JSONWebToken
+ Express.js
+ Node.js Run Time Enviroment

### Applications

+ Node.js

### APIs

+ /status - returns true if DB is available.
+ /student/login -  enables student to login and view their courses in particular calendar year, dropped courses, added courses...
+ /instructor/login - enables instructors to login and view assigned courses, batches, courses to teach in a semister.
+ /admin/login - is only allowed to type admins, admins can create students, instructors, drop student, add course to student, assign instructor to students...
+ /logout - as whom ever you are logged in you will be logged out.
+ /student/issue - is used to send a request/issue to an instructor when there is a problem in the teaching learning process.
+ /student/reslove - is used when a student need to answer or resolve issue intiated by instructor.
+ /instructor/issue - instructors also can issue a request to a student.
+ /instructor/resolve - resloving issues from students.
+ /admin/create/student - this route is protected to only admins which creates student its info.
+ /admin/create/instructor - creates instructor with bunch on information.
+ /admin/reg/student - registers student.
+ /admin/unreg/student - unregister a student.
+ /admin/department/student - changes or updates department of a student.
+ /admin/course/student - add course to a student with neccassary information.
+ /admin/drop/student - drop a course for a student.
+ /admin/qualification/instructor - change the quaification of an instructor for instance from Masters to Doctor.
+ /instructor/grade/student - grade student based on their score.
+ /instructor/attendance/student - fill student's attendance.

### Enviromental Variables

+ DB_PORT - database port
+ DB_HOST - database host
+ DB_DATABASE - database name
+ REDIS_URL - redis connection url

### Installation

After cloning this repository navigate into the root of the project repository and run:

```
npm install
```

### Usage
In order to use the API we have to run the server and also the worker for the request object to be created from instructors and students

```
npm run start-server
```
On different terminal
```
npm run start-worker
```