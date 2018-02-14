import {UserDataInterface} from './user-data.interface';

export class User {
    constructor(private _name, private _email, private _data: UserDataInterface) {
    }

    get name() {
        return this._name;
    }

    get email() {
        return this._email;
    }

    get data() {
        return this._data
    }
}