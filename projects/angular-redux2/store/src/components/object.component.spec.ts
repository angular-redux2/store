/**
 * angular-redux2
 */

import { get, set, shallowCopy } from './object.component';

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
        arr: [
            'test',
            'array',
            'string'
        ]
    }
};
describe('shallowCopy', () => {
    test('should create a shallow copy of an object', () => {
        const obj = { a: 1, b: { c: 2 } };
        const copy = shallowCopy(obj);
        expect(copy).toEqual(obj);
        expect(copy).not.toBe(obj);
    });

    test('should create a shallow copy of an array', () => {
        const arr = [ 1, 2, { a: 3 }];
        const copy = shallowCopy(arr);
        expect(copy).toEqual(arr);
        expect(copy).not.toBe(arr);
    });

    test('should return empty object for undefined input', () => {
        const obj = undefined;
        const copy = shallowCopy(obj);
        expect(copy).toEqual({});
    });
});

describe('get', () => {
    test('should return the value at the specified path', () => {
        const obj = { a: { b: { c: 1 } } };
        expect(get(obj, [ 'a', 'b', 'c' ])).toBe(1);
    });

    test('should return undefined for invalid path', () => {
        const obj = { a: { b: { c: 1 } } };
        expect(get(obj, [ 'a', 'b', 'd' ])).toBeUndefined();
        expect(get(obj, [ 'a', 'c', 'd' ])).toBeUndefined();
        expect(get(obj, [ 'd' ])).toBeUndefined();
    });

    test('should return the root object for empty path', () => {
        const obj = { a: { b: { c: 1 } } };
        expect(get(obj, [])).toEqual(obj);
    });

    describe('should get a deeply nested property value from an object', () => {
        describe.each([
            [[ 'foo' ], 1 ],
            [[ 'level_1', 'bar' ], 2 ],
            [[ 'level_1', 'level_2', 'fooBar' ], 3 ],
        ])('get() should select a deeply nested property', (path, expected) => {
            test(`path ${JSON.stringify(path)} should return ${expected}`, () => {
                expect(get(storeStruct, path)).toEqual(expected);
            });
        });

        describe.each([
            [ 'a', false ],
            [ 'b', 0 ],
            [ 'c', '' ],
            [ 'd', undefined ],
        ])('get() should select falsy values properly', (prop, expected) => {
            test(`property '${prop}' should return ${expected}`, () => {
                expect(get(storeStruct, [ prop ])).toEqual(expected);
            });
        });

        describe.each([
            [ 'a', false ],
            [ 'b', 0 ],
            [ 'c', '' ],
            [ 'd', undefined ],
        ])('get() should select nested falsy values properly', (prop, expected) => {
            test(`property 'level_1.${prop}' should return ${expected}`, () => {
                expect(get(storeStruct, [ 'level_1', prop ])).toEqual(expected);
            });
        });

        test('get() should not panic if the object is undefined', () => {
            expect(get(undefined, [ 'foo', 'd' ])).toEqual(undefined);
        });

        test('get() should not panic if the object is a primitive', () => {
            expect(get(42, [ 'foo', 'd' ])).toEqual(undefined);
        });

        test('get() should return undefined for a nonexistent prop', () => {
            expect(get(storeStruct, [ 'bar' ])).toEqual(undefined);
        });

        test('get() should return undefined for a nonexistent path', () => {
            expect(get(storeStruct, [ 'bar', 'test' ])).toEqual(undefined);
        });

        describe.each([
            [[ 0 ], 'foo' ],
            [[ '0' ], 'foo' ],
            [[ 1 ], 'bar' ],
            [[ '1' ], 'bar' ],
            [[ 2 ], undefined ],
            [[ '2' ], undefined ],
        ])('get() should select array elements properly', (path, expected) => {
            test(`path ${JSON.stringify(path)} should return ${expected}`, () => {
                const test = [ 'foo', 'bar' ];
                expect(get(test, path)).toEqual(expected);
            });
        });
    });

    describe.each([
        [[ 'test', 0 ], 'foo' ],
        [[ 'test', '0' ], 'foo' ],
        [[ 'test', 1 ], 'bar' ],
        [[ 'test', '1' ], 'bar' ],
        [[ 'test', 2 ], undefined ],
        [[ 'test', '2' ], undefined ],
    ])('get() should select nested array elements properly', (path, expected) => {
        test(`path ${JSON.stringify(path)} should return ${JSON.stringify(expected)}`, () => {
            const test = { test: [ 'foo', 'bar' ] };
            expect(get(test, path)).toBe(expected);
        });
    });

    test('Should return an array and allow find function.', () => {
        const array = get(storeStruct, [ 'level_1', 'arr' ]);
        const result = array.find((value: string) => value == 'test');
        expect(result).toStrictEqual('test');
    });
});

describe('set', () => {
    test('should set the value at the specified path', () => {
        const obj = { a: { b: { c: 1 } } };
        const copy = set(obj, [ 'a', 'b', 'c' ], 2);
        expect(copy).toEqual({ a: { b: { c: 2 } } });
        expect(copy).not.toBe(obj);
    });

    test('should create intermediate keys if they do not exist', () => {
        const obj = { a: { b: {} } };
        const copy = set(obj, [ 'a', 'b', 'c' ], 1);
        expect(copy).toEqual({ a: { b: { c: 1 } } });
    });

    test('should return input object for undefined path', () => {
        const obj = { a: 1 };
        const copy = set(obj, <any>undefined, 2);
        expect(copy).toBe(obj);
    });

    test('should return input object for null path', () => {
        const obj = { a: 1 };
        const copy = set(obj, <any>null, 2);
        expect(copy).toBe(obj);
    });

    test('should return input object for empty path', () => {
        const obj = { a: 1 };
        const copy = set(obj, [], 2);
        expect(copy).toEqual(obj);
    });

    describe('Should sets a deeply-nested property value and return a new object.', () => {
        describe.each([
            [ undefined, [ 'foo', 'bar' ], 5, undefined ],
            [{ arr: [ 1, 2, 3, 4 ] }, [ 'arr', '0' ], 2, { arr: [ 2, 2, 3, 4 ] }],
            [{ a: 1 }, [ 'b' ], 2, { a: 1, b: 2 }],
            [{ a: 1 }, [ 'b', 'c', 'd' ], 2, {
                a: 1,
                b: {
                    c: {
                        d: 2,
                    },
                },
            }],
            [{ a: 1, b: { wat: 3 } }, [ 'b', 'c', 'd' ], 2, {
                a: 1,
                b: {
                    wat: 3,
                    c: {
                        d: 2,
                    },
                },
            }],
        ])('set', (original, path, value, expected) => {
            test(`returns ${JSON.stringify(expected)}`, () => {
                expect(set(original, path, value)).toEqual(expected);
            });

            test('does not mutate the original object', () => {
                if (original) {
                    expect(set(original, path, value)).not.toBe(original);
                    expect(original).toEqual(original);
                }
            });
        });
    });
});
