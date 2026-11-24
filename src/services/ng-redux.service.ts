/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Signal } from '@angular/core';
import type { NgReduxConfigInterface } from '@interfaces/provider.interface';
import type { BasePathType, SubStoreInterface } from '@interfaces/store.interface';
import type { DevToolsGlobalInterface } from '@services/interfaces/ng-redux-service.interface';
import type { SubstoreRouteInterface } from '@services/interfaces/sub-store-service.interface';
import type { Action, Reducer, Store, StoreEnhancer, Unsubscribe, UnknownAction } from 'redux';

/**
 * Imports
 */

import { signal } from '@angular/core';
import { SubStore } from '@services/sub-store.service';
import { AbstractStore } from '@abstract/store.abstract';
import { freezeReducer } from '@components/freeze.component';
import { SUBSTORE_ROUTE } from '@constants/sub-store.constant';
import { get, isPlain, set } from '@components/object.component';
import { applyMiddleware, compose, legacy_createStore as createStore } from 'redux';

/**
 * Composes the middleware, the enhancers, and the Redux DevTools extension into one enhancer.
 *
 * @param config - The options that create the store
 * @returns The composed enhancer, or `undefined` when there is nothing to apply
 *
 * @remarks
 * The middleware comes first and the extension last, so the extension records the actions that a middleware dispatches.
 * The extension joins only when `devTools` is set and the browser has it installed.
 *
 * @example
 * ```ts
 * enhancerOf({ reducer, middleware: [ thunk ], devTools: true }); // applyMiddleware(thunk) composed with the extension
 * enhancerOf({ reducer });                                        // undefined
 * ```
 *
 * @since 6.0.0
 */

function enhancerOf(
    { middleware = [], enhancers = [], devTools }: Pick<NgReduxConfigInterface<unknown>, 'middleware' | 'enhancers' | 'devTools'>
): StoreEnhancer | undefined {
    const extension = devTools ? (<DevToolsGlobalInterface> globalThis).__REDUX_DEVTOOLS_EXTENSION__ : undefined;
    const all = [
        ...middleware.length ? [ applyMiddleware(...middleware) ] : [],
        ...enhancers,
        ...extension ? [ extension(devTools === true ? undefined : <Record<string, unknown>> devTools) ] : []
    ];

    return all.length ? <StoreEnhancer> compose(...all) : undefined;
}

/**
 * The root store: a Redux store whose state is an Angular signal.
 *
 * @typeParam State - The type of the root state
 *
 * @remarks
 * It builds the Redux store in its constructor, so it is ready before anything reads it,
 * and `provideNgRedux` creates the one instance for the application.
 * After every dispatch it copies the Redux state into {@link NgRedux.state},
 * and every selection is a `computed` over that signal.
 * The root reducer also routes substore actions to their reducers and runs the feature reducers added later.
 *
 * @example
 * ```ts
 * const ngRedux = new NgRedux({ reducer: rootReducer, initialState: { counter: 0 } });
 * const count = ngRedux.select(state => state.counter);
 *
 * ngRedux.dispatch({ type: 'INCREMENT' });
 * count(); // 1
 * ```
 *
 * @since 6.0.0
 */

export class NgRedux<State = unknown> extends AbstractStore<State> {
    /**
     * The underlying Redux store.
     *
     * @remarks
     * Use it for libraries that expect a plain Redux store, such as `from(ngRedux.redux)` in RxJS.
     * Do not replace its reducer, because the root reducer also runs substores and features.
     *
     * @example
     * ```ts
     * ngRedux.redux.getState(); // { counter: 0 }
     * ```
     *
     * @since 6.0.0
     */

    readonly redux: Store<State>;

    /**
     * The whole root state as a read-only signal.
     *
     * @example
     * ```ts
     * ngRedux.state(); // { counter: 0 }
     * ```
     *
     * @since 6.0.0
     */

    readonly state: Signal<State>;

    /**
     * The root reducer from the options.
     *
     * @since 6.0.0
     */

    private readonly reducer: Reducer<State>;

    /**
     * The reducer handed to Redux: the root reducer, frozen when `freeze` is on.
     *
     * @since 6.0.0
     */

    private readonly storeReducer: Reducer<State>;

    /**
     * The substore reducers by id.
     *
     * @since 6.0.0
     */

    private readonly substoreReducers = new Map<number, Reducer>();

    /**
     * The id of each substore reducer and the number of substores that use it.
     *
     * @since 6.0.0
     */

    private readonly substoreIds = new Map<Reducer, { id: number; count: number }>();

    /**
     * The id that the next new substore reducer gets.
     *
     * @since 6.0.0
     */

    private nextSubstoreId = 0;

    /**
     * The initial state from the options, kept so a feature added later starts from its preloaded key.
     *
     * @remarks
     * `combineReducers` drops the keys it does not know when the store starts,
     * so a key preloaded through `transferState` would be gone before the lazy route adds its reducer.
     *
     * @since 6.0.0
     */

    private readonly preloaded?: Record<string, unknown>;

    /**
     * The feature reducers, by the state key that each one owns.
     *
     * @since 6.0.0
     */

    private readonly features = new Map<string, Reducer>();

    /**
     * Creates the Redux store and the state signal.
     *
     * @param config - The options that create the store
     *
     * @remarks
     * The state signal subscribes to the Redux store before anything else,
     * so it already holds the new state when any other listener runs.
     *
     * @since 6.0.0
     */

    constructor(config: NgReduxConfigInterface<State>) {
        super();

        const reduce: Reducer<State> = (state, action) => this.reduce(state, action);
        this.reducer = config.reducer;
        this.preloaded = isPlain(config.initialState) ? config.initialState : undefined;
        this.storeReducer = config.freeze ? freezeReducer(reduce) : reduce;
        this.redux = createStore(this.storeReducer, config.initialState, enhancerOf(config));

        const state = signal(this.redux.getState());
        this.redux.subscribe(() => state.set(this.redux.getState()));
        this.state = state.asReadonly();
    }

    /**
     * Dispatches an action to the Redux store.
     *
     * @typeParam DispatchedAction - The type of the action
     * @param action - The action to dispatch
     * @returns What the Redux store returns, which is the action unless a middleware changes it
     *
     * @remarks
     * The state signal already holds the new state when it returns.
     *
     * @example
     * ```ts
     * ngRedux.dispatch({ type: 'INCREMENT' }); // { type: 'INCREMENT' }
     * ngRedux.getState().counter;              // 1
     * ```
     *
     * @since 6.0.0
     */

    dispatch<DispatchedAction extends Action>(action: DispatchedAction): DispatchedAction {
        return <DispatchedAction> this.redux.dispatch(<UnknownAction> <unknown> action);
    }

    /**
     * Creates a store that works on one branch of the root state.
     *
     * @typeParam SubState - The state of the branch
     * @param basePath - The path of the branch, fixed or computed
     * @param reducer - The reducer that handles the actions dispatched through the substore
     * @returns A store for the branch at the base path
     *
     * @remarks
     * Substores that share a reducer, such as one per list item, share its id and register it once.
     * {@link SubStoreInterface.destroy} releases the substore,
     * and the store forgets the reducer once no substore uses it,
     * so substores made with inline reducers do not pile up.
     *
     * @example
     * ```ts
     * const bob = ngRedux.substore([ 'users', 'bob' ], userReducer);
     *
     * bob.getState(); // { name: 'Bob Smith', loc: 1023 }
     * bob.destroy();
     * ```
     *
     * @since 6.0.0
     */

    substore<SubState>(basePath: BasePathType, reducer: Reducer<SubState>): SubStoreInterface<SubState> {
        const entry = this.substoreIds.get(reducer) ?? { id: this.nextSubstoreId++, count: 0 };
        entry.count++;
        this.substoreIds.set(reducer, entry);
        this.substoreReducers.set(entry.id, reducer);

        return new SubStore<SubState>(this, basePath, entry.id, () => this.release(reducer));
    }

    /**
     * Adds a reducer that owns one key of the root state, such as the state of a lazy route.
     *
     * @param key - The state key that the reducer owns
     * @param reducer - The reducer of that key
     *
     * @remarks
     * The store swaps in its reducer again, so Redux dispatches its replace action
     * and the feature state starts from the defaults of its reducer at once.
     * Adding the same reducer for the same key again does nothing.
     *
     * @example
     * ```ts
     * ngRedux.addReducer('todos', todos.reducer);
     * ngRedux.getState().todos; // []
     * ```
     *
     * @since 6.0.0
     */

    addReducer(key: string, reducer: Reducer): void {
        if (this.features.get(key) === reducer) return;

        this.features.set(key, reducer);
        this.redux.replaceReducer(this.storeReducer);
    }

    /**
     * Registers a listener that runs after every dispatch.
     *
     * @param listener - The function to run
     * @returns A function that removes the listener
     *
     * @since 6.0.0
     */

    protected listen(listener: () => void): Unsubscribe {
        return this.redux.subscribe(listener);
    }

    /**
     * Releases one use of a substore reducer, and forgets the reducer when no substore uses it anymore.
     *
     * @param reducer - The substore reducer
     *
     * @since 6.0.0
     */

    private release(reducer: Reducer): void {
        const entry = this.substoreIds.get(reducer);
        if (!entry || --entry.count > 0) return;

        this.substoreIds.delete(reducer);
        this.substoreReducers.delete(entry.id);
    }

    /**
     * Reduces one action: a substore action on its branch, and every other action with the root and feature reducers.
     *
     * @param state - The current root state
     * @param action - The action to reduce
     * @returns The next root state
     *
     * @remarks
     * A substore action reaches only its substore reducer, and only the objects along its path are copied.
     * A substore action with an unknown id, such as one that the Redux DevTools extension imported,
     * goes to the root reducer instead.
     *
     * @since 6.0.0
     */

    private reduce(state: State | undefined, action: UnknownAction): State {
        const route = <SubstoreRouteInterface | undefined> action[SUBSTORE_ROUTE];
        const reducer = route ? this.substoreReducers.get(route.id) : undefined;

        if (route && reducer) {
            const branch = get(state, route.path);
            const next = reducer(branch, action);

            return next === branch ? <State> state : set(<State> state, route.path, next);
        }

        return this.features.size ? this.reduceFeatures(state, action) : this.reducer(state, action);
    }

    /**
     * Runs the root reducer on the state without the feature keys, then each feature reducer on its own key.
     *
     * @param state - The current root state
     * @param action - The action to reduce
     * @returns The next root state, or the same state when no reducer changed anything
     *
     * @remarks
     * The root reducer never sees the feature keys,
     * so `combineReducers` neither drops them nor warns about keys that it does not know.
     *
     * Each feature reducer starts from, in order:
     * - the value that the root reducer put on its key, such as a state that `MockNgRedux.setState` sets
     * - the current value of its key
     * - the value of its key in the initial state, the first time it runs
     *
     * @since 6.0.0
     */

    private reduceFeatures(state: State | undefined, action: UnknownAction): State {
        const record = <Record<string, unknown> | undefined> state;
        const rootState = record && Object.fromEntries(Object.entries(record).filter(([ key ]) => !this.features.has(key)));
        const nextRoot = <Record<string, unknown> | undefined> this.reducer(<State> rootState, action);
        const next: Record<string, unknown> = { ...nextRoot };
        let changed = nextRoot !== rootState;

        for (const [ key, reducer ] of this.features) {
            const previous = this.previousOf(key, nextRoot, record);
            next[key] = reducer(previous, action);
            changed ||= next[key] !== record?.[key];
        }

        return changed ? <State> next : <State> state;
    }

    /**
     * Picks the state that a feature reducer starts from.
     *
     * @param key - The feature key
     * @param nextRoot - What the root reducer returned
     * @param record - The current root state
     * @returns The previous state of the feature
     *
     * @see NgRedux.reduceFeatures
     *
     * @since 6.0.0
     */

    private previousOf(key: string, nextRoot?: Record<string, unknown>, record?: Record<string, unknown>): unknown {
        if (nextRoot && Object.hasOwn(nextRoot, key)) return nextRoot[key];
        if (record && Object.hasOwn(record, key)) return record[key];

        return this.preloaded?.[key];
    }
}
