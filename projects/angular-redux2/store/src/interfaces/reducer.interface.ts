/**
 * Import third-party types
 */

import { Action, AnyAction } from 'redux';

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
