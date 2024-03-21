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
}