/**
 * Import third-party libraries
 */

import { Injectable, NgZone } from '@angular/core';
import { distinctUntilChanged, map, Observable, ReplaySubject } from 'rxjs';
import {
    Store,
    Reducer,
    AnyAction,
    Middleware,
    Unsubscribe,
    StoreEnhancer,
    compose,
    createStore,
    applyMiddleware
} from 'redux';

/**
 * Components
 */

import { resolver } from '../components/selectors.component';

/**
 * Services
 */

import { ReducerService } from './reducer.service';
import { SubStoreService } from './sub-store.service';

/**
 * Interfaces
 */

import { Comparator, PathSelector, Selector } from '../interfaces/store.interface';

/**
 * This is the public of `@angular-redux2/store`.
 * It wraps the global redux store and adds a few others add on methods.
 * It's what you'll inject into your Angular application as a service.
 */

@Injectable({
    providedIn: 'root',
})
export class NgRedux<RootState> implements Store<RootState> {

    /**
     * @hidden
     * Instance of NgRedux (singleton service).
     */

    protected static instance: NgRedux<any>;

    /**
     * Redux store
     * A store is an object that holds the application's state tree.
     * There should only be a single store in a Redux app, as the composition
     * happens on the reducer level.
     *
     * @template state - The type of state held by this store.
     * @template action - the type of actions which may be dispatched by this store.
     */

    private _store: Store<RootState, any>;

    /**
     * Angular subject store.
     * correspond to store change event and trigger rxjs change event.
     */

    private readonly _store$: ReplaySubject<RootState> = new ReplaySubject<RootState>(1);

    /**
     * Constructor
     *
     * @ngZone - control angular change detection base on zoneJS api
     * that intersect async operation like setTimeOut, setInterval, click and many more.
     * use angular ngzone wrapper allow control change detection trigger.
     */

    constructor(private ngZone?: NgZone) {
        NgRedux.instance = this;
    }

    /**
     * The static method that controls the access to the singleton instance.
     *
     * This implementation let you subclass the Singleton class while keeping
     * just one instance of each subclass around.
     *
     * @hidden
     * static store<T extends Store>(): NgRedux<T>
     *
     * @return NgRedux
     */

    static get store(): NgRedux<any> {
        if (!this.instance) {
            throw new Error('NgRedux failed: instance not initialize.');
        }

        return this.instance;
    }

    /**
     * A `dispatching function` (or simply *dispatch function*) is a function that
     * accepts an actions or an async actions; it then may or may not dispatch one
     * or more actions to the store.
     *
     * We must distinguish between dispatching functions in general and the base
     * `dispatch` function provided by the store instance without any middleware.
     *
     * The base dispatch function *always* synchronously sends an actions to the
     * store's reducer, along with the previous state returned by the store, to
     * calculate a new state. It expects actions to be plain objects ready to be
     * consumed by the reducer.
     *
     * @example
     * ```typescript
     *  class App {
     *    @Select() count$: Observable<number>;
     *
     *    constructor(private ngRedux: NgRedux<IAppState>) {}
     *
     *    onClick() {
     *      this.ngRedux.dispatch({ type: INCREMENT });
     *    }
     *  }
     * ```
     *
     * @param action - action to dispatch.
     *
     * @return dispatch action.
     */

    dispatch<A extends AnyAction>(action: A): A {
        if (!this._store) {
            throw new Error('Dispatch failed: store instance not initialize.');
        }

        /**
         * has been tweaked to always run in the Angular zone.
         * This should prevent unexpected weirdness when dispatching from callbacks to 3rd-party.
         */

        if (this.ngZone && !NgZone.isInAngularZone()) {
            return this.ngZone.run(() => this._store!.dispatch(action));
        } else {
            return this._store.dispatch(action);
        }
    }

    /**
     * Select a slice of state to expose as an observable.
     *
     * @example
     * ```typescript
     *
     * constructor(private ngRedux: NgRedux<IAppState>) {}
     *
     * ngOnInit() {
     *   let { increment, decrement } = CounterActions;
     *   this.counter$ = this.ngRedux.select('counter');
     * }
     * ```
     *
     * @param selector - key or function to select a part of the state.
     * @param comparator - comparison function called to test if an item is distinct from the previous item in the source.
     *
     * @return An Observable that emits items from the source Observable with distinct values.
     */

    select<SelectedType>(selector?: Selector<RootState, SelectedType>, comparator?: Comparator): Observable<SelectedType> {
        return this._store$.pipe(
            distinctUntilChanged(),
            map(resolver(selector)),
            distinctUntilChanged(comparator)
        );
    }

    /**
     * Configures a Redux store and allows NgRedux to observe and dispatch to it.
     *
     * `This should only be called once for the lifetime of your app, for
     * example in the constructor of your root component.`
     *
     * @example
     * ```typescript
     * export class AppModule {
     *   constructor(ngRedux: NgRedux<IAppState>) {
     *     // Tell @angular-redux2/store about our rootReducer and our initial state.
     *     // It will use this to create a redux store for us and wire up all the
     *     // events.
     *     ngRedux.configureStore(rootReducer, INITIAL_STATE);
     *   }
     * }
     * ```
     *
     * @param rootReducer - Your app's root reducer.
     * @param initState - Your app's initial state.
     * @param middleware - Optional Redux middlewares.
     * @param enhancers - Optional Redux store enhancers.
     */

    configureStore(
        rootReducer: Reducer<RootState>,
        initState: RootState,
        middleware: Array<Middleware> = [],
        enhancers: Array<StoreEnhancer<RootState>> = []
    ): void {
        if (this._store) {
            throw new Error('Store already initialize!');
        }

        // Composes single-argument functions from right to left.
        const composeResult: any = compose.apply(null, [ applyMiddleware(...middleware), ...enhancers ]);

        this.setStore(
            composeResult(
                createStore
            )(ReducerService.getInstance().composeRoot(rootReducer), initState)
        );
    }

    /**
     * Carves off a 'subStore' or 'fractal' store from this one.
     *
     * The returned object is itself an observable store, however any
     * selections, dispatches, or invocations of localReducer will be
     * specific to that sub-store and will not know about the parent
     * ObservableStore from which it was created.
     *
     * This is handy for encapsulating component or module state while
     * still benefiting from time-travel, etc.
     *
     * @example
     * ```typescript
     *   onInit() {
     *     // The reducer passed here will affect state under `users.${userID}`
     *     // in the top-level store.
     *     this.subStore = this.ngRedux.configureSubStore(
     *       ['users', userId],
     *       userComponentReducer,
     *     );
     *
     *     // Substore selections are scoped to the base path used to configure
     *     // the substore.
     *     this.name$ = this.subStore.select('name');
     *     this.occupation$ = this.subStore.select('occupation');
     *     this.loc$ = this.subStore.select(s => s.loc || 0);
     *   }
     * ```
     *
     * @param basePath - select part of store.
     * @param localReducer - reducer of the same store.
     *
     * @return StoreInterface<SubState>.
     */

    configureSubStore<SubState>(basePath: PathSelector, localReducer: Reducer<SubState>): Store<SubState> {
        const subStoreService = new SubStoreService<SubState>(this, basePath, localReducer);
        subStoreService.setBasePath(basePath);

        return subStoreService;
    }

    /**
     * Accepts a Redux store, then sets it in NgRedux and allows NgRedux to observe and dispatch to it.
     * This should only be called once for the lifetime of your app, for example in the constructor of your root component.
     * If configureStore has been used this cannot be used.
     *
     * @example
     * ```typescript
     * class AppModule {
     *   constructor(ngRedux: NgRedux<IAppState>) {
     *     ngRedux.provideStore(store);
     *   }
     * }
     * ```
     *
     * @param store - if you prefer to create the Redux store yourself you can do that.
     */

    provideStore(store: Store<RootState>): void {
        if (this._store) {
            throw new Error('Store already initialize!');
        }

        this.setStore(store);
    }

    /**
     * Get store state.
     *
     * @example
     * ```typescript
     *   incrementIfOdd(): void {
     *     const { counter } = this.ngRedux.getState();
     *     if (counter % 2 !== 0) {
     *       this.increment();
     *     }
     *   }
     * ```
     *
     * @returns The current state tree of your application.
     */

    getState(): RootState {
        return this._store.getState();
    }

    /**
     * Adds a change listener.
     * It will be called any time an actions is dispatched, and some part of the state tree may potentially have changed.
     * You may then call getState() to read the current state tree inside the callback.
     *
     * 1. The subscriptions are snapshotted just before every dispatch() call.
     * If you subscribe or unsubscribe while the listeners are being invoked,
     * this will not have any effect on the dispatch() that is currently in progress.
     * However, the next dispatch() call, whether nested or not,
     * will use a more recent snapshot of the subscription list.
     *
     * 2. The listener should not expect to see all states changes,
     * as the state might have been updated multiple times during a nested dispatch() before the listener is called.
     * It is, however, guaranteed that all subscribers registered before the dispatch()
     * started will be called with the latest state by the time it exits.
     *
     * @example
     * ```typescript
     *   constructor(
     *     private ngRedux: NgRedux<IAppState>,
     *     private actions: CounterActions,
     *   ) {
     *     this.subscription = ngRedux
     *       .select<number>('count')
     *       .subscribe(newCount => (this.count = newCount));
     *   }
     *
     *   ngOnDestroy() {
     *     this.subscription.unsubscribe();
     *   }
     * ```
     *
     * @param listener - A callback to be invoked on every dispatch.
     */

    subscribe(listener: () => void): Unsubscribe {
        return this._store.subscribe(listener);
    }

    /**
     * Replaces the reducer currently used by the store to calculate the state.
     * You might need this if your app implements code splitting, and you want to load some reducers dynamically.
     * You might also need this if you implement a hot reloading mechanism for Redux.
     *
     * @example
     * ```typescript
     * const newRootReducer = combineReducers({
     *   existingSlice: existingSliceReducer,
     *   newSlice: newSliceReducer
     * })
     *
     * ngRedux.replaceReducer(newRootReducer)
     * ```
     *
     * @param nextReducer - Reducer<RootState, AnyAction>.
     * @return void.
     */

    replaceReducer(nextReducer: Reducer<RootState>): void {
        return this._store.replaceReducer(nextReducer);
    }

    /**
     * @hidden
     * Interoperability point for observable/reactive libraries.
     * @returns {observable} A minimal observable of state changes.
     * For more information, see the observable proposal:
     * https://github.com/tc39/proposal-observable
     */

    [Symbol.observable](): any {
        return this._store$;
    }

    /**
     * Set root store.
     */

    protected setStore(store: Store<RootState>): void {
        this._store = store;
        this._store$.next(store.getState());

        store.subscribe(() => {
            this._store$.next(store.getState());
        });
    }
}
