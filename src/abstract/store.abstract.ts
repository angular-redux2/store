/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Observable } from 'rxjs';
import type { Signal } from '@angular/core';
import type { UnknownAction, Reducer, Store, Unsubscribe } from 'redux';
import type { ComparatorType, SelectorType } from '../interfaces/store.interface';

/**
 * The observable store contract shared by the root store and every substore.
 *
 * @typeParam State - The type of the state that the store holds
 *
 * @remarks
 * Subclasses provide `getState`, `dispatch`, `replaceReducer`, `subscribe`, `select`, and `selectSignal`:
 * {@link NgRedux} selects from the Redux store, and {@link SubStoreService} from the root store at its base path.
 * The class turns `select` into the `Symbol.observable` interop, so both stores work with `from(store)`.
 * It also implements the Redux `Store` interface, so either store can stand in where Redux expects one.
 *
 * @example
 * ```ts
 * const store: AbstractStore<AppState> = ngRedux;
 * const subStore: AbstractStore<User> = ngRedux.configureSubStore([ 'users', 'u1' ], userReducer);
 *
 * store.select('count');   // emits the root count
 * subStore.select('name'); // emits the name of user u1
 * ```
 *
 * @see NgRedux
 * @see SubStoreService
 *
 * @since 5.0.0
 */

export abstract class AbstractStore<State> implements Store<State> {
    /**
     * Returns the current state of the store.
     *
     * @returns The current state
     *
     * @remarks
     * The root store reads the Redux store, while a substore reads the root state at its base path.
     *
     * @example
     * ```ts
     * ngRedux.getState(); // { count: 3 }
     * ```
     *
     * @since 5.0.0
     */

    abstract getState(): State;

    /**
     * Dispatches an action to the store.
     *
     * @typeParam Action - The type of the dispatched action
     * @param action - The plain action object to dispatch
     * @returns The dispatched action
     *
     * @remarks
     * The root store hands the action to Redux.
     * A substore tags the action with its reducer and base path before handing it to the root store.
     *
     * @example
     * ```ts
     * ngRedux.dispatch({ type: 'INCREMENT' }); // { type: 'INCREMENT' }
     * ```
     *
     * @since 5.0.0
     */

    abstract dispatch<Action extends UnknownAction>(action: Action): Action;

    /**
     * Replaces the reducer that the store uses to calculate the state.
     *
     * @param nextReducer - The reducer to use from the next action on
     *
     * @remarks
     * Use it for code splitting or hot reloading.
     * The root store swaps its root reducer, while a substore swaps its local reducer.
     *
     * @example
     * ```ts
     * ngRedux.replaceReducer(combineReducers({ counter, todos }));
     * ```
     *
     * @since 5.0.0
     */

    abstract replaceReducer(nextReducer: Reducer<State, UnknownAction>): void;

    /**
     * Adds a listener that runs after the state may have changed.
     *
     * @param listener - The callback to run
     * @returns A function that removes the listener
     *
     * @remarks
     * The root store registers the listener with Redux, so it runs after every dispatch.
     * Read the new state with `getState()` inside the listener.
     * A substore runs the listener on every emission of its own selection instead.
     *
     * @example
     * ```ts
     * const unsubscribe = ngRedux.subscribe(() => console.log(ngRedux.getState()));
     * unsubscribe(); // the listener no longer runs
     * ```
     *
     * @since 5.0.0
     */

    abstract subscribe(listener: () => void): Unsubscribe;

    /**
     * Selects a slice of the state as an observable.
     *
     * @typeParam SelectedType - The type of the selected value
     * @param selector - The key, path, or function that locates the value, or nothing for the whole state
     * @param comparator - The equality check that decides whether a new value is emitted
     * @returns An observable that emits the selected value whenever it changes
     *
     * @remarks
     * A new subscriber receives the current value at once, and then each value that the comparator does not call
     * equal to the previous one. Without a comparator, values are compared by reference.
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

    abstract select<SelectedType>(
        selector?: SelectorType<State, SelectedType>,
        comparator?: ComparatorType<SelectedType>
    ): Observable<SelectedType>;

    /**
     * Selects a slice of the state as a signal.
     *
     * @typeParam SelectedType - The type of the selected value
     * @param selector - The key, path, or function that locates the value, or nothing for the whole state
     * @param comparator - The equality check that decides whether a new value is a change
     * @returns A read-only signal of the selected value
     *
     * @remarks
     * The signal always holds the current value and needs no subscription.
     * Without a comparator, values are compared by reference.
     *
     * @example
     * ```ts
     * const count = ngRedux.selectSignal<number>('count');
     * count(); // 3
     * ```
     *
     * @see AbstractStore.select
     *
     * @since 6.0.0
     */

    abstract selectSignal<SelectedType>(
        selector?: SelectorType<State, SelectedType>,
        comparator?: ComparatorType<SelectedType>
    ): Signal<SelectedType>;

    /**
     * Returns the whole state as an observable, for interoperability with other observable libraries.
     *
     * @returns An observable that emits the current state and every change
     *
     * @remarks
     * Redux and RxJS look up this method through `Symbol.observable`,
     * so `from(store)` turns the store into an observable of its state.
     * See the [observable proposal](https://github.com/tc39/proposal-observable) for the protocol.
     *
     * @hidden
     * @since 5.0.0
     */

    [Symbol.observable](): ReturnType<Store<State>[typeof Symbol.observable]> {
        return <ReturnType<Store<State>[typeof Symbol.observable]>> <unknown> this.select();
    }
}
