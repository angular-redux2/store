/**
 * Imports
 */

import { get } from '@components/object.component';
import { resolver } from '@components/selectors.component';

describe('resolver', () => {
    afterEach(() => xJet.restoreAllMocks());

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
        xJet.mock(get);
        const fn = resolver([ 'one', 'two' ]);
        const state = { one: { two: 'value' } };
        fn(state);

        expect(get).toHaveBeenCalledWith(state, [ 'one', 'two' ]);
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

                expect(reducer(state)).toEqual('test');
            });

            test('should return undefined from reducer', () => {
                const reducer = resolver('propName');
                const state = {};

                expect(reducer(state)).toEqual(undefined);
            });
        });

        describe('with path selector', () => {
            test('should return value from reducer by path', () => {
                xJet.mock(get).mockReturnValueOnce(<any> 13);

                const reducer = resolver([ 'level1', 'level2' ]);

                expect(reducer(state)).toEqual(13);
            });
        });

        describe('with function selector', () => {
            test('should call the function with state', () => {
                const mockFunction = xJet.fn();
                const reducer = resolver(mockFunction);

                reducer(state);

                expect(mockFunction).toHaveBeenCalledWith(state);
            });
        });

        describe('with nil selector', () => {
            test('should return same state object', () => {
                const reducer = resolver();

                expect(reducer(state)).toBe(state);
            });
        });
    });
});
