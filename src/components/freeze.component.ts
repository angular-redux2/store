/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Reducer, UnknownAction } from 'redux';

/**
 * Imports
 */

import { isPlain } from './object.component';

/**
 * Freezes a state tree in place and returns it.
 *
 * @typeParam Value - The type of the state
 * @param value - The state to freeze
 * @returns The same value, frozen
 *
 * @remarks
 * It freezes every plain object and array that it reaches and leaves every other value alone,
 * so a `Date`, `Map`, `Set`, or class instance keeps its methods and fields working.
 * The walk stops at an object that is already frozen, because this function froze it together with its subtree,
 * so after the first action it only visits the objects that a reducer created.
 * An object that something else froze without its children therefore keeps those children unfrozen.
 *
 * @example
 * ```ts
 * const state = deepFreeze({ user: { name: 'Ada' }, joined: new Date() });
 *
 * Object.isFrozen(state);        // true
 * Object.isFrozen(state.user);   // true
 * Object.isFrozen(state.joined); // false - a Date stays usable
 * ```
 *
 * @since 6.0.0
 */

export function deepFreeze<Value>(value: Value): Value {
    if (!isPlain(value) || Object.isFrozen(value)) return value;

    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);

    return value;
}

/**
 * Wraps a reducer so every state that it returns is frozen.
 *
 * @typeParam State - The type of the state that the reducer owns
 * @typeParam Action - The type of the actions that the reducer handles
 * @param reducer - The reducer to wrap
 * @returns A reducer that returns the same states, frozen
 *
 * @remarks
 * Code that mutates the state then throws a `TypeError` at the assignment,
 * instead of changing earlier states and leaving selections stale.
 * This covers a plain reducer that mutates its state and a component that changes an object it selected.
 * A reducer wrapped in {@link draft} keeps working, because its assignments land on copies.
 * Freezing walks the new parts of the state after every action, so enable it in development only.
 * It works on any reducer, including one branch inside `combineReducers` and a store made without Angular.
 *
 * @example
 * ```ts
 * const store = createStore(freezeReducer(rootReducer));
 *
 * store.getState().user.name = 'Bob'; // TypeError: Cannot assign to read only property 'name'
 * store.dispatch(rename('Bob'));       // fine when the reducer returns a new state or uses a draft
 * ```
 *
 * @since 6.0.0
 */

export function freezeReducer<State, Action extends UnknownAction = UnknownAction>(
    reducer: Reducer<State, Action>
): Reducer<State, Action> {
    return (state, action) => deepFreeze(reducer(state, action));
}
