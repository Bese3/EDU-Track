/* eslint-disable */
import AuthController from "../controllers/AuthController.js";
import mongoose from "mongoose";


export default class Processor { 
    
    static async stuReqProcessor(data) {
        let sender = mongoose.Types.ObjectId.createFromHexString(data.sender);
        let reciever = mongoose.Types.ObjectId.createFromHexString(data.reciever);
        let id = mongoose.Types.ObjectId.createFromHexString(data.id);
        let result = await AuthController.instmodel().findBy({'_id': reciever}, 'instructors');
        if (result.length === 0) {
            return new Error('instructor not found')
        }
        let upDoc = {recieved: {id, sender}};
        await AuthController.instmodel().updateDocList({'_id': reciever}, upDoc, 'instructors');
        upDoc = {requests: {requestId: id}}
        await AuthController.stumodel().updateDocList({'_id': sender}, upDoc, 'students');
    }

    static async instReqProcessor(data) {
        let sender = mongoose.Types.ObjectId.createFromHexString(data.sender);
        let reciever = mongoose.Types.ObjectId.createFromHexString(data.reciever);
        let id = mongoose.Types.ObjectId.createFromHexString(data.id);
        let result = await AuthController.instmodel().findBy({'_id': reciever}, 'students');
        if (result.length === 0) {
            return new Error('student not found')
        }
        let upDoc = {recieved: {id, sender}};
        await AuthController.instmodel().updateDocList({'_id': reciever}, upDoc, 'students');
        upDoc = {requests: {requestId: id}}
        await AuthController.stumodel().updateDocList({'_id': sender}, upDoc, 'instructors');

    }

    static async stuResProcessor(data) {
        let reqId = mongoose.Types.ObjectId.createFromHexString(data.id);
        await AuthController.reqmodel().reqModel.model('requests').updateOne({'_id': reqId}, {$set: {'requests.response.message': data.body}});
        // reqId = mongoose.Types.ObjectId.createFromHexString(reqId);
        let sender = (data.sender);
        let upDoc = {responses: {
            info: {
                id: reqId,
                sender
            },
            body: data.body
          }
        };
        try {
             await AuthController.stumodel().updateDocList({'email': data.email}, upDoc, 'students');
        }
        catch(err) {
            console.log(err)
        }
    }

    static async instrResProcessor(data){ 
        let reqId = mongoose.Types.ObjectId.createFromHexString(data.id);
        await AuthController.reqmodel().reqModel.model('requests').updateOne({'_id': reqId}, {$set: {'requests.response.message': data.body}});
        // reqId = mongoose.Types.ObjectId.createFromHexString(reqId);
        let sender = (data.sender);
        let upDoc = {responses: {
            info: {
                id: reqId,
                sender
            },
            body: data.body
          }
        };
        try {
             await AuthController.stumodel().updateDocList({'email': data.email}, upDoc, 'instructos');
        }
        catch(err) {
            console.log(err)
        }
    }
}
