/**
 * Import components
 */

import { get } from './object.component';

/**
 * Interfaces
 */

import { FunctionSelector, PathSelector, PropertySelector, Selector } from '../interfaces/store.interface';

/**
 * Get selector type of `ngRedux.select`.
 * `(property | function | path | nil)`
 *
 * ```typescript
 * getSelectorType('propName') // property
 * getSelectorType(state => state) // function
 * getSelectorType([ 'one', 'two' ]) // path
 * getSelectorType() // nil
 * ```
 */

export function getSelectorType<RootState, S>(selector?: Selector<RootState, S>): string {
    switch (true) {
        case (!selector):
            return 'nil';

        case (Array.isArray(selector)):
            return 'path';

        case ('function' === typeof selector):
            return 'function';

        default:
            return 'property';
    }
}

/**
 * Resolver map property by selector type.
 *
 * ```typescript
 * resolver([ 'one', 'two' ])
 * ```
 *
 * @param selector - selector type.
 */

export function resolver<RootState, State>(selector?: Selector<RootState, State>): any {
    const type = getSelectorType(selector);

    switch (type) {
        case 'property':
            return (state: any) => state ? state[selector as PropertySelector] : undefined;

        case 'path':
            return (state: RootState) => get(state, selector as PathSelector);

        case 'function':
            return selector as FunctionSelector<RootState, State>;

        case 'nil':
            return (state: RootState) => state;
    }

    return undefined;
}
