/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Action, UnknownAction } from 'redux';

/**
 * The callback that a {@link MiddlewareInterface} calls to hand the state on to the rest of the chain.
 *
 * @typeParam A - The type of the action that travels through the chain
 * @typeParam S - The type of the state handed along the chain
 *
 * @remarks
 * Calling it runs the next middleware with the given state and returns whatever the rest of the chain returns.
 * When the chain is exhausted, it returns the state that it received.
 * Omitting `action` passes on the action that the chain started with.
 *
 * @example
 * ```ts
 * const logger: MiddlewareInterface = (state, action, next) => {
 *     const nextState = next(state, action);
 *     console.log(action.type, nextState);
 *
 *     return nextState;
 * };
 * ```
 *
 * @see MiddlewareInterface
 *
 * @since 6.0.0
 */

export interface NextMiddlewareInterface<A extends Action = UnknownAction, S = unknown> {
    /**
     * Runs the rest of the middleware chain.
     *
     * @param state - The state to hand to the next middleware
     * @param action - The action to hand on, or the original action when omitted
     * @returns The state that the rest of the chain produced
     *
     * @remarks
     * The last links of the chain are the substore router and the root reducer,
     * so calling `next` is what eventually reduces the action.
     *
     * @example
     * ```ts
     * next(state);                          // the original action
     * next(state, { type: 'REPLACED' });    // a substituted action
     * ```
     *
     * @since 5.0.0
     */

    (state: S, action?: A): S;
}

/**
 * A reducer-level middleware that wraps every call to the root reducer.
 *
 * @typeParam S - The type of the state that the middleware receives and returns
 * @typeParam A - The type of the action being reduced
 *
 * @remarks
 * This is not a Redux store middleware with the `store => next => action` shape.
 * It runs inside the reducer that {@link NgRedux.configureStore} composes,
 * receives the current state and the action, and returns the next state.
 * Middlewares run in the order that they were passed, ahead of the substore router and the root reducer.
 * A middleware that returns without calling `next` skips the reducers for that action.
 *
 * @example
 * ```ts
 * const freezeGuard: MiddlewareInterface = (state, action, next) => Object.freeze(next(state, action));
 *
 * ngRedux.configureStore(rootReducer, INITIAL_STATE, [ freezeGuard ]);
 * ```
 *
 * @see NextMiddlewareInterface
 * @see ReducerService.composeReducers
 *
 * @since 6.0.0
 */

export interface MiddlewareInterface<S = unknown, A extends Action = UnknownAction> {
    /**
     * Reduces one action, usually by delegating to `next`.
     *
     * @param state - The current state of the store
     * @param action - The action being reduced
     * @param next - The rest of the middleware chain
     * @returns The next state of the store
     *
     * @remarks
     * The returned value becomes the new state, so a middleware may inspect, replace, or wrap
     * the state that `next` produced.
     *
     * @example
     * ```ts
     * const passThrough: MiddlewareInterface = (state, action, next) => next(state, action);
     * ```
     *
     * @since 5.0.0
     */

    (state: S, action: A, next: NextMiddlewareInterface<A, S>): S;
}
