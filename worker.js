/* eslint-disable */
import Bull from 'bull';
import Processor from './utils/requestProcesser.js';

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const requestQueue = new Bull('studrequestQueue', REDIS_URL);
const responseQueue = new Bull('studresponseQueue', REDIS_URL);

console.log(`Worker is Listening for jobs`);

requestQueue.process(async (job) => {
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

responseQueue.process(async (job) => {
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
