/**
 * Shallowly copies an array or object.
 * @param {any} object - The array or object to copy.
 * @returns {any} A shallow copy of the input array or object.
 */

export function shallowCopy(object: any): any {
    if (Array.isArray(object)) {
        return object.slice();
    }

    return Object.assign({}, object);
}

/**
 * Returns the value at the specified path in the given object.
 *
 * @example
 * ```typescript
 * const test = { foo: { bar: 2 } };
 * get(test, [ 'foo', 'bar' ]) // to be 2
 * ```
 *
 * @param {object} object - The object to get the value from.
 * @param {Array<string|number>} path - The path to the value.
 * @returns {*} - The value at the specified path, or undefined if the path is not valid.
 */

export function get(object: any, path: Array<string | number>): any {
    let result = object;

    for (const key of path) {
        if (typeof result === 'object' && result !== null) {
            result = Reflect.get(result, key);
        } else {
            return undefined;
        }
    }

    return result;
}

/**
 * Sets the value at the given path in the object.
 * If any intermediate keys in the path do not exist, they are created as empty objects.
 * A shallow copy of the object is made to avoid mutating the original object.
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
 * @param object - The object to set the value in.
 * @param path - The path to the key whose value should be set.
 * @param value - The value to set at the key.
 * @returns A shallow copy of the object with the new value set at the given path.
 */

export function set(object: any, path: Array<string | number | symbol>, value: any): any {
    if (!object || !Array.isArray(path) || path.length < 1) {
        return object;
    }

    const result = shallowCopy(object);
    let tempObjet = result;

    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];

        if (!tempObjet[key] || typeof tempObjet[key] !== 'object') {
            tempObjet[key] = {};
        } else {
            tempObjet[key] = shallowCopy(tempObjet[key]);
        }

        tempObjet = tempObjet[key];
    }

    tempObjet[path[path.length - 1]] = value;

    return result;
}
