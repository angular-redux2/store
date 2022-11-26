/**
 * Components
 */

import { get } from './object.component';
import { detectSelectorType, resolver } from './selectors.component';

/**
 * Mock get method of object component.
 */

jest.mock('./object.component');

/**
 * Get type of select.
 * (property | function | path | nil)
 */

describe('Should get type of selector.', () => {
    test('Should get a string property selector.', () =>
        expect(detectSelectorType('propName')).toBe('property'));

    test('Should get a number property selector.', () =>
        expect(detectSelectorType(3)).toBe('property'));

    test('Should get a symbol property selector.', () =>
        expect(detectSelectorType(Symbol('whatever'))).toBe('property'));

    test('Should get a function selector.', () =>
        expect(detectSelectorType((state: any) => state)).toBe('function'));

    test('Should get a path selector.', () =>
        expect(detectSelectorType([ 'one', 'two' ])).toBe('path'));

    test('Should get a nil selector (undefined).', () =>
        expect(detectSelectorType()).toBe('nil'));
});

/**
 * Get generate reducer according to select.
 * (property | function | path | nil)
 */

describe('Should return reducer according to select.', () => {
    test('Should get a string property from reducer.', () => {
        const reducer = resolver('propName');
        const state = {
            propName: 'test'
        }

        expect(reducer(state)).toStrictEqual('test');
    });

    test('Should get undefined from reducer.', () => {
        const reducer = resolver('propName');
        const state = {
        }

        expect(reducer(state)).toStrictEqual(undefined);
    });

    test('Should get a string property from reducer by path.', () => {
        (get as jest.Mock).mockReturnValueOnce(13);

        const reducer = resolver(['level1', 'level2']);
        const state = {
            level1: {
                level2: 'test'
            }
        }

        expect(reducer(state)).toStrictEqual(13);
    });

    test('Should get a string property from reducer by function.', () => {
        const mockFunction = jest.fn();
        const reducer = resolver(mockFunction);
        const state = {
            level1: {
                level2: 'test'
            }
        }

        reducer(state)
        expect(mockFunction).toBeCalled();
    });

    test('Should get same state by nil selector.', () => {
        const reducer = resolver();
        const state = {
            level1: {
                level2: 'test'
            }
        }

        expect(reducer(state)).toStrictEqual(state);
    });
});
