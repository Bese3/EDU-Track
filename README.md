# EDU Track

[![Coverage Status](https://coveralls.io/repos/github/Bese3/EDU-Track/badge.svg?branch=main)](https://coveralls.io/github/Bese3/EDU-Track?branch=main)

A simple Educational Organization progress tracking system API built with Express, MongoDB/Mongoose, Bull, and Node.js.

## Requirements
+ MongoDB server
+ Mongoose ODM
+ JSONWebToken
+ Express.js
+ Node.js Run time enviroment

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
+ /admin/create/instructor - creates instructor with bunch on information