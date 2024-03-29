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

Create test admin for the requests you can change the data in the testAdmin file remember to hash the password before storing it.

```
Name: testAdmin
Email: testEmail
password: testpwd
```

```
npm run create-admin
```

First we login as an admin with Authorization header 

```
http://localhost:5000/admin/login
Autherization: Basic dGVzdEVtYWlsOnRlc3Rwd2Q=
```
![Response](https://github.com/Bese3/EDU-Track/blob/main/adminLoginResponse.png)

If our credintials are right we get a set-cookie named token with a JWT payload, It is important to remember JWT of an admin expires in 30 min.

Now for the purpose of showcasing we create two student and instructor
### Important fields when creating student
+ name
+ email
+ password for the student
+ age (type integer)
+ phone (stored as a string)
+ type can only be a student, admin or instructor
+ dept  deparment of the student
+ batch 
+ StudentID

and it must be in student object

```
POST http://localhost:5000/admin/create/student
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MDU3MTZmMTAwZWU2YWU1OWIyODZhNiIsImVtYWlsIjoidGVzdEVtYWlsIiwibmFtZSI6InRlc3RBZG1pbiIsInR5cGUiOiJhZG1pbiIsImlhdCI6MTcxMTYzMzA5NCwiZXhwIjoxNzExNjM0ODk0fQ.IgeDBQ-kYI8oOMtQdgtSVlTCPPspw7votSUvDDmN2A8
Content-Type: application/json

{
    student:
            {
                name: 'abebe behailu',
                email: 'abebehailu@student.com',
                password: 'abe1234',
                age: 18,
                phone: '0978253416',
                type: 'student',
                dept: 'Software Engineering',
                batch: '4th year b',
                StudentID: 'ETS0123/16'
            }
}

POST http://localhost:5000/admin/create/student
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MDU3MTZmMTAwZWU2YWU1OWIyODZhNiIsImVtYWlsIjoidGVzdEVtYWlsIiwibmFtZSI6InRlc3RBZG1pbiIsInR5cGUiOiJhZG1pbiIsImlhdCI6MTcxMTYzMzA5NCwiZXhwIjoxNzExNjM0ODk0fQ.IgeDBQ-kYI8oOMtQdgtSVlTCPPspw7votSUvDDmN2A8

Content-Type: application/json

{
    student:
            {
                name:'Bereket Endale', 
                email: 'bereketendale@student.com',
                password: bereket1234,
                age:18,
                phone:0978253416,
                type: student,
                dept: Software Engineering,
                batch: "4th year b",
                StudentID: "ETS0123/16"
            }
}

```

We get a response from database

```
{
  "name": "abebe behailu",
  "email": "abebehailu@student.com",
  "password": "*****",
  "age": 18,
  "phone": "0978253416",
  "type": "student",
  "_id": "660586927aace7f8ce39327a",
  "dept": "Software Engineering",
  "batch": "4th year b",
  "StudentID": "ETS0123/16",
  "registered": false,
  "courses": [
    
  ],
  "requests": [
    
  ],
  "recieved": [
    
  ],
  "responses": [
    
  ],
  "droppedCourses": [
    
  ],
  "addCourses": [
    
  ],
  "createdAt": "2024-03-28T15:02:42.878Z",
  "updatedAt": "2024-03-28T15:02:42.878Z"
}
...
...
```
Creating instructors

### Important field for creating instructor
+ name
+ email
+ password for the student
+ age (type integer)
+ phone (stored as a string)
+ type can only be a student, admin or instructor
+ dept department of the instructor
+ qualification example Bsc, Masters

and must be included in the instructor object

```
POST http://localhost:5000/admin/create/ins
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MDU3MTZmMTAwZWU2YWU1OWIyODZhNiIsImVtYWlsIjoidGVzdEVtYWlsIiwibmFtZSI6InRlc3RBZG1pbiIsInR5cGUiOiJhZG1pbiIsImlhdCI6MTcxMTYzMzA5NCwiZXhwIjoxNzExNjM0ODk0fQ.IgeDBQ-kYI8oOMtQdgtSVlTCPPspw7votSUvDDmN2A8

Content-Type: application/json

{
  instructor: {
    name: "Yonas Amsalu",
    email: "yonas@student.com",
    password: "yonas1234",
    age: 32,
    phone: "094637281234",
    type: "instructor",
    dept: "Software Engineering",
    qualification: "Masters in Software Design"
  }
}

POST http://localhost:5000/admin/create/ins
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MDU3MTZmMTAwZWU2YWU1OWIyODZhNiIsImVtYWlsIjoidGVzdEVtYWlsIiwibmFtZSI6InRlc3RBZG1pbiIsInR5cGUiOiJhZG1pbiIsImlhdCI6MTcxMTYzMzA5NCwiZXhwIjoxNzExNjM0ODk0fQ.IgeDBQ-kYI8oOMtQdgtSVlTCPPspw7votSUvDDmN2A8

Content-Type: application/json

{
  instructor: {
    name: "Arebu Abdella",
    email: "arebu@instructor.com",
    password: " arebu1234",
    age: 43,
    phone: "0934215647",
    type: "instructor",
    dept: "Electrical & Computer Engineering",
    qualification: "Masters in Computer Engineering"
  }
}

```

Response

```
{
  "name": "Yonas Amsalu",
  "email": "yonas@student.com",
  "password": "*****",
  "age": 32,
  "phone": "094637281234",
  "type": "instructor",
  "_id": "66059d1c7aace7f8ce393282",
  "dept": "Software Engineering",
  "qualification": "Masters in Software Design",
  "coursesAssigned": [
    
  ],
  "requests": [
    
  ],
  "recieved": [
    
  ],
  "responses": [
    
  ],
  "assignedStudents": [
    
  ],
  "createdAt": "2024-03-28T16:38:52.904Z",
  "updatedAt": "2024-03-28T16:38:52.904Z"
}
...
...
```

now we can use them to create a course, add a course, drop a course, make a request to an instructor respond to an instructoran soon ...

For instance to add a course to a student abebe behailu
we must register the student

```
PUT http://localhost:5000/admin/reg/student
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MDU3MTZmMTAwZWU2YWU1OWIyODZhNiIsImVtYWlsIjoidGVzdEVtYWlsIiwibmFtZSI6InRlc3RBZG1pbiIsInR5cGUiOiJhZG1pbiIsImlhdCI6MTcxMTYzMzA5NCwiZXhwIjoxNzExNjM0ODk0fQ.IgeDBQ-kYI8oOMtQdgtSVlTCPPspw7votSUvDDmN2A8

Content-Type: application/json
{
   student:
        {
            email: 'abebehailu@student.com'
        }
}
```

After registering student now we can create a course for the student

```
POST http://localhost:5000/admin/course/student
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MDU3MTZmMTAwZWU2YWU1OWIyODZhNiIsImVtYWlsIjoidGVzdEVtYWlsIiwibmFtZSI6InRlc3RBZG1pbiIsInR5cGUiOiJhZG1pbiIsImlhdCI6MTcxMTYzMzA5NCwiZXhwIjoxNzExNjM0ODk0fQ.IgeDBQ-kYI8oOMtQdgtSVlTCPPspw7votSUvDDmN2A8

Content-Type: application/json

{
  student: {
    instructor: "Yonas Amsalu",
    email: "abebehailu@student.com",
    name: "Object Oriented Programming",
    credit: 4,
    batch: "4th b",
    semister: 2
  }
}

```
Then the response will be

```
{
  "_id": "660586927aace7f8ce39327a",
  "name": "abebe behailu",
  "email": "abebehailu@student.com",
  "password": "*****",
  "age": 18,
  "phone": "0978253416",
  "type": "student",
  "dept": "Software Engineering",
  "batch": "4th year b",
  "StudentID": "ETS0123/16",
  "registered": true,
  "courses": [
    {
      "instructor": "Yonas Amsalu",
      "name": "Object Oriented Programming",
      "credit": 4,
      "year": "2024",
      "semister": 2,
      "grade": "-",
      "status": "taking",
      "_id": "6605a3557aace7f8ce393292"
    }
  ],
  "requests": [
    
  ],
  "recieved": [
    
  ],
  "responses": [
    
  ],
  "droppedCourses": [
    
  ],
  "addCourses": [
    
  ],
  "createdAt": "2024-03-28T15:02:42.878Z",
  "updatedAt": "2024-03-28T17:05:25.251Z"
}
```
And also if we see the instructors data

```
{
    _id: ObjectId('66059d1c7aace7f8ce393282'),
    name: 'Yonas Amsalu',
    email: 'yonas@student.com',
    password: '$2b$10$2Z/WpuxS9WTr4WCSRFr6a.aEbzOlMMDbuC6lrPHuYLoF5YW8hqwPq',
    age: 32,
    phone: '094637281234',
    type: 'instructor',
    dept: 'Software Engineering',
    qualification: 'Masters in Software Design',
    coursesAssigned: [
      {
        name: 'Object Oriented Programming',
        credit: 4,
        numberClass: 1,
        year: '2024',
        semister: 2,
        batch: '4th b',
        _id: ObjectId('6605ac3016619e430d70f3b6')
      }
    ],
    requests: [],
    recieved: [],
    responses: [],
    assignedStudents: [
      {
        course: 'Object Oriented Programming',
        credit: 4,
        StudentID: 'ETS0123/16',
        grade: '-',
        attendance: 0,
        batch: '4th b',
        semister: 2,
        year: '2024',
        add: false,
        _id: ObjectId('6605ac3016619e430d70f3b9')
      }
    ],
    createdAt: ISODate('2024-03-28T16:38:52.904Z'),
    updatedAt: ISODate('2024-03-28T17:43:12.662Z')
  }
```

Now student abebe can make a request to the instructor
keep in mind that authorization header is for student 

```
POST http://localhost:5000/student/issue
Autherization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MDU4NjkyN2FhY2U3ZjhjZTM5MzI3YSIsImVtYWlsIjoiYWJlYmVoYWlsdUBzdHVkZW50LmNvbSIsIlN0dWRlbnRJRCI6IkVUUzAxMjMvMTYiLCJ0eXBlIjoic3R1ZGVudCIsImlhdCI6MTcxMTY1MDUyMCwiZXhwIjoxNzExNjU3NzIwfQ.Y5dmRdIY-W6sx6UYnpJJmESxLb3HTgrNSceugu9sWRo

Content-Type: application/json
{
  student: {
    title: "requesting additional class to grasp the concept of inheritance",
    email: "abebehailu@student.com",
    body: "Mr.Yonas I would like to ask u to schedule an additional class to breifly understand the fundamental concept of OOP",
    info: {
      reciever: "66059d1c7aace7f8ce393282",
      sender: "660586927aace7f8ce39327a"
    }
  }
}
```

then we can see separate request object created in requests collection, 
request id added in the student and also recieved object of the instructor is appended with id.

```
[
  {
    _id: ObjectId('6605b8f5e6b219cd880e3309'),
    requests: {
      title: 'requesting additional class to grasp the concept of inheritance',
      body: 'Mr.Yonas I would like to ask u to schedule an additional class to breifly understand the fundamental concept of OOP',
      info: {
        sender: ObjectId('660586927aace7f8ce39327a'),
        reciever: ObjectId('66059d1c7aace7f8ce393282')
      },
      issueDate: ISODate('2024-03-28T18:37:41.465Z'),
      response: {
        message: null,
        responseDate: ISODate('2024-03-28T18:37:41.465Z')
      }
    },
    __v: 0
  }
],
{
    _id: ObjectId('66059d1c7aace7f8ce393282'),
    name: 'Yonas Amsalu',
    email: 'yonas@student.com',
    password: '$2b$10$2Z/WpuxS9WTr4WCSRFr6a.aEbzOlMMDbuC6lrPHuYLoF5YW8hqwPq',
    age: 32,
    phone: '094637281234',
    type: 'instructor',
    dept: 'Software Engineering',
    qualification: 'Masters in Software Design',
    coursesAssigned: [
      {
        name: 'Object Oriented Programming',
        credit: 4,
        numberClass: 1,
        year: '2024',
        semister: 2,
        batch: '4th b',
        _id: ObjectId('6605ac3016619e430d70f3b6')
      }
    ],
    requests: [],
    recieved: [
      {
        id: ObjectId('6605b8f5e6b219cd880e3309'),
        sender: ObjectId('660586927aace7f8ce39327a'),
        _id: ObjectId('6605b8f54bbf309cfaecff10')
      }
    ],
    responses: [],
    assignedStudents: [
      {
        course: 'Object Oriented Programming',
        credit: 4,
        StudentID: 'ETS0123/16',
        grade: '-',
        attendance: 0,
        batch: '4th b',
        semister: 2,
        year: '2024',
        add: false,
        _id: ObjectId('6605ac3016619e430d70f3b9')
      }
    ],
    createdAt: ISODate('2024-03-28T16:38:52.904Z'),
    updatedAt: ISODate('2024-03-28T18:37:41.501Z')
  }
```

Notice that in the instructor recieved object the id property is the _id of the request object.

When instructor responds

```
POST http://localhost:5000/instructor/resolve
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MDU5ZDFjN2FhY2U3ZjhjZTM5MzI4MiIsImVtYWlsIjoieW9uYXNAc3R1ZGVudC5jb20iLCJ0eXBlIjoiaW5zdHJ1Y3RvciIsImlhdCI6MTcxMTY1MTY0OSwiZXhwIjoxNzExNjU1MjQ5fQ.wvskdD7RTV3IhjCRyptaXC7wT3ACIuY7qcY1AuuGf1k

Content-Type: application/json

{
  instructor: {
    email: "yonas@student.com",
    body: "I will be very happy to schedule in next week notify others who wanna join",
    info: {
      sender: "66059d1c7aace7f8ce393282",
      id: "6605b8f5e6b219cd880e3309"
    }
  }
}

```

then we can see the response of the request and also instructor

```
[
  {
    _id: ObjectId('6605b8f5e6b219cd880e3309'),
    requests: {
      title: 'requesting additional class to grasp the concept of inheritance',
      body: 'Mr.Yonas I would like to ask u to schedule an additional class to breifly understand the fundamental concept of OOP',
      info: {
        sender: ObjectId('660586927aace7f8ce39327a'),
        reciever: ObjectId('66059d1c7aace7f8ce393282')
      },
      issueDate: ISODate('2024-03-28T18:37:41.465Z'),
      response: {
        message: 'I will be very happy to schedule in next week notify others who wanna join',
        responseDate: ISODate('2024-03-28T18:37:41.465Z')
      }
    },
    __v: 0
  }
]
{
    _id: ObjectId('66059d1c7aace7f8ce393282'),
    name: 'Yonas Amsalu',
    email: 'yonas@student.com',
    password: '$2b$10$2Z/WpuxS9WTr4WCSRFr6a.aEbzOlMMDbuC6lrPHuYLoF5YW8hqwPq',
    age: 32,
    phone: '094637281234',
    type: 'instructor',
    dept: 'Software Engineering',
    qualification: 'Masters in Software Design',
    coursesAssigned: [
      {
        name: 'Object Oriented Programming',
        credit: 4,
        numberClass: 1,
        year: '2024',
        semister: 2,
        batch: '4th b',
        _id: ObjectId('6605ac3016619e430d70f3b6')
      }
    ],
    requests: [],
    recieved: [
      {
        id: ObjectId('6605b8f5e6b219cd880e3309'),
        sender: ObjectId('660586927aace7f8ce39327a'),
        _id: ObjectId('6605b8f54bbf309cfaecff10')
      }
    ],
    responses: [
      {
        info: {
          id: ObjectId('6605b8f5e6b219cd880e3309'),
          sender: ObjectId('66059d1c7aace7f8ce393282')
        },
        body: 'I will be very happy to schedule in next week notify others who wanna join',
        _id: ObjectId('6605bc674bbf309cfaecff1b'),
        responseDate: ISODate('2024-03-28T18:52:23.521Z')
      }
    ],
    assignedStudents: [
      {
        course: 'Object Oriented Programming',
        credit: 4,
        StudentID: 'ETS0123/16',
        grade: '-',
        attendance: 0,
        batch: '4th b',
        semister: 2,
        year: '2024',
        add: false,
        _id: ObjectId('6605ac3016619e430d70f3b9')
      }
    ],
    createdAt: ISODate('2024-03-28T16:38:52.904Z'),
    updatedAt: ISODate('2024-03-28T18:52:23.518Z'),
    __v: 0
  }
```

All request and response are processed in Bull. therefore if for some reason bull processor is down once its up start processing from where it stopped given that when the endpoint requested added the process the queue.
