/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Reducer, Store, StoreEnhancer } from 'redux';

/**
 * Whether a value is a plain object or an array, the only values that {@link deepFreeze} freezes.
 *
 * @param value - The value to check
 * @returns `true` for an array or an object whose prototype is `Object.prototype` or `null`
 *
 * @remarks
 * It draws the same line as the draft state of the reducers,
 * so a `Date`, `Map`, `Set`, or class instance stays usable as it is.
 *
 * @since 6.0.0
 */

function isPlain(value: unknown): value is Record<PropertyKey, unknown> {
    if (Array.isArray(value)) {
        return true;
    }

    if (value === null || typeof value !== 'object') {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);

    return prototype === Object.prototype || prototype === null;
}

/**
 * Freezes a state tree in place and returns it.
 *
 * @typeParam T - The type of the state
 * @param value - The state to freeze
 * @returns The same value, frozen
 *
 * @remarks
 * It freezes every plain object and array it reaches and leaves every other value alone.
 * The walk stops at an object that is already frozen, since the enhancer froze it with its whole subtree,
 * so after the first action only the objects that a reducer created are visited.
 *
 * @since 6.0.0
 */

function deepFreeze<T>(value: T): T {
    if (!isPlain(value) || Object.isFrozen(value)) {
        return value;
    }

    Object.freeze(value);
    for (const key of Reflect.ownKeys(value)) {
        deepFreeze(value[key]);
    }

    return value;
}

/**
 * Creates a store enhancer that freezes the state, so code that mutates it outside a reducer throws at once.
 *
 * @returns The enhancer to add to the store
 *
 * @remarks
 * The enhancer freezes the initial state and every state that the root reducer returns,
 * including after `replaceReducer`.
 * Code that writes to the state, such as a component that changes an object it selected,
 * then throws a `TypeError` at the write rather than changing the store behind its back and leaving selections stale.
 * Reducers keep working, since they receive a draft and their writes land on copies.
 *
 * Only plain objects and arrays are frozen, and the initial state object itself is frozen in place.
 * Freezing walks the new parts of the state after every action, so enable it in development only,
 * through `freeze: isDevMode()` on {@link provideNgRedux} or by passing it to {@link NgRedux.configureStore}.
 *
 * @example
 * ```ts
 * ngRedux.configureStore(rootReducer, INITIAL_STATE, [], isDevMode() ? [ freezeState() ] : []);
 *
 * ngRedux.getState().user.name = 'Bob'; // TypeError: Cannot assign to read only property 'name'
 * ngRedux.dispatch(rename('Bob'));       // fine: the reducer writes to its draft
 * ```
 *
 * @see NgReduxConfigInterface.freeze
 *
 * @since 6.0.0
 */

export function freezeState(): StoreEnhancer {
    const freezing = (reducer: Reducer): Reducer => (state, action) => deepFreeze(reducer(state, action));
    const enhancer = (createStore: (reducer: Reducer, preloadedState?: unknown) => Store) =>
        (reducer: Reducer, preloadedState?: unknown): Store => {
            const store = createStore(freezing(reducer), deepFreeze(preloadedState));

            return { ...store, replaceReducer: (next: Reducer): void => store.replaceReducer(freezing(next)) };
        };

    return <StoreEnhancer> <unknown> enhancer;
}
