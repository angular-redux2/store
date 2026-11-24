/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Middleware, Reducer, StoreEnhancer } from 'redux';

/**
 * The options that create the store.
 *
 * @typeParam State - The type of the root state
 *
 * @remarks
 * `provideNgRedux` passes these options to {@link NgRedux}, which builds the Redux store once,
 * so the store is ready before any component reads it.
 * The store applies the middleware first, then the enhancers, and the Redux DevTools extension last.
 *
 * @example
 * ```ts
 * provideNgRedux({
 *     reducer: rootReducer,
 *     initialState: INITIAL_STATE,
 *     middleware: [ thunk ],
 *     devTools: isDevMode(),
 *     freeze: isDevMode()
 * });
 * ```
 *
 * @since 6.0.0
 */

export interface NgReduxConfigInterface<State> {
    /**
     * The root reducer.
     *
     * @example
     * ```ts
     * reducer: combineReducers({ counter, todos: todos.reducer })
     * ```
     *
     * @since 6.0.0
     */

    reducer: Reducer<State>;

    /**
     * The state that the store starts from.
     *
     * @remarks
     * Leave it out when the reducers define their own defaults.
     *
     * @example
     * ```ts
     * initialState: { counter: 0, todos: [] }
     * ```
     *
     * @since 6.0.0
     */

    initialState?: State;

    /**
     * The Redux middleware, applied in order.
     *
     * @remarks
     * The store applies them before the enhancers and the Redux DevTools extension,
     * so the extension records the actions that a middleware dispatches.
     *
     * @example
     * ```ts
     * middleware: [ thunk, logger ]
     * ```
     *
     * @since 6.0.0
     */

    middleware?: Array<Middleware>;

    /**
     * The Redux store enhancers, applied after the middleware.
     *
     * @example
     * ```ts
     * enhancers: [ persistState() ]
     * ```
     *
     * @since 6.0.0
     */

    enhancers?: Array<StoreEnhancer>;

    /**
     * Whether to connect the Redux DevTools extension, or the options to connect it with.
     *
     * @remarks
     * The store connects only when the extension is installed in the browser,
     * so it is safe to leave on during server-side rendering.
     *
     * @example
     * ```ts
     * devTools: isDevMode() && { name: 'my app', trace: true }
     * ```
     *
     * @since 6.0.0
     */

    devTools?: boolean | Record<string, unknown>;

    /**
     * Whether to deep-freeze every state, so code that mutates it throws.
     *
     * @remarks
     * Freezing walks the new parts of the state after every action, so enable it in development only.
     *
     * @example
     * ```ts
     * freeze: isDevMode()
     * ```
     *
     * @see freezeReducer
     *
     * @since 6.0.0
     */

    freeze?: boolean;

    /**
     * Whether to hand the state from server-side rendering to the browser through Angular's `TransferState`.
     *
     * @remarks
     * The server serializes the state, and the browser starts from it instead of `initialState`.
     *
     * @example
     * ```ts
     * transferState: true
     * ```
     *
     * @since 6.0.0
     */

    transferState?: boolean;
}
