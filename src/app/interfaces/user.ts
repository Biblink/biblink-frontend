import { UserDataInterface } from './user-data.interface';

export class User {
    constructor(public firstName, public lastName, public email, public data: UserDataInterface) {
    }

    get name() {
        return `${ this.firstName } ${ this.lastName }`;
    }
}
