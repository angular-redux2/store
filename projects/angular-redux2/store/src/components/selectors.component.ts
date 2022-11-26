/**
 * Components
 */

import { get } from './object.component';

/**
 * Interfaces
 */

import { FunctionSelector, PathSelector, PropertySelector, Selector } from '../interfaces/store.interface';

/**
 * Detect selector type.
 * `(property | function | path | nil)`
 *
 * @example
 * ```typescript
 * getSelectorType('propName') // property
 * getSelectorType(state => state) // function
 * getSelectorType([ 'one', 'two' ]) // path
 * getSelectorType() // nil
 * ```
 *
 * @param selector - the "Selector" for direction the primitive type.
 * @return string
 */

export function detectSelectorType<RootState, S>(selector?: Selector<RootState, S>): string {
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
 * @example
 * ```typescript
 * resolver([ 'one', 'two' ])
 * ```
 *
 * @param selector - resolve "Selector"
 * @return any
 */

export function resolver<RootState, State>(selector?: Selector<RootState, State>): any {
    const type = detectSelectorType(selector);

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
}
