/**
 * angular-redux2
 */

import { get } from './object.component';
import { getSelectorType, resolver } from './selectors.component';

/**
 * Mocks
 */

jest.mock('./object.component');

describe('getSelectorType', () => {
    test('returns "property" for a string selector', () => {
        expect(getSelectorType('propName')).toBe('property');
    });

    test('returns "function" for a function selector', () => {
        expect(getSelectorType((state) => state)).toBe('function');
    });

    test('returns "path" for an array selector', () => {
        expect(getSelectorType([ 'one', 'two' ])).toBe('path');
    });

    test('returns "nil" for undefined selector', () => {
        expect(getSelectorType()).toBe('nil');
    });

    test.each([
        [ 'propName', 'property' ],
        [ 3, 'property' ],
        [ Symbol('whatever'), 'property' ],
        [ (state: any) => state, 'function' ],
        [[ 'one', 'two' ], 'path' ],
        [ undefined, 'nil' ],
    ])('detectSelectorType should get selector type \'%s\' for selector \'%s\'', (selector, expectedType) => {
        expect(getSelectorType(selector)).toBe(expectedType);
    });
});
describe('resolver', () => {
    test('returns a function for a string selector', () => {
        const fn = resolver('propName');
        expect(typeof fn).toBe('function');
    });

    test('returns a function for a function selector', () => {
        const fn = resolver((state) => state);
        expect(typeof fn).toBe('function');
    });

    test('returns a function for an array selector', () => {
        const fn = resolver([ 'one', 'two' ]);
        expect(typeof fn).toBe('function');
    });

    test('returns a function for undefined selector', () => {
        const fn = resolver();
        expect(typeof fn).toBe('function');
    });

    test('returns the correct function for a string selector', () => {
        const fn = resolver('propName');
        const state = { propName: 'value' };
        expect(fn(state)).toBe('value');
    });

    test('returns the correct function for a function selector', () => {
        const fn = resolver((state: any) => state.propName);
        const state = { propName: 'value' };
        expect(fn(state)).toBe('value');
    });

    test('returns the correct function for an array selector', () => {
        const fn = resolver([ 'one', 'two' ]);
        const state = { one: { two: 'value' } };
        fn(state);

        expect(get).toBeCalledWith(state, [ 'one', 'two' ]);
    });

    test('returns the state for undefined selector', () => {
        const fn = resolver();
        const state = { propName: 'value' };
        expect(fn(state)).toBe(state);
    });

    describe('Should return reducer according to select.', () => {
        let state: any;

        beforeEach(() => {
            state = {
                level1: {
                    level2: 'test'
                }
            };
        });

        describe('with property selector', () => {
            test('should return value from reducer', () => {
                const reducer = resolver('propName');
                const state = { propName: 'test' };

                expect.assertions(1);
                expect(reducer(state)).toStrictEqual('test');
            });

            test('should return undefined from reducer', () => {
                const reducer = resolver('propName');
                const state = {};

                expect.assertions(1);
                expect(reducer(state)).toStrictEqual(undefined);
            });
        });

        describe('with path selector', () => {
            test('should return value from reducer by path', () => {
                (get as jest.Mock).mockReturnValueOnce(13);

                const reducer = resolver([ 'level1', 'level2' ]);

                expect.assertions(1);
                expect(reducer(state)).toStrictEqual(13);
            });
        });

        describe('with function selector', () => {
            test('should call the function with state', () => {
                const mockFunction = jest.fn();
                const reducer = resolver(mockFunction);

                reducer(state);

                expect.assertions(1);
                expect(mockFunction).toBeCalledWith(state);
            });
        });

        describe('with nil selector', () => {
            test('should return same state object', () => {
                const reducer = resolver();

                expect.assertions(1);
                expect(reducer(state)).toBe(state);
            });
        });
    });
});
