/**
 * Import components
 */

import { get, set } from './object.component';

/**
 * Gets a deeply-nested property value from an object
 */

describe('Gets a deeply-nested property value from an object', () => {
    test('should select a first-level prop', () => {
        const test = { foo: 1 };
        expect(get(test, [ 'foo' ])).toBe(1);
    });

    test('should select a second-level prop', () => {
        const test = { foo: { bar: 2 } };
        expect(get(test, [ 'foo', 'bar' ])).toBe(2);
    });

    test('should select a third-level prop', () => {
        const test = { foo: { bar: { quux: 3 } } };
        expect(get(test, [ 'foo', 'bar', 'quux' ])).toBe(3);
    });

    test('should select falsy values properly', () => {
        const test = {
            a: false,
            b: 0,
            c: '',
            d: undefined,
        };
        expect(get(test, [ 'a' ])).toBe(false);
        expect(get(test, [ 'b' ])).toBe(0);
        expect(get(test, [ 'c' ])).toBe('');
        expect(get(test, [ 'd' ])).toBe(undefined);
    });

    test('should select nested falsy values properly', () => {
        const test = {
            foo: {
                a: false,
                b: 0,
                c: '',
                d: undefined,
            },
        };
        expect(get(test, [ 'foo', 'a' ])).toBe(false);
        expect(get(test, [ 'foo', 'b' ])).toBe(0);
        expect(get(test, [ 'foo', 'c' ])).toBe('');
        expect(get(test, [ 'foo', 'd' ])).toBe(undefined);
    });

    test('should not freak if the object is null', () =>
        expect(get(null, [ 'foo', 'd' ])).toBe(null));

    test('should not freak if the object is undefined', () =>
        expect(get(undefined, [ 'foo', 'd' ])).toBe(undefined));

    test('should not freak if the object is a primitive', () =>
        expect(get(42, [ 'foo', 'd' ])).toBe(undefined));

    test('should return undefined for a nonexistent prop', () => {
        const test = { foo: 1 };
        expect(get(test, [ 'bar' ])).toBe(undefined);
    });

    test('should return undefined for a nonexistent path', () => {
        const test = { foo: 1 };
        expect(get(test, [ 'bar', 'quux' ])).toBe(undefined);
    });

    test('should return undefined for a nested nonexistent prop', () => {
        const test = { foo: 1 };
        expect(get(test, [ 'foo', 'bar' ])).toBe(undefined);
    });

    test('should select array elements properly', () => {
        const test = [ 'foo', 'bar' ];
        expect(get(test, [ 0 ])).toBe('foo');
        expect(get(test, [ '0' ])).toBe('foo');
        expect(get(test, [ 1 ])).toBe('bar');
        expect(get(test, [ '1' ])).toBe('bar');
        expect(get(test, [ 2 ])).toBe(undefined);
        expect(get(test, [ '2' ])).toBe(undefined);
    });

    test('should select nested array elements properly', () => {
        const test = { quux: [ 'foo', 'bar' ] };
        expect(get(test, [ 'quux', 0 ])).toBe('foo');
        expect(get(test, [ 'quux', '0' ])).toBe('foo');
        expect(get(test, [ 'quux', 1 ])).toBe('bar');
        expect(get(test, [ 'quux', '1' ])).toBe('bar');
        expect(get(test, [ 'quux', 2 ])).toBe(undefined);
        expect(get(test, [ 'quux', '2' ])).toBe(undefined);
    });

    test('should defer to a native get function if it exists on the data', () => {
        const testPath = [ 'foo', 'bar' ];
        const test = {
            getIn: (path: (string | number)[]) => path === testPath ? 42 : undefined,
        };

        expect(get(test, testPath)).toBe(42);
        expect(get(test, [ 'some', 'path' ])).toBe(undefined);
    });
});

/**
 * Sets a deeply-nested property value from an object,
 * given a 'path' of property names or array indices.
 */

describe('Sets a deeply-nested property value from an object, given a \'path\' of property names or array indices.', () => {
    test('performs a shallow set correctly without mutation', () => {
        const original = { a: 1 };

        expect(set(original, [ 'b' ], 2)).toStrictEqual({ a: 1, b: 2 });
        expect(original).toStrictEqual({ a: 1 });
    });

    test('performs a deeply nested set correctly without mutation', () => {
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

    test('performs a deeply nested set with existing keys without mutation', () => {
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

    test('should use set method of an object (case of ImmutableJS)', () => {
        let setCalled = false;

        class TestClass {
            setIn() {
                setCalled = true;
            }
        }

        const original = {
            root: new TestClass(),
        };

        set(original, [ 'root', 'a', 'b', 'c' ], 123);
        expect(setCalled).toBe(true);
    });
});
