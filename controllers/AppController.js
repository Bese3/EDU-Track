/* eslint-disable */
import dbClient from "../utils/db.js"


export default class AppController {
    static async getStatus (_req, res) {
        let returnValue;
        await dbClient.isAlive()
        .then(() => {
            returnValue = true;
        })
        .catch((err) => {
            returnValue = false;
        })
        res.json({'db': returnValue});
    }
}