/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { SelectorType } from '../interfaces/store.interface';

/**
 * Imports
 */

import { get } from './object.component';

/**
 * Turns any selector into a function from the state to the selected value.
 *
 * @typeParam RootState - The type of the state being selected from
 * @typeParam State - The type of the selected value
 * @param selector - The selector to resolve
 * @returns A function that takes the state and returns the selected value
 *
 * @remarks
 * A property selector reads one key and returns `undefined` for a falsy state.
 * A path selector walks the state with {@link get}.
 * A function selector is returned as it is, and a missing selector returns the whole state.
 *
 * @example
 * ```ts
 * const state = { one: { two: 2 } };
 *
 * resolver([ 'one', 'two' ])(state); // 2
 * resolver('one')(state);            // { two: 2 }
 * resolver()(state);                 // { one: { two: 2 } }
 * ```
 *
 * @see SelectorType
 *
 * @since 5.0.0
 */

export function resolver<RootState, State>(selector?: SelectorType<RootState, State>): (state: RootState) => State {
    if (!selector) {
        return (state: RootState): State => <State> <unknown> state;
    }

    if (typeof selector === 'function') {
        return selector;
    }

    if (Array.isArray(selector)) {
        return (state: RootState): State => <State> get(state, selector);
    }

    return (state: RootState): State => <State> (state ? (<Record<PropertyKey, unknown>> state)[selector] : undefined);
}
