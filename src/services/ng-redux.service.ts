/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Observable } from 'rxjs';
import type { Signal, WritableSignal } from '@angular/core';
import type { MiddlewareInterface } from '../interfaces/reducer.interface';
import type { UnknownAction, Reducer, Store, StoreEnhancer, Unsubscribe } from 'redux';
import type { ComparatorType, PathSelectorType, SelectorType } from '../interfaces/store.interface';

/**
 * Imports
 */

import { compose, createStore } from 'redux';
import { ReducerService } from './reducer.service';
import { SubStoreService } from './sub-store.service';
import { AbstractStore } from '../abstract/store.abstract';
import { resolver } from '../components/selectors.component';
import { distinctUntilChanged, map, ReplaySubject } from 'rxjs';
import { computed, Injectable, NgZone, signal } from '@angular/core';

/**
 * The type of the action that {@link NgRedux.addReducer} dispatches, so a new feature reducer sets its initial state.
 *
 * @since 6.0.0
 */

export const ADD_REDUCER = '@@angular-redux2/store/ADD_REDUCER';

/**
 * The root store service that wraps a Redux store for an Angular application.
 *
 * @typeParam RootState - The type of the root state
 *
 * @remarks
 * Inject it, then call {@link NgRedux.configureStore} once to create the Redux store,
 * or {@link NgRedux.provideStore} to adopt one that already exists.
 * After that, it selects with observables or signals, dispatches inside the Angular zone,
 * and carves substores out of the state with {@link NgRedux.configureSubStore}.
 *
 * Every constructed instance registers itself as {@link NgRedux.store},
 * which is how the `Select`, `Select$`, and `Dispatch` decorators reach the store outside dependency injection.
 * The service is provided in the root injector, so an application normally has exactly one.
 *
 * @example
 * ```ts
 * class AppModule {
 *     constructor(ngRedux: NgRedux<AppState>) {
 *         ngRedux.configureStore(rootReducer, { count: 0 });
 *     }
 * }
 *
 * ngRedux.dispatch({ type: 'INCREMENT' });
 * ngRedux.select('count'); // emits 1
 * ```
 *
 * @see AbstractStore
 * @see SubStoreService
 *
 * @since 5.0.0
 */

@Injectable({
    providedIn: 'root'
})
export class NgRedux<RootState = unknown> extends AbstractStore<RootState> {
    /**
     * The most recently constructed instance, which {@link NgRedux.store} returns.
     *
     * @remarks
     * The constructor overwrites it, so a second instance replaces the first one for the decorators.
     *
     * @hidden
     * @since 5.0.0
     */

    protected static instance: NgRedux<unknown>;

    /**
     * The subject that replays the latest state to every selection.
     *
     * @remarks
     * {@link NgRedux.setStore} pushes each new state into it, and {@link NgRedux.select} builds every selection on it.
     * It replays only the last value, so a late subscriber receives the current state at once.
     * Nothing emits until a store is set.
     *
     * @since 5.0.0
     */

    protected readonly state$: ReplaySubject<RootState> = new ReplaySubject<RootState>(1);

    /**
     * The signal that holds the latest state for every signal selection.
     *
     * @remarks
     * {@link NgRedux.setStore} writes each new state into it, and {@link NgRedux.selectSignal} computes from it.
     * It holds `undefined` until a store is set.
     *
     * @since 6.0.0
     */

    protected readonly state: WritableSignal<RootState | undefined> = signal(undefined);

    /**
     * The Redux store that this service wraps.
     *
     * @remarks
     * It stays unset until {@link NgRedux.configureStore} or {@link NgRedux.provideStore} runs,
     * and both methods refuse to replace it once it is set; {@link NgRedux.replaceStore} swaps it on purpose.
     *
     * @since 5.0.0
     */

    private reduxStore: Store<RootState, UnknownAction>;

    /**
     * Removes the listener that feeds the state of the current store into the selections.
     *
     * @remarks
     * {@link NgRedux.setStore} calls it before it listens to a new store,
     * so a replaced store no longer reaches the selections.
     *
     * @since 6.0.0
     */

    private unsubscribeStore?: Unsubscribe;

    /**
     * The feature reducers that {@link NgRedux.addReducer} registered, by the top-level key that each one owns.
     *
     * @remarks
     * The composed root reducer keeps a reference to the map,
     * so a feature added after the store is configured takes part from the next action on.
     *
     * @since 6.0.0
     */

    private readonly featureReducers = new Map<string, Reducer>();

    /**
     * Creates the service and registers it as {@link NgRedux.store}.
     *
     * @param ngZone - The zone that dispatches run in, or nothing to dispatch in the calling zone
     *
     * @remarks
     * Angular injects the zone.
     * With a zone, {@link NgRedux.dispatch} reenters it for an action dispatched from outside,
     * so change detection sees the new state.
     *
     * @example
     * ```ts
     * const ngRedux = new NgRedux<AppState>(ngZone);
     * NgRedux.store === ngRedux; // true
     * ```
     *
     * @since 5.0.0
     */

    constructor(private ngZone?: NgZone) {
        super();
        NgRedux.instance = <NgRedux<unknown>> <unknown> this;
    }

    /**
     * The most recently constructed instance of the service.
     *
     * @throws Error - When no instance has been constructed yet
     *
     * @remarks
     * The decorators read the store through this getter, since they run outside dependency injection.
     * The getter does not check that the store has been configured.
     *
     * @example
     * ```ts
     * NgRedux.store.getState(); // the root state
     * ```
     *
     * @since 5.0.0
     */

    static get store(): NgRedux<unknown> {
        if (!this.instance) {
            throw new Error('NgRedux failed: instance not initialize.');
        }

        return this.instance;
    }

    /**
     * Selects a slice of the state as an observable.
     *
     * @typeParam SelectedType - The type of the selected value
     * @param selector - The key, path, or function that locates the value, or nothing for the whole state
     * @param comparator - The equality check that decides whether a new value is emitted
     * @returns An observable that emits the selected value whenever it changes
     *
     * @remarks
     * The observable skips states that are the same reference as the previous one,
     * maps each state through the selector, and then skips values that the comparator calls equal.
     * Without a comparator, values are compared by reference.
     * Because the subject replays the latest state, a new subscriber receives the current value at once.
     *
     * @example
     * ```ts
     * ngRedux.select('count');                  // emits 3
     * ngRedux.select([ 'user', 'name' ]);       // emits 'Ada'
     * ngRedux.select(state => state.count * 2); // emits 6
     * ```
     *
     * @see SelectorType
     * @see ComparatorType
     *
     * @since 5.0.0
     */

    override select<SelectedType>(selector?: SelectorType<RootState, SelectedType>, comparator?: ComparatorType<SelectedType>): Observable<SelectedType> {
        return this.state$.pipe(
            distinctUntilChanged(),
            map(resolver(selector)),
            distinctUntilChanged(comparator)
        );
    }

    /**
     * Selects a slice of the state as a signal.
     *
     * @typeParam SelectedType - The type of the selected value
     * @param selector - The key, path, or function that locates the value, or nothing for the whole state
     * @param comparator - The equality check that decides whether a new value is a change
     * @returns A read-only signal of the selected value
     *
     * @remarks
     * The signal is computed from the state, so it needs no subscription and no injection context,
     * and it recomputes only when the state changes.
     * Without a comparator, values are compared by reference.
     * It reads `undefined` until the store is configured, without calling the selector.
     * {@link provideNgRedux} configures the store before the first component renders.
     *
     * @example
     * ```ts
     * const count = ngRedux.selectSignal<number>('count');
     * const doubled = ngRedux.selectSignal((state: AppState) => state.count * 2);
     *
     * count(); // 3
     * ```
     *
     * @see injectSelect
     * @see NgRedux.select
     *
     * @since 6.0.0
     */

    override selectSignal<SelectedType>(
        selector?: SelectorType<RootState, SelectedType>,
        comparator?: ComparatorType<SelectedType>
    ): Signal<SelectedType> {
        const resolve = resolver(selector);

        return computed(() => {
            const state = this.state();

            return state === undefined ? <SelectedType> undefined : resolve(state);
        }, { equal: comparator });
    }

    /**
     * Creates the Redux store from a root reducer, an initial state, middlewares, and enhancers.
     *
     * @param reducer - The root reducer
     * @param initState - The initial state
     * @param middleware - The reducer-level middlewares, in the order that they run
     * @param enhancers - The Redux store enhancers, such as the DevTools enhancer
     *
     * @throws Error - When the store has already been configured or provided
     *
     * @remarks
     * Call it once in the lifetime of the application, for example in the constructor of the root module.
     * The root reducer is wrapped so that middlewares run first, substore actions reach their local reducers,
     * and every reducer runs against a draft of the state that it may mutate.
     * The middlewares are {@link MiddlewareInterface} functions on the reducer, not Redux store middlewares.
     * To use a Redux store middleware, pass it through `applyMiddleware` as an enhancer.
     *
     * @example
     * ```ts
     * class AppModule {
     *     constructor(ngRedux: NgRedux<AppState>) {
     *         ngRedux.configureStore(rootReducer, INITIAL_STATE, [ loggerMiddleware ], [ applyMiddleware(thunk) ]);
     *     }
     * }
     * ```
     *
     * @see MiddlewareInterface
     * @see NgRedux.provideStore
     *
     * @since 5.0.0
     */

    configureStore(
        reducer: Reducer<RootState>,
        initState: RootState,
        middleware: Array<MiddlewareInterface<RootState>> = [],
        enhancers: StoreEnhancer[] = []
    ): void {
        if (this.reduxStore) {
            throw new Error('Store already initialize!');
        }

        const rootReducer = ReducerService.getInstance().composeReducers(reducer, middleware, this.featureReducers);
        const enhancer = <StoreEnhancer> compose(...enhancers);

        this.setStore(<Store<RootState, UnknownAction>> enhancer(createStore)(rootReducer, initState));
    }

    /**
     * Creates a substore for one branch of the root state.
     *
     * @typeParam SubState - The type of the state at the base path
     * @param basePath - The path of the substore in the root state
     * @param localReducer - The reducer that handles the actions of the substore
     * @returns A new substore
     *
     * @remarks
     * Selections, dispatches, and the local reducer of the substore see only the branch at `basePath`.
     * Its actions still go through the root Redux store, so DevTools and time travel cover them.
     * Call {@link SubStoreService.setBasePath} on the result to move it to another branch later.
     *
     * @example
     * ```ts
     * const subStore = ngRedux.configureSubStore<User>([ 'users', userId ], userReducer);
     *
     * subStore.select('name'); // emits the name of that user
     * ```
     *
     * @see Substore
     * @see SubStoreService
     *
     * @since 5.0.0
     */

    configureSubStore<SubState>(basePath: PathSelectorType, localReducer: Reducer<SubState>): SubStoreService<SubState> {
        return new SubStoreService<SubState>(<NgRedux<unknown>> <unknown> this, basePath, localReducer);
    }

    /**
     * Adopts a Redux store that was created elsewhere.
     *
     * @param reducer - The root reducer, which replaces the current reducer of the store
     * @param store - The Redux store to adopt
     *
     * @throws Error - When the store has already been configured or provided
     *
     * @remarks
     * Reach for it over {@link NgRedux.configureStore} when another part of the application owns the Redux store.
     * The service wraps `reducer` the same way as `configureStore` does, without middlewares,
     * and installs it with `replaceReducer` on the store.
     * Call it once, and never together with `configureStore`.
     *
     * @example
     * ```ts
     * const store = createStore(rootReducer, INITIAL_STATE);
     *
     * ngRedux.provideStore(rootReducer, store);
     * ```
     *
     * @see NgRedux.configureStore
     *
     * @since 5.0.0
     */

    provideStore(reducer: Reducer<RootState>, store: Store<RootState>): void {
        if (this.reduxStore) {
            throw new Error('Store already initialize!');
        }

        const rootReducer = ReducerService.getInstance().composeReducers(reducer, [], this.featureReducers);
        store.replaceReducer(rootReducer);
        this.setStore(store);
    }

    /**
     * Replaces the Redux store that the service wraps.
     *
     * @param store - The Redux store to wrap from now on
     *
     * @remarks
     * The service stops listening to the previous store, and every selection, observable or signal,
     * continues with the state of the new one.
     * The store is used as given: unlike {@link NgRedux.provideStore}, its reducer is not wrapped,
     * so substores and the draft state of `Action` methods only work when its reducer came from this service,
     * for example a store rebuilt around `ngRedux.getState()` during hot module replacement.
     *
     * @example
     * ```ts
     * ngRedux.replaceStore(createStore(rootReducer, ngRedux.getState()));
     * ```
     *
     * @see NgRedux.provideStore
     *
     * @since 6.0.0
     */

    replaceStore(store: Store<RootState>): void {
        this.setStore(store);
    }

    /**
     * Returns the current root state.
     *
     * @returns The current root state
     *
     * @remarks
     * Calling it before the store is configured throws a `TypeError`.
     *
     * @example
     * ```ts
     * const { count } = ngRedux.getState(); // count is 3
     * ```
     *
     * @since 5.0.0
     */

    getState(): RootState {
        return this.reduxStore.getState();
    }

    /**
     * Dispatches an action to the Redux store inside the Angular zone.
     *
     * @typeParam Action - The type of the dispatched action
     * @param action - The plain action object to dispatch
     * @returns The dispatched action
     *
     * @throws Error - When the store has not been configured or provided yet
     *
     * @remarks
     * A dispatch from outside the Angular zone, such as a callback of a third-party library,
     * reenters the zone first, so the views update without a manual change detection run.
     * A dispatch from inside the zone, or from a service created without a zone, runs directly.
     *
     * @example
     * ```ts
     * ngRedux.dispatch({ type: 'INCREMENT' }); // { type: 'INCREMENT' }
     * ```
     *
     * @since 5.0.0
     */

    dispatch<Action extends UnknownAction>(action: Action): Action {
        if (!this.reduxStore) {
            throw new Error('Dispatch failed: store instance not initialize.');
        }

        /**
         * Reenter the Angular zone for a dispatch from outside it, such as a third-party callback,
         * so change detection sees the new state.
         */

        return this.ngZone && !NgZone.isInAngularZone()
            ? this.ngZone.run(() => this.reduxStore.dispatch(action))
            : this.reduxStore.dispatch(action);
    }

    /**
     * Adds a listener that runs after every dispatch.
     *
     * @param listener - The callback to run
     * @returns A function that removes the listener
     *
     * @remarks
     * The listener goes straight to the Redux store, so it runs for every action,
     * even when the state did not change.
     * Read the new state with {@link NgRedux.getState} inside it, or use {@link AbstractStore.select} instead.
     *
     * @example
     * ```ts
     * const unsubscribe = ngRedux.subscribe(() => console.log(ngRedux.getState()));
     * unsubscribe(); // the listener no longer runs
     * ```
     *
     * @since 5.0.0
     */

    subscribe(listener: () => void): Unsubscribe {
        return this.reduxStore.subscribe(listener);
    }

    /**
     * Adds a reducer that owns one top-level key of the state, next to the root reducer.
     *
     * @param key - The top-level key of the state that the reducer owns
     * @param reducer - The reducer of that key, which may mutate its draft
     *
     * @remarks
     * Use it to load the reducer of a lazy feature with its code, rather than listing every feature in the root reducer.
     * {@link provideNgReduxFeature} calls it when the providers of a lazy route are created.
     *
     * The root reducer never sees the key, so `combineReducers` neither drops it nor warns about it.
     * Once the store is configured, the call dispatches {@link ADD_REDUCER}, so the reducer sets its initial state at once.
     * A reducer added before that joins the store when it is configured.
     * Adding the same reducer again does nothing, and a different reducer for the same key replaces it.
     * The root state must be an object, and the key keeps its state for the life of the store.
     *
     * @example
     * ```ts
     * ngRedux.addReducer('todos', todosReducer);
     * ngRedux.getState().todos; // the initial state of todosReducer
     * ```
     *
     * @see provideNgReduxFeature
     *
     * @since 6.0.0
     */

    addReducer(key: string, reducer: Reducer): void {
        if (this.featureReducers.get(key) === reducer) {
            return;
        }

        this.featureReducers.set(key, reducer);
        if (this.reduxStore) {
            this.dispatch({ type: ADD_REDUCER, key });
        }
    }

    /**
     * Replaces the root reducer.
     *
     * @param nextReducer - The root reducer to use from the next action on
     *
     * @remarks
     * Only the innermost root reducer changes, so the middlewares and the substore routing stay in place.
     * The Redux store is not told about the change, so no `@@redux/REPLACE` action is dispatched.
     *
     * @example
     * ```ts
     * ngRedux.replaceReducer(combineReducers({ counter, todos }));
     * ```
     *
     * @since 5.0.0
     */

    replaceReducer(nextReducer: Reducer<RootState>): void {
        ReducerService.getInstance().replaceReducer(nextReducer);
    }

    /**
     * Stores the Redux store and starts feeding its state into the selections.
     *
     * @param store - The Redux store to wrap
     *
     * @remarks
     * It pushes the current state at once and then the state after every dispatch,
     * into both the observable and the signal selections.
     * A store that was set before stops feeding them.
     *
     * @since 5.0.0
     */

    protected setStore(store: Store<RootState>): void {
        const publish = (): void => {
            const state = store.getState();
            this.state.set(state);
            this.state$.next(state);
        };

        this.unsubscribeStore?.();
        this.reduxStore = store;
        this.unsubscribeStore = store.subscribe(publish);
        publish();
    }
}
