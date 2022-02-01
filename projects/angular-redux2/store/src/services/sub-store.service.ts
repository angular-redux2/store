/**
 * Imports third-party libraries
 */

import { AnyAction, Reducer } from 'redux';
import { distinctUntilChanged, map, Observable } from 'rxjs';

/**
 * Import components
 */

import { get } from '../components/object.component';
import { resolver } from '../components/selectors.component';
import { FractalReducerComponent } from '../components/fractal-reducer.component';

/**
 * Import services
 */

import { NgRedux } from './ng-redux.service';

/**
 * Import interfaces
 */

import { Comparator, PathSelector, Selector, StoreInterface } from '../interfaces/store.interface';

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
 */

export class SubStoreService<State> implements StoreInterface<State> {

    /**
     * Constructor
     *
     * @param rootStore - root store instance.
     * @param basePath - sub store  base path.
     * @param localReducer - sub store custom reducer.
     */

    constructor(
        private rootStore: NgRedux<any>,
        private basePath: PathSelector,
        localReducer: Reducer<State, AnyAction>
    ) {
        FractalReducerComponent.registerReducer(basePath, localReducer);
    }

    /**
     * Dispatches an actions. It is the only way to trigger a state change.
     * The reducer function, used to create the store, will be called with the current state tree and the given actions.
     * Its return value will be considered the next state of the tree, and the change listeners will be notified.
     *
     * @param action - action to dispatch.
     *
     * @return dispatch action.
     */

    dispatch<A extends AnyAction>(action: A): A {
        return this.rootStore.dispatch(
            Object.assign({}, action, {
                '@angular-redux2::fractalKey': JSON.stringify(this.basePath),
            })
        );
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

    getState = (): State => get(this.rootStore.getState(), this.basePath);

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
     * @param basePath - select part of store
     * @param localReducer - reducer of the same store
     *
     * @return StoreInterface<SubState>
     */

    configureSubStore<SubState>(basePath: PathSelector, localReducer: Reducer<SubState, AnyAction>): StoreInterface<any> {
        return <any> (new SubStoreService<SubState>(this.rootStore, [ ...this.basePath, ...basePath ], localReducer));
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

    select<SelectedType>(selector?: Selector<State, SelectedType>, comparator?: Comparator): Observable<SelectedType> {
        return this.rootStore
            .select<State>(this.basePath)
            .pipe(
                map(resolver(selector)),
                distinctUntilChanged(comparator)
            );
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

    subscribe(listener: () => void): (() => void) {
        const subscription = this.select().subscribe(listener);

        return () => subscription.unsubscribe();
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
     * @param nextLocalReducer - Reducer<RootState, AnyAction>
     * @return void
     */

    replaceReducer(nextLocalReducer: Reducer<State, AnyAction>) {
        return FractalReducerComponent.replaceReducer(this.basePath, nextLocalReducer);
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
        return this.rootStore.getState();
    }
}
