/**
 * Import components
 */

import { getSelectorType } from './selectors.component';

/**
 * Get selector type of select
 * (property | function | path | nil)
 */

describe('Get selector type of select', () => {
    test('sniffs a string property selector', () =>
        expect(getSelectorType('propName')).toBe('property'));

    test('sniffs a number property selector', () =>
        expect(getSelectorType(3)).toBe('property'));

    test('sniffs a symbol property selector', () =>
        expect(getSelectorType(Symbol('whatever'))).toBe('property'));

    test('sniffs a function selector', () =>
        expect(getSelectorType((state: any) => state)).toBe('function'));

    test('sniffs a path selector', () =>
        expect(getSelectorType([ 'one', 'two' ])).toBe('path'));

    test('sniffs a nil selector (undefined)', () =>
        expect(getSelectorType()).toBe('nil'));
});
