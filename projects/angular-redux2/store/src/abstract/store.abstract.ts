/**
 * Import third-party libraries
 */

import { distinctUntilChanged, map, ReplaySubject } from 'rxjs';

/**
 * Import third-party types
 */

import { Observable } from 'rxjs';
import { AnyAction, Reducer, Store, Unsubscribe } from 'redux';

/**
 * angular-redux2
 */

import { resolver } from '../components/selectors.component';

/**
 * angular-redux2 types
 */

import { Comparator, Selector } from '../interfaces/store.interface';

/**
 * A store is an object that holds the application's state tree.
 * There should only be a single store in a Redux app, as the composition
 * happens on the reducer level.
 *
 * @template State type of state held by this store
 */

export abstract class AbstractStore<State> implements Store<State> {
    /**
     * Angular subject store
     * corresponds to store change event and trigger rxjs change event
     */

    protected readonly _store$: ReplaySubject<State> = new ReplaySubject<State>(1);

    /**
     * Get store current state
     */

    abstract getState(): State;

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
     * @param action - action to dispatch
     * @return dispatch action
     */

    abstract dispatch<Action extends AnyAction>(action: Action): Action;

    /**
     * Replaces the reducer currently used by the store to calculate the state.
     * You might need this if your app implements code splitting, and you want to load some reducers dynamically.
     * You might also need this if you implement a hot reloading mechanism for Redux.

     * @param nextReducer - Reducer<RootState, AnyAction>
     * @return void
     */

    abstract replaceReducer(nextReducer: Reducer<State, AnyAction>): void;

    /**
     * Adds a change listener.
     * It will be called any time an actions is dispatched, and some part of the state tree may potentially have changed.
     * You may then call getState() to read the current state tree inside the callback.
     *
     * 1. The subscriptions are snapshotted just before every dispatch() call.
     * If you subscribe or unsubscribe while the listeners are being invoked,
     * this will not have any effect on the dispatch() that is currently in progress.
     * However, the next dispatch() call, whether nested or not it will use a more recent snapshot of the subscription list.
     *
     * 2. The listener should not expect to see all-states changes,
     * as the state might have been updated multiple times during a nested dispatch() before the listener is called.
     * It is, however, guaranteed that all subscribers registered before the dispatch()
     * started will be called with the latest state by the time it exits.
     *
     * @param listener - A callback to be invoked on every dispatch
     * @return Unsubscribe
     */

    abstract subscribe(listener: () => void): Unsubscribe;

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
     * @template SelectedType The type of the selected slice of state
     * @param {Selector<State, SelectedType>} [selector] - A key or function to select a part of the state
     * @param {Comparator} [comparator] - A comparison function called to test if an item is distinct from the previous item in the source
     * @returns {Observable<SelectedType>} An Observable that emits items from the source Observable with distinct values
     */

    select<SelectedType>(selector?: Selector<State, SelectedType>, comparator?: Comparator): Observable<SelectedType> {
        return this._store$.pipe(
            distinctUntilChanged(),
            map(resolver(selector)),
            distinctUntilChanged(comparator)
        );
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
        return this._store$;
    }
}
