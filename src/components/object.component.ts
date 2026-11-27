/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { PathType } from '../interfaces/store.interface';

/**
 * Whether a value is a plain object or an array.
 *
 * @param value - The value to check
 * @returns `true` for an array or an object whose prototype is `Object.prototype` or `null`
 *
 * @remarks
 * It draws the line between state that the library copies, drafts, or freezes, and values that it leaves alone,
 * so a `Date`, `Map`, `Set`, or class instance in the state stays usable as it is.
 * It accepts the `Object.prototype` of any realm, a prototype without a prototype of its own,
 * so an object from an iframe, a worker message, or a test environment such as jsdom still counts as plain.
 *
 * @example
 * ```ts
 * isPlain({ a: 1 });              // true
 * isPlain([ 1, 2 ]);              // true
 * isPlain(Object.create(null));   // true
 * isPlain(new Date());            // false
 * isPlain(null);                  // false
 * ```
 *
 * @since 6.0.0
 */

export function isPlain(value: unknown): value is Record<PropertyKey, unknown> {
    if (Array.isArray(value)) return true;
    if (value === null || typeof value !== 'object') return false;
    const prototype = Object.getPrototypeOf(value);

    return prototype === null || Object.getPrototypeOf(prototype) === null;
}

/**
 * Returns a shallow copy of an array or object.
 *
 * @typeParam Value - The type of the value to copy
 * @param value - The array or object to copy
 * @returns A new array or object with the same top-level entries
 *
 * @remarks
 * An array is copied with `slice`, and anything else is spread into a new object,
 * so nested values stay shared with the original.
 * A primitive, `null`, or `undefined` comes back as an empty object.
 *
 * @example
 * ```ts
 * const original = { user: { name: 'Ada' } };
 * const result = copy(original);
 *
 * result === original;           // false
 * result.user === original.user; // true
 * ```
 *
 * @since 6.0.0
 */

export function copy<Value>(value: Value): Value {
    return <Value> (Array.isArray(value) ? value.slice() : { ...value });
}

/**
 * Reads the value at a path in a nested object.
 *
 * @param target - The object to read from
 * @param path - The keys and indexes to walk, outermost first
 * @returns The value at the path, or `undefined` when the path leaves the object tree
 *
 * @remarks
 * The walk returns `undefined` as soon as an intermediate value is not an object, so it never throws.
 * A string along the path counts as a leaf, so `[ 'name', 0 ]` does not read the first character of a name.
 * An empty path returns the target itself.
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
 * @since 6.0.0
 */

export function get(target: unknown, path: PathType): unknown {
    let result = target;

    for (const key of path) {
        if (typeof result !== 'object' || result === null) return undefined;
        result = (<Record<PropertyKey, unknown>> result)[key];
    }

    return result;
}

/**
 * Returns a copy of an object with a value written at a path.
 *
 * @typeParam Target - The type of the object to start from
 * @param target - The object to start from, which stays unchanged
 * @param path - The keys and indexes to walk, outermost first
 * @param value - The value to write at the last key
 * @returns A copy of the target with the value set, or the value itself for an empty path
 *
 * @remarks
 * The target and every value along the path are copied shallowly, and branches off the path stay shared.
 * A missing or non-object value along the path, the target included, becomes a new empty object.
 * An empty path replaces the whole target with the value.
 *
 * @example
 * ```ts
 * const original = { a: 1, b: { wat: 3 } };
 *
 * set(original, [ 'b', 'c', 'd' ], 2); // { a: 1, b: { wat: 3, c: { d: 2 } } }
 * set(original, [], 5);                // 5
 * original.b;                          // { wat: 3 } - the original is untouched
 * ```
 *
 * @see get
 *
 * @since 6.0.0
 */

export function set<Target>(target: Target, path: PathType, value: unknown): Target {
    if (path.length === 0) {
        return <Target> value;
    }

    const [ key, ...rest ] = path;
    const result = <Record<PropertyKey, unknown>> copy(typeof target === 'object' && target !== null ? target : {});
    result[key] = rest.length ? set(result[key], rest, value) : value;

    return <Target> result;
}
