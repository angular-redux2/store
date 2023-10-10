/**
 * angular-redux2
 */

import { get } from './object.component';

/**
 * angular-redux2 types
 */

import { FunctionSelector, PathSelector, PropertySelector, Selector } from '../interfaces/store.interface';

/**
 * Determines the type of selector.
 *
 * @example
 * ```typescript
 * getSelectorType('propName') // property
 * getSelectorType(state => state) // function
 * getSelectorType([ 'one', 'two' ]) // path
 * getSelectorType() // nil
 * ```
 *
 * @template RootState - The type of the root state object.
 * @template S - The type of the selected subset of the RootState object.
 * @param {Selector} selector - The selector to detect the type of.
 * @returns {('property'|'path'|'function'|'nil')} The type of the selector
 */

export function getSelectorType<RootState, S>(selector?: Selector<RootState, S>): string {
    if (!selector) {
        return 'nil';
    }
    if (Array.isArray(selector)) {
        return 'path';
    }
    if (typeof selector === 'function') {
        return 'function';
    }

    return 'property';
}

/**
 * Resolves a selector and returns a function to extract the selected data from a state object.
 *
 * @example
 * ```typescript
 * resolver([ 'one', 'two' ])
 * ```
 *
 * @template RootState - The type of the root state object.
 * @template State - The type of the selected subset of the RootState object.
 * @param {Selector} selector - The selector to resolve.
 * @returns {Function} A function that takes a state object and returns the selected data.
 */

export function resolver<RootState, State>(selector?: Selector<RootState, State>): any {
    const type = getSelectorType(selector);

    switch (type) {
        case 'property':
            return (state: any): any => state ? state[selector as PropertySelector] : undefined;

        case 'path':
            return (state: RootState): any => get(state, selector as PathSelector);

        case 'function':
            return selector as FunctionSelector<RootState, State>;

        case 'nil':
            return (state: RootState): any => state;
    }
}
