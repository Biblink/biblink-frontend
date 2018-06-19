import { GroupDataInterface } from './group-data.interface';

export class Group {
    constructor(public name, public uniqueID, public role, public data: GroupDataInterface) { }
}
