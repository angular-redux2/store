/**
 * Import third-party types
 */

import type { Action, AnyAction, Dispatch, MiddlewareAPI } from 'redux';

/**
 * Middleware function signature for Redux
 *
 * @template S - The type of the store's state
 * @template A - The type of the action dispatched
 * @template D - The type of the store's `dispatch` function
 */
export interface EnhancersMiddleware<S = any, A extends Action = AnyAction, D extends Dispatch = Dispatch> {
    /**
     * A middleware function that receives the store's `dispatch` and `getState` functions
     * and returns a function that receives the `next` function and returns a function that
     * receives the action to dispatch
     *
     * @param {MiddlewareAPI<D, S>} api - An object containing the store's `dispatch` and `getState` functions
     * @returns {function(next: Dispatch<AnyAction>): (action: A) => any} - A function that receives the `next` function
     * and returns a function that receives the action to dispatch
     */
    (api: MiddlewareAPI<D, S>): (next: Dispatch<AnyAction>) => (action: A) => any;
}

/**
 * Represents the next middleware function in the middleware chain.
 *
 * @template A - The type of the action being dispatched.
 */

export interface NextMiddleware<A extends Action = AnyAction> {
    /**
     * Invokes the next middleware in the chain with an optional action.
     *
     * @template A - The type of the action being dispatched.
     * @param {any} state - The current state of the store.
     * @param action - The action to pass to the next middleware.
     * @returns {any} - The state returned by the next middleware in the chain.
     */
    (state: any, action?: A): any;
}

/**
 * Represents a Redux middleware function.
 * @template S - The type of the state managed by the store.
 * @template A - The type of the action being dispatched.
 */

export interface Middleware<S = any, A extends Action = AnyAction> {
    /**
     * A middleware function that receives the current state, the action being dispatched,
     * and the next middleware function in the chain.
     *
     * @param state - The current state of the store.
     * @param action - The action being dispatched.
     * @param next - The next middleware function in the chain.
     * @returns {any} - The state returned by the next middleware in the chain.
     */
    (state: S, action: A, next: NextMiddleware<A>): S;
}

/**
 * A type representing a revocable proxy object.
 *
 * @template T The type of the proxy object.
 * @property {T} proxy - The proxy object.
 * @property {Function} revoke - A function that revokes the proxy object.
 * @returns {Object} A revocable proxy object.
 */

export type RevocableProxy<T> = {
    proxy: T;
    revoke: () => void;
};
