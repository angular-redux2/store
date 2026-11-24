/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Action, Reducer, Unsubscribe } from 'redux';
import type { CreateComputedOptions, Signal } from '@angular/core';
import type { BasePathType, SelectorType, StoreInterface, SubStoreInterface } from '@interfaces/store.interface';

/**
 * Imports
 */

import { computed, untracked } from '@angular/core';
import { distinctUntilChanged, Observable } from 'rxjs';

/**
 * The reading side shared by the root store and every substore.
 *
 * @typeParam State - The type of the state that the store holds
 *
 * @remarks
 * A store only has to provide its `state` signal, a way to dispatch, a way to create a substore,
 * and a listener hook that runs after every dispatch.
 * Everything else that reads the state is built here from those, so both stores read the same way.
 *
 * @example
 * ```ts
 * const store: AbstractStore<AppState> = inject(NgRedux<AppState>);
 *
 * store.select(state => state.counter)(); // 0
 * ```
 *
 * @see StoreInterface
 *
 * @since 6.0.0
 */

export abstract class AbstractStore<State> implements StoreInterface<State> {
    /**
     * Puts the interop method under `Symbol.observable` too, when a polyfill defines that symbol.
     *
     * @remarks
     * A class cannot declare a member under `Symbol.observable`, because RxJS types it as a plain `symbol`,
     * so the block adds it to the prototype once, when the class is defined.
     * Without a polyfill the symbol is `undefined`, and RxJS and Redux fall back to the `'@@observable'` key.
     *
     * @since 6.0.0
     */

    static {
        const observable = (<{ observable?: symbol }> <unknown> Symbol).observable;
        if (typeof observable === 'symbol') {
            Object.defineProperty(this.prototype, observable, { value: this.prototype['@@observable'] });
        }
    }

    /**
     * The whole state of this store as a read-only signal.
     *
     * @example
     * ```ts
     * store.state(); // { counter: 0 }
     * ```
     *
     * @since 6.0.0
     */

    abstract readonly state: Signal<State>;

    /**
     * Dispatches an action to the store.
     *
     * @typeParam DispatchedAction - The type of the action
     * @param action - The action to dispatch
     * @returns The same action
     *
     * @example
     * ```ts
     * store.dispatch({ type: 'INCREMENT' }); // { type: 'INCREMENT' }
     * ```
     *
     * @since 6.0.0
     */

    abstract dispatch<DispatchedAction extends Action>(action: DispatchedAction): DispatchedAction;

    /**
     * Creates a store that works on one branch of this store.
     *
     * @typeParam SubState - The state of the branch
     * @param basePath - The path of the branch, relative to this store
     * @param reducer - The reducer that handles the actions dispatched through the substore
     * @returns A store for the branch at the base path
     *
     * @example
     * ```ts
     * store.substore([ 'users', 'bob' ], userReducer).getState(); // { name: 'Bob Smith', loc: 1023 }
     * ```
     *
     * @since 6.0.0
     */

    abstract substore<SubState>(basePath: BasePathType, reducer: Reducer<SubState>): SubStoreInterface<SubState>;

    /**
     * Returns the current state without tracking it.
     *
     * @returns The current state of this store
     *
     * @remarks
     * Reading through this method inside a `computed` or an `effect` does not make it rerun on the next change.
     *
     * @example
     * ```ts
     * store.getState(); // { counter: 0 }
     * ```
     *
     * @since 6.0.0
     */

    getState(): State {
        return untracked(this.state);
    }

    /**
     * Selects one value of the state as a signal.
     *
     * @typeParam Selected - The value that the selector returns
     * @param selector - The function that picks the value
     * @param options - The options passed to the underlying `computed`
     * @returns A read-only signal of the selected value
     *
     * @remarks
     * The signal is a `computed` over {@link AbstractStore.state},
     * so it needs no subscription and no injection context, and it only runs the selector when read after a change.
     *
     * @example
     * ```ts
     * const count = store.select(state => state.counter);
     *
     * count(); // 0
     * ```
     *
     * @since 6.0.0
     */

    select<Selected>(selector: SelectorType<State, Selected>, options?: CreateComputedOptions<Selected>): Signal<Selected> {
        return computed(() => selector(this.state()), options);
    }

    /**
     * Selects one value of the state as an observable.
     *
     * @typeParam Selected - The value that the selector returns
     * @param selector - The function that picks the value
     * @param options - The `equal` function that decides whether a new value is emitted
     * @returns An observable that emits the current value on subscribe and every distinct change after it
     *
     * @remarks
     * The observable emits synchronously after each dispatch that changes the selected value,
     * so it never skips an intermediate value the way `toObservable` does.
     * Every subscription listens on its own and stops when it unsubscribes.
     *
     * @example
     * ```ts
     * store.select$(state => state.counter).subscribe(console.log); // logs 0
     * store.dispatch({ type: 'INCREMENT' });                         // logs 1
     * ```
     *
     * @since 6.0.0
     */

    select$<Selected>(
        selector: SelectorType<State, Selected>, options?: Pick<CreateComputedOptions<Selected>, 'equal'>
    ): Observable<Selected> {
        return new Observable<Selected>(subscriber => {
            const emit = (): void => subscriber.next(selector(this.getState()));
            emit();

            return this.listen(emit);
        }).pipe(distinctUntilChanged(options?.equal));
    }

    /**
     * Makes the store an interop observable, so RxJS `from(store)` emits the whole state.
     *
     * @returns An observable of the whole state, the same as `select$(state => state)`
     *
     * @remarks
     * RxJS and Redux look the method up under `Symbol.observable` when a polyfill defines it,
     * and under the `'@@observable'` key otherwise, so the store answers both.
     * A polyfill has to load before this module for the `Symbol.observable` key to be set.
     *
     * @example
     * ```ts
     * from(ngRedux).subscribe(state => console.log(state)); // logs { counter: 0 }
     * ```
     *
     * @since 6.0.0
     */

    '@@observable'(): Observable<State> {
        return this.select$(state => state);
    }

    /**
     * Registers a listener that runs after every dispatch to the root store.
     *
     * @param listener - The function to run
     * @returns A function that removes the listener
     *
     * @remarks
     * {@link AbstractStore.select$} builds on it, so it emits synchronously and never skips a value.
     *
     * @since 6.0.0
     */

    protected abstract listen(listener: () => void): Unsubscribe;
}
