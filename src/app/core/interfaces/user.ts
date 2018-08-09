import { UserDataInterface } from './user-data.interface';

export class User {
    constructor(public firstName, public lastName, public email, public data: UserDataInterface, public fcmTokens = {}) {
    }

    get name() {
        return `${ this.firstName } ${ this.lastName }`;
    }
}
