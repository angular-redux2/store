/**
 * Imports third-party libraries
 */

import * as redux from 'redux';
import { Injectable, NgZone } from '@angular/core';
import { distinctUntilChanged, map, Observable, ReplaySubject } from 'rxjs';

/**
 * Import components
 */

import { resolver } from '../components/selectors.component';
import { FractalReducerComponent } from '../components/fractal-reducer.component';

/**
 * Import services
 */

import { SubStoreService } from './sub-store.service';

/**
 * Import interfaces
 */

import { Comparator, PathSelector, Selector, StoreInterface } from '../interfaces/store.interface';

/**
 * This is the public of `@angular-redux2/store`.
 * It wraps the global redux store and adds a few others add on methods.
 * It's what you'll inject into your Angular application as a service.
 */

@Injectable({
    providedIn: 'root',
})
export class NgRedux<RootState> implements StoreInterface<RootState> {

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

    private _store: redux.Store<RootState, any>;


    /**
     * Angular subject store.
     * correspond to store change event and trigger rxjs change event.
     */

    private readonly _store$: ReplaySubject<RootState> = new ReplaySubject<RootState>(1);

    /**
     * Constructor
     */

    constructor(private ngZone?: NgZone) {
        NgRedux.instance = this;
    }

    /**
     * @hidden
     * access to singleton service instance.
     */

    static get store(): NgRedux<any> {
        if (!this.instance) {
            throw new Error('NgRedux failed: did you forget to configure your store?');
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

    dispatch<A extends redux.AnyAction>(action: A): A {
        this.assert(
            !!this._store,
            'Dispatch failed: did you forget to configure your store?'
        );

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
        rootReducer: redux.Reducer<RootState, redux.AnyAction>,
        initState: RootState,
        middleware: Array<redux.Middleware> = [],
        enhancers: Array<redux.StoreEnhancer<RootState>> = []
    ): void {
        this.assert(!this._store, 'Store already configured!');

        // Composes single-argument functions from right to left.
        const composeResult: any = redux.compose.apply(null, [ redux.applyMiddleware(...middleware), ...enhancers ]);

        this.setStore(
            composeResult(
                redux.createStore
            )(FractalReducerComponent.enable(rootReducer), initState)
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
     * ```typescript
     *   onInit() {
     *     // The reducer passed here will affect state under `users.${userID}`
     *     // in the top-level store.
     *     this.subStore = this.ngRedux.configureSubStore(
     *       ['users', userId],
     *       userComponentReducer,
     *     );
     *
     *     // Substore selectons are scoped to the base path used to configure
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

    configureSubStore<SubState>(basePath: PathSelector, localReducer: redux.Reducer<SubState, redux.AnyAction>): StoreInterface<SubState> {
        return new SubStoreService<SubState>(this, basePath, localReducer);
    }

    /**
     * Accepts a Redux store, then sets it in NgRedux and allows NgRedux to observe and dispatch to it.
     * This should only be called once for the lifetime of your app, for example in the constructor of your root component.
     * If configureStore has been used this cannot be used.
     *
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

    provideStore(store: redux.Store<RootState>): void {
        this.assert(!this._store, 'Store already configured!');
        this.setStore(store);
    }

    /**
     * Get store state.
     *
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

    subscribe(listener: () => void): redux.Unsubscribe {
        return this._store.subscribe(listener);
    }

    /**
     * Replaces the reducer currently used by the store to calculate the state.
     * You might need this if your app implements code splitting, and you want to load some reducers dynamically.
     * You might also need this if you implement a hot reloading mechanism for Redux.
     *
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

    replaceReducer(nextReducer: redux.Reducer<RootState, redux.AnyAction>): void {
        return this._store.replaceReducer(nextReducer);
    }

    /**
     * Interoperability point for observable/reactive libraries.
     * @returns {observable} A minimal observable of state changes.
     * For more information, see the observable proposal:
     * https://github.com/tc39/proposal-observable
     *
     * @hidden
     */

    [Symbol.observable](): any {
        return this.getState();
    }

    /**
     * Set root store.
     */

    protected setStore(store: redux.Store<RootState>): void {
        this._store = store;
        this._store$.next(store.getState());

        store.subscribe(() => {
            this._store$.next(store.getState());
        });
    }

    /**
     * Rise errors.
     * @hidden
     */

    protected assert(condition: boolean, message: string): void {
        if (!condition) {
            throw new Error(message);
        }
    }
}
