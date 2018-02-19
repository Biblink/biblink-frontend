export class Utils {
    static toJson(obj, onlyPublic = true) {
        const result = {};
        for (const key in obj) {
            if (onlyPublic) {
                console.log(key);
                if (key[ 0 ] === '_') {
                    continue;
                } else {
                    if (obj[ key ] instanceof Object) {
                        result[ key ] = this.toJson(obj[ key ]);
                    } else {
                        result[ key ] = obj[ key ];
                    }
                }
            } else {
                if (obj[ key ] instanceof Object) {
                    result[ key ] = this.toJson(obj[ key ]);
                } else {
                    result[ key ] = obj[ key ];
                }
            }
        }
        return result;
    }
}
