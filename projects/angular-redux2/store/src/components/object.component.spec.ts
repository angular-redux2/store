/**
 * Components
 */

import { get, set } from './object.component';

/**
 * Initialize global test invariant variable
 */

const storeStruct = {
    foo: 1,
    a: false,
    b: 0,
    c: '',
    d: undefined,
    level_1: {
        a: false,
        b: 0,
        c: '',
        d: undefined,
        bar: 2,
        level_2: {
            fooBar: 3,
            level_3: {
                key: 'x',
            }
        },
    }
}


describe('Should get a deeply nested property value from an object.', () => {
    test('Should select a first-level, second-level, third-level prop.', () => {
        expect(get(storeStruct, [ 'foo' ])).toBe(1);
        expect(get(storeStruct, [ 'level_1', 'bar' ])).toBe(2);
        expect(get(storeStruct, [ 'level_1', 'level_2', 'fooBar' ])).toBe(3);
    });

    test('should select falsy values properly.', () => {
        expect(get(storeStruct, [ 'a' ])).toBe(false);
        expect(get(storeStruct, [ 'b' ])).toBe(0);
        expect(get(storeStruct, [ 'c' ])).toBe('');
        expect(get(storeStruct, [ 'd' ])).toBe(undefined);
    });

    test('Should select nested falsy values properly.', () => {
        expect(get(storeStruct, [ 'level_1', 'a' ])).toBe(false);
        expect(get(storeStruct, [ 'level_1', 'b' ])).toBe(0);
        expect(get(storeStruct, [ 'level_1', 'c' ])).toBe('');
        expect(get(storeStruct, [ 'level_1', 'd' ])).toBe(undefined);
    });

    test('Should not freak if the object is undefined.', () => {
        expect(get(null, [ 'foo', 'd' ])).toBe(undefined);
    });

    test('Should not panic if the object is undefined.', () => {
        expect(get(undefined, [ 'foo', 'd' ])).toBe(undefined);
    });

    test('Should not panic if the object is a primitive.', () => {
        expect(get(42, [ 'foo', 'd' ])).toBe(undefined);
    });

    test('Should return undefined for a nonexistent prop.', () => {
        expect(get(storeStruct, [ 'bar' ])).toBe(undefined);
    });

    test('Should return undefined for a nonexistent path.', () => {
        expect(get(storeStruct, [ 'bar', 'test' ])).toBe(undefined);
    });

    test('Should return undefined for a nested nonexistent prop.', () => {
        expect(get(storeStruct, [ 'foo', 'bar' ])).toBe(undefined);
    });

    test('Should select array elements properly.', () => {
        const test = [ 'foo', 'bar' ];

        expect(get(test, [ 0 ])).toBe('foo');
        expect(get(test, [ '0' ])).toBe('foo');
        expect(get(test, [ 1 ])).toBe('bar');
        expect(get(test, [ '1' ])).toBe('bar');
        expect(get(test, [ 2 ])).toBe(undefined);
        expect(get(test, [ '2' ])).toBe(undefined);
    });


    test('Should select nested array elements properly.', () => {
        const test = { test: [ 'foo', 'bar' ] };

        expect(get(test, [ 'test', 0 ])).toBe('foo');
        expect(get(test, [ 'test', '0' ])).toBe('foo');
        expect(get(test, [ 'test', 1 ])).toBe('bar');
        expect(get(test, [ 'test', '1' ])).toBe('bar');
        expect(get(test, [ 'test', 2 ])).toBe(undefined);
        expect(get(test, [ 'test', '2' ])).toBe(undefined);
    });
});

/**
 * Sets a deeply-nested property value from an object,
 * given a 'path' of property names or array indices.
 */

describe('Should sets a deeply-nested property value and return a new object.', () => {
    test('Should return undefined.', () => {
        expect(set(undefined, [ 'foo', 'bar' ], 5)).toBe(undefined);
    });

    test('Should performs a shallow set correctly without mutation.', () => {
        const original = { a: 1 };

        expect(set(original, [ 'b' ], 2)).toStrictEqual({ a: 1, b: 2 });
        expect(original).toStrictEqual({ a: 1 });
    });

    test('Should performs a deeply nested set correctly without mutation.', () => {
        const original = { a: 1 };
        const expected = {
            a: 1,
            b: {
                c: {
                    d: 2,
                },
            },
        };

        expect(set(original, [ 'b', 'c', 'd' ], 2)).toStrictEqual(expected);
        expect(original).toStrictEqual({ a: 1 });
    });

    test('Should performs a deeply nested set with existing keys without mutation.', () => {
        const original = {
            a: 1,
            b: {
                wat: 3,
            },
        };

        const expected = {
            a: 1,
            b: {
                wat: 3,
                c: {
                    d: 2,
                },
            },
        };

        expect(set(original, [ 'b', 'c', 'd' ], 2)).toStrictEqual(expected);
        expect(original).toStrictEqual({ a: 1, b: { wat: 3 } });
    });
});

