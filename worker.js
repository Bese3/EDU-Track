/* eslint-disable */
import Bull from 'bull';
import Processor from './utils/requestProcesser.js';

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const studRequestQueue = new Bull('studrequestQueue', REDIS_URL);
const instRequestQueue = new Bull('instrequestQueue', REDIS_URL);
const studResponseQueue = new Bull('studresponseQueue', REDIS_URL);
const instResponseQueue = new Bull('instresponseQueue', REDIS_URL);

console.log(`Worker is Listening for jobs`);

studRequestQueue.process(async (job) => {
    console.log(`Worker processing request job ${job.id}`);
    if (!job.data.sender) {
        return new Error('sender id missing');
    }
    if (!job.data.reciever) {
        return new Error('reciever id missing');
    }
    if (!job.data.id) {
        return new Error('request id missing');
    }
    await Processor.stuReqProcessor(job.data);
    console.log(`request Job ${job.id} processed`);
});

instRequestQueue.process(async (job) => {
    console.log(`Worker processing instructor request job ${job.id}`);
    if (!job.data.sender) {
        return new Error('sender id missing');
    }
    if (!job.data.reciever) {
        return new Error('reciever id missing');
    }
    if (!job.data.id) {
        return new Error('request id missing');
    }
    await Processor.instReqProcessor(job.data);
    console.log(`request Job ${job.id} processed`);
})

studResponseQueue.process(async (job) => {
    console.log(`Worker processing response job ${job.id}`);
    if (!job.data.sender) {
        return new Error('sender id missing');
    }
    if (!job.data.body) {
        return new Error('body missing');
    }
    if (!job.data.id) {
        return new Error('request id missing');
    }
    if (!job.data.email) {
        return new Error('email missing');
    }
    await Processor.stuResProcessor(job.data);
    console.log(`response Job ${job.id} processed`);
})

instResponseQueue.process(async (job) => {
    console.log(`Worker processing instructor response job ${job.id}`);
    if (!job.data.sender) {
        return new Error('sender id missing');
    }
    if (!job.data.body) {
        return new Error('body missing');
    }
    if (!job.data.id) {
        return new Error('request id missing');
    }
    if (!job.data.email) {
        return new Error('email missing');
    }
    await Processor.instrResProcessor(job.data);
    console.log(`response Job ${job.id} processed`);
})
