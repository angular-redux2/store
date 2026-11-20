/**
 * Returns a shallow copy of an array or object.
 *
 * @param object - The array or object to copy
 * @returns A new array or object with the same top-level entries
 *
 * @remarks
 * An array is copied with `slice`, and anything else with `Object.assign` onto an empty object,
 * so nested values stay shared with the original.
 * A primitive or `null` comes back as an empty object.
 *
 * @example
 * ```ts
 * const original = { user: { name: 'Ada' } };
 * const copy = shallowCopy(original);
 *
 * copy === original;           // false
 * copy.user === original.user; // true
 * ```
 *
 * @since 5.0.0
 */

export function shallowCopy<T>(object: T): T {
    if (Array.isArray(object)) {
        return <T> object.slice();
    }

    return Object.assign({}, object);
}

/**
 * Reads the value at a path in a nested object.
 *
 * @param object - The object to read from
 * @param path - The keys and indexes to walk, outermost first
 * @returns The value at the path, or `undefined` when the path leaves the object tree
 *
 * @remarks
 * The walk returns `undefined` as soon as an intermediate value is not an object, so it never throws.
 * An empty path returns the object itself.
 *
 * @example
 * ```ts
 * const state = { foo: { bar: 2 } };
 *
 * get(state, [ 'foo', 'bar' ]);     // 2
 * get(state, [ 'foo', 'missing' ]); // undefined
 * get(state, []);                   // { foo: { bar: 2 } }
 * ```
 *
 * @see set
 *
 * @since 5.0.0
 */

export function get(object: unknown, path: Array<string | number>): unknown {
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
 * Returns a copy of an object with a value written at a path.
 *
 * @param object - The object to start from, which stays unchanged
 * @param path - The keys to walk, outermost first
 * @param value - The value to write at the last key
 * @returns A copy of the object with the value set, or the object itself when there is nothing to set
 *
 * @remarks
 * The object and every intermediate value along the path are copied shallowly, and branches off the path stay shared.
 * A missing or non-object intermediate value is replaced by a new empty object.
 * A falsy object, a non-array path, or an empty path returns the object unchanged.
 *
 * @example
 * ```ts
 * const original = { a: 1, b: { wat: 3 } };
 *
 * set(original, [ 'b', 'c', 'd' ], 2); // { a: 1, b: { wat: 3, c: { d: 2 } } }
 * original.b;                          // { wat: 3 } - the original is untouched
 * ```
 *
 * @see get
 *
 * @since 5.0.0
 */

export function set<T>(object: T, path: Array<string | number | symbol>, value: unknown): T {
    if (!object || !Array.isArray(path) || path.length < 1) {
        return object;
    }

    const [ key, ...rest ] = path;
    const result = <Record<PropertyKey, unknown>> shallowCopy(object);
    const child = result[key];
    result[key] = rest.length ? set(child && typeof child === 'object' ? child : {}, rest, value) : value;

    return <T> result;
}
