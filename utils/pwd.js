import bcrypt from 'bcrypt';


export default class pwdHash {
    static async generateHash(password) {
        const hash = bcrypt.hash(password, 10);
        return hash;
    }

    static compare(password, hash) {
        const result = bcrypt.compare(password, hash);
        return result;
    }

    static filter(object, fields, redact){
        if (redact == null || typeof redact != 'string'){
            return new Error(`${redact} must be a string`)
        }
        for (const field of fields){
            if (!Object.keys(object).includes(field)) {
                return new Error(`object doesnt have ${field} property`);
            }
        object[field] = redact
        }
        return object
    }
}