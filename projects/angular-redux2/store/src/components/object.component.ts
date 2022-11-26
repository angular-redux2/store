/**
 * Gets a deeply-nested property value from an object by given a 'path'
 * of property names or array indices.
 *
 * @example
 * ```typescript
 * const test = { foo: { bar: 2 } };
 * get(test, [ 'foo', 'bar' ]) // to be 2
 * ```
 *
 * @param object - the object to get a value from.
 * @param path - path to location in the object.
 *
 * @return any
 */

export function get(object: any, path: Array<string | number>): any {
    if (!object) {
        return undefined;
    }

    let result = object;

    for (let key of path) {
        if (result[key] === undefined) {
            return undefined;
        }

        result = result[key];
    }

    return result;
}

/**
 * Sets a deeply-nested property value from an object, given a 'path'
 * of property names or array indices. Path elements are created if
 * not there already. Does not mutate the given object.
 *
 * @example
 * ```typescript
 * const original = {
 *      a: 1,
 *      b: {
 *          wat: 3,
 *      },
 * };
 *
 * set(original, [ 'b', 'c', 'd' ], 2)
 * ```
 *
 * @param object - the object to set a value to.
 * @param path - path to location in the object.
 * @param value - the value to set in path location.
 *
 * @return object
 */

export function set(object: any, path: Array<string | number>, value: any): Object {
    if (!object) {
        return object;
    }

    const lastKey = path.at(-1) || '';
    const result = { ...object };
    let tempObjet = result;

    for (let key of path.slice(0, -1)) {
        if (tempObjet[key] === undefined) {
            tempObjet[key] = {};
        }

        tempObjet[key] = { ...tempObjet[key] };
        tempObjet = tempObjet[key];
    }

    tempObjet[lastKey] = value;

    return result;
}
