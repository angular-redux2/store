/**
 * Imports
 */

import { runInNewContext } from 'vm';
import { copy, get, isPlain, set } from './object.component';

/**
 * Tests
 */

describe('isPlain', () => {
    test.each(
        { case: 'an array', value: [ 1, 2 ] },
        { case: 'an empty array', value: [] },
        { case: 'an object literal', value: { a: 1 } },
        { case: 'an object without a prototype', value: Object.create(null) },
        { case: 'an object from another realm', value: runInNewContext('({ a: 1 })') }
    )('should accept $case', ({ value }) => {
        expect(isPlain(value)).toBe(true);
    });

    test.each(
        { case: 'a Date', value: new Date() },
        { case: 'a Map', value: new Map() },
        { case: 'a Set', value: new Set() },
        { case: 'a class instance', value: new (class Point {})() },
        { case: 'a function', value: () => undefined },
        { case: 'null', value: null },
        { case: 'undefined', value: undefined },
        { case: 'a number', value: 1 },
        { case: 'a string', value: 'a' }
    )('should reject $case', ({ value }) => {
        expect(isPlain(value)).toBe(false);
    });
});

describe('copy', () => {
    test('should copy an object and keep its nested values shared', () => {
        const original = { a: 1, b: { c: 2 } };
        const result = copy(original);

        expect(result).toEqual(original);
        expect(result).not.toBe(original);
        expect(result.b).toBe(original.b);
    });

    test('should copy an array and keep it an array', () => {
        const original = [ 1, 2, { a: 3 }];
        const result = copy(original);

        expect(result).toEqual(original);
        expect(result).not.toBe(original);
        expect(Array.isArray(result)).toBe(true);
    });

    test.each(
        { case: 'undefined', value: undefined },
        { case: 'null', value: null }
    )('should turn $case into an empty object', ({ value }) => {
        expect(copy(value)).toEqual({});
    });
});

describe('get', () => {
    const state = {
        a: false,
        b: 0,
        c: '',
        d: undefined,
        level1: {
            bar: 2,
            level2: { fooBar: 3 },
            list: [ 'foo', 'bar' ]
        }
    };

    test.each`
        path                                  | expected
        ${ [ 'level1', 'bar' ] }              | ${ 2 }
        ${ [ 'level1', 'level2', 'fooBar' ] } | ${ 3 }
        ${ [ 'level1', 'list', 0 ] }          | ${ 'foo' }
        ${ [ 'level1', 'list', '1' ] }        | ${ 'bar' }
        ${ [ 'level1', 'list', 2 ] }          | ${ undefined }
    `('should read $path', ({ path, expected }: any) => {
        expect(get(state, path)).toBe(expected);
    });

    test.each`
        key    | expected
        ${ 'a' } | ${ false }
        ${ 'b' } | ${ 0 }
        ${ 'c' } | ${ '' }
        ${ 'd' } | ${ undefined }
    `('should read the falsy value at $key as it is', ({ key, expected }: any) => {
        expect(get(state, [ key ])).toBe(expected);
    });

    test('should return the target itself for an empty path', () => {
        expect(get(state, [])).toBe(state);
    });

    test.each(
        { case: 'a missing key', path: [ 'missing' ] },
        { case: 'a path through a missing branch', path: [ 'missing', 'deeper' ] },
        { case: 'a path through a number', path: [ 'level1', 'bar', 'deeper' ] },
        { case: 'a path through a string', path: [ 'level1', 'list', 0, 0 ] }
    )('should return undefined for $case', ({ path }) => {
        expect(get(state, path)).toBeUndefined();
    });

    test.each(
        { case: 'undefined', target: undefined },
        { case: 'null', target: null },
        { case: 'a primitive', target: 42 }
    )('should return undefined for a path into $case', ({ target }) => {
        expect(get(target, [ 'foo' ])).toBeUndefined();
    });
});

describe('set', () => {
    test('should write the value and leave the original untouched', () => {
        const original = { a: { b: { c: 1 } } };
        const result = set(original, [ 'a', 'b', 'c' ], 2);

        expect(result).toEqual({ a: { b: { c: 2 } } });
        expect(original).toEqual({ a: { b: { c: 1 } } });
    });

    test('should copy only the objects along the path', () => {
        const original = { a: { b: 1 }, other: { c: 2 } };
        const result = set(original, [ 'a', 'b' ], 3);

        expect(result).not.toBe(original);
        expect(result.a).not.toBe(original.a);
        expect(result.other).toBe(original.other);
    });

    test('should keep an array an array', () => {
        const result = set({ list: [ 1, 2, 3 ] }, [ 'list', 0 ], 9);

        expect(result).toEqual({ list: [ 9, 2, 3 ] });
        expect(Array.isArray(result.list)).toBe(true);
    });

    test.each(
        { case: 'a missing branch', original: { a: 1 }, expected: { a: 1, b: { c: 2 } } },
        { case: 'a primitive branch', original: { a: 1, b: 5 }, expected: { a: 1, b: { c: 2 } } },
        { case: 'an undefined target', original: undefined, expected: { b: { c: 2 } } }
    )('should create an object in place of $case', ({ original, expected }) => {
        expect(set(original, [ 'b', 'c' ], 2)).toEqual(expected);
    });

    test('should replace the whole target with the value for an empty path', () => {
        expect(set({ a: 1 }, [], 5)).toBe(5);
    });
});
