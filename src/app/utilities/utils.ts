/**
 * Class of random utilities to assist in development
 */
export class Utils {
    /**
     * Converts an object to JSON
     * @example
     * toJson(object, false)
     *
     * @param {Object} obj Object to convert to json
     * @param onlyPublic Whether or not to only retrieve public variables
     * @returns Object in JSON format
     */
    static toJson(obj: Object, onlyPublic = true) {
        const result = {};
        for (const key in obj) {
            if (onlyPublic) {
                if (key[ 0 ] === '_') {
                    continue;
                } else {
                    if (obj[ key ] instanceof Object && !(obj[ key ] instanceof Array)) {
                        result[ key ] = this.toJson(obj[ key ]);
                    } else {
                        result[ key ] = obj[ key ];
                    }
                }
            } else {
                if (obj[ key ] instanceof Object && !(obj[ key ] instanceof Array)) {
                    result[ key ] = this.toJson(obj[ key ]);
                } else {
                    result[ key ] = obj[ key ];
                }
            }
        }
        return result;
    }
}
