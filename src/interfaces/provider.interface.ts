/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Reducer, StoreEnhancer } from 'redux';
import type { MiddlewareInterface } from './reducer.interface';

/**
 * The store setup that {@link provideNgRedux} applies when the application starts.
 *
 * @typeParam State - The type of the root state
 *
 * @remarks
 * The fields map onto the arguments of {@link NgRedux.configureStore}, with `devTools` added so the Redux DevTools
 * enhancer no longer has to be wired by hand.
 *
 * @example
 * ```ts
 * const config: NgReduxConfigInterface<AppState> = {
 *     reducer: rootReducer,
 *     initialState: INITIAL_STATE,
 *     devTools: isDevMode()
 * };
 * ```
 *
 * @see provideNgRedux
 *
 * @since 6.0.0
 */

export interface NgReduxConfigInterface<State> {
    /**
     * The root reducer.
     *
     * @remarks
     * It may mutate its state; see the draft state of {@link ReducerService}.
     *
     * @since 6.0.0
     */

    reducer: Reducer<State>;

    /**
     * The state the store starts from.
     *
     * @since 6.0.0
     */

    initialState: State;

    /**
     * Reducer middleware, run in order before the root reducer.
     *
     * @see MiddlewareInterface
     *
     * @since 6.0.0
     */

    middleware?: Array<MiddlewareInterface<State>>;

    /**
     * Redux store enhancers, such as `applyMiddleware(...)`.
     *
     * @since 6.0.0
     */

    enhancers?: Array<StoreEnhancer>;

    /**
     * Connects the store to the Redux DevTools extension.
     *
     * @remarks
     * `true` connects it with the default options, and an object is passed to the extension as its options.
     * Nothing is connected when the extension is not installed, or when the value is `false` or missing.
     * Pass `isDevMode()`, or options guarded by it, to keep the extension out of production.
     *
     * @see DevToolsExtension.enhancer
     *
     * @since 6.0.0
     */

    devTools?: boolean | Record<string, unknown>;

    /**
     * Freezes the state, so code that mutates it outside a reducer throws at the write.
     *
     * @remarks
     * `true` adds the {@link freezeState} enhancer before the configured `enhancers`.
     * Freezing walks the new parts of the state after every action, so pass `isDevMode()` to keep it out of production.
     *
     * @example
     * ```ts
     * provideNgRedux({ reducer: rootReducer, initialState: INITIAL_STATE, freeze: isDevMode() });
     * ```
     *
     * @since 6.0.0
     */

    freeze?: boolean;
}
