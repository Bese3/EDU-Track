/* eslint-disable */
import mongoose from 'mongoose';
const { Schema } = mongoose;

export default class BaseModel {
    constructor (obj={}) {
        // console.log(kwargs)

        // if (typeof name != "string") new Error('name not string');
        // if (typeof email != "string")  new Error('email not string');
        // if (typeof password != "string") new Error('password not string');
        // if (typeof age != "number")  new Error('age not number');
        // if (typeof phone != "number") new Error('phone not number');
        // if (typeof type != "string") new Error('type not string');

        this._schema = new Schema({
            name: {
             type: String,
             required: true
            },
            email:{
                type: String,
                required: true
            },
            password:{
                type: String,
                required: true
            },
            age: {
                type: Number,
                required: true
            },
            phone: {
                type: Number,
                required: true
            },
            type: {
                type: String,
                required: true
            }
        }, { timestamps: true });

        this.model = {
            name: obj.name,
            email: obj.email,
            password: obj.password,
            age: obj.age,
            phone: obj.phone,
            type: obj.type
        }
        
    }

    getSchema() {
        return this._schema
    }

    toString() {
        let result = "";
        for (const key of Object.keys(this.model)) {
            result += `${key}: ${this.model[key]}`
            if (key != 'type')
               result += ", "
        }
        return `[${this.constructor.name}] (${this._id}) {${result}}`
    }

    save(model) {
        if (!(model instanceof mongoose.Model)) {
            return new Error('model is not Mongoose type')
        }
        let returnValue = false;
        model.save()
        .then((_savedData) => {
            console.log(`data saved`);
            returnValue = true;
        })
        .catch((err) => {
            console.log(`error saving data ${err}`);
        })
        return returnValue;
    }
    
}
