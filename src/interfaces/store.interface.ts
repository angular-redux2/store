/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Observable } from 'rxjs';
import type { Action, Reducer } from 'redux';
import type { CreateComputedOptions, Signal } from '@angular/core';

/**
 * A function that picks one value out of the state.
 *
 * @typeParam State - The state that the selector reads
 * @typeParam Selected - The value that the selector returns
 *
 * @remarks
 * A selector is the only way to read part of the state, so TypeScript infers the selected type from its body.
 * It runs inside a `computed`, so it must be pure and should not create new objects or arrays on every call
 * unless the selection also passes an `equal` function.
 *
 * @example
 * ```ts
 * const count: SelectorType<AppState, number> = state => state.counter;
 *
 * ngRedux.select(count)(); // 0
 * ```
 *
 * @see StoreInterface
 *
 * @since 6.0.0
 */

export type SelectorType<State, Selected> = (state: State) => Selected;

/**
 * A list of keys and indexes that walks down the state tree.
 *
 * @remarks
 * Each entry selects one level, so `[ 'users', 'bob', 'loc' ]` points at `state.users.bob.loc`.
 * A path only places a substore in the state, while reading the state always goes through a {@link SelectorType}.
 *
 * @example
 * ```ts
 * const path: PathType = [ 'users', 'bob' ];
 *
 * ngRedux.substore(path, userReducer).getState(); // { name: 'Bob Smith', loc: 1023 }
 * ```
 *
 * @see BasePathType
 *
 * @since 6.0.0
 */

export type PathType = ReadonlyArray<string | number>;

/**
 * The base path of a substore, fixed or computed.
 *
 * @remarks
 * A function runs inside a reactive context,
 * so a path built from signals, such as a component input, moves the substore whenever one of those signals changes.
 * Selections follow the move, and the next dispatch goes to the new path.
 *
 * @example
 * ```ts
 * ngRedux.substore([ 'users', 'bob' ], userReducer);               // a fixed path
 * ngRedux.substore(() => [ 'users', this.userId() ], userReducer); // follows the userId input
 * ```
 *
 * @see PathType
 *
 * @since 6.0.0
 */

export type BasePathType = PathType | (() => PathType);

/**
 * A Redux action that carries a payload.
 *
 * @typeParam Payload - The type of the payload
 *
 * @remarks
 * A reducer receives every action dispatched to the store, not only the ones that it handles,
 * so the payload is optional and any other property is allowed, the same as Redux's `UnknownAction`.
 * That keeps a reducer typed with this action assignable to `Reducer<State>`,
 * so it can go to `provideNgRedux`, `combineReducers`, or a substore.
 * The cost is that TypeScript does not catch a misspelled property name.
 *
 * @example
 * ```ts
 * function counter(state = 0, action: PayloadActionInterface<number>): number {
 *     return action.type === 'ADD' ? state + (action.payload ?? 0) : state;
 * }
 *
 * counter(0, { type: 'ADD', payload: 5 }); // 5
 * ```
 *
 * @see ActionCreatorType
 *
 * @since 6.0.0
 */

export interface PayloadActionInterface<Payload = unknown> extends Action<string> {
    /**
     * The value that the reducer receives with the action.
     *
     * @remarks
     * It is optional because the same reducer also receives actions without a payload.
     *
     * @since 6.0.0
     */

    payload?: Payload;

    /**
     * Any other property of the action, such as `meta` or `error`.
     *
     * @since 6.0.0
     */

    [extraProps: string]: unknown;
}

/**
 * A function that builds an action of one type.
 *
 * @typeParam Payload - The type of the payload, or `void` for an action without one
 *
 * @remarks
 * A creator for `void` takes no argument and returns a bare action.
 * Any other payload type makes the argument required.
 * The tuple check `[ Payload ] extends [ void ]` keeps a union payload such as `string | number`
 * from splitting into two creator types.
 *
 * @example
 * ```ts
 * const reset: ActionCreatorType = createAction('reset');
 * const add: ActionCreatorType<number> = createAction<number>('add');
 *
 * reset();  // { type: 'reset' }
 * add(5);   // { type: 'add', payload: 5 }
 * ```
 *
 * @see PayloadActionInterface
 *
 * @since 6.0.0
 */

export type ActionCreatorType<Payload = void> = [ Payload ] extends [ void ]
    ? () => Action<string>
    : (payload: Payload) => PayloadActionInterface<Payload>;

/**
 * The shape shared by the root store and every substore.
 *
 * @typeParam State - The state that the store holds
 *
 * @remarks
 * Code that receives a store does not need to know whether it is the root store or a substore,
 * so a component can work on `users.bob` with the same calls it would use on the whole state.
 * Reading goes through signals first, and `select$` exists for RxJS pipelines that need every change in order.
 *
 * @example
 * ```ts
 * const store: StoreInterface<AppState> = inject(NgRedux<AppState>);
 * const count = store.select(state => state.counter);
 *
 * store.dispatch({ type: 'INCREMENT' });
 * count(); // 1
 * ```
 *
 * @since 6.0.0
 */

export interface StoreInterface<State> {
    /**
     * The whole state of this store as a read-only signal.
     *
     * @remarks
     * The signal updates after every dispatch that changes the state.
     * On a substore it holds the branch at the base path.
     *
     * @example
     * ```ts
     * store.state(); // { counter: 0, todos: [] }
     * ```
     *
     * @since 6.0.0
     */

    readonly state: Signal<State>;

    /**
     * Returns the current state without tracking it.
     *
     * @returns The current state of this store
     *
     * @remarks
     * Reading through this method inside a `computed` or an `effect` does not make it rerun on the next change.
     * Use it in event handlers and other code outside a reactive context.
     *
     * @example
     * ```ts
     * store.getState(); // { counter: 0, todos: [] }
     * ```
     *
     * @since 6.0.0
     */

    getState(): State;

    /**
     * Selects one value of the state as a signal.
     *
     * @typeParam Selected - The value that the selector returns
     * @param selector - The function that picks the value
     * @param options - The options passed to the underlying `computed`
     * @returns A read-only signal of the selected value
     *
     * @remarks
     * The signal is a `computed` over {@link StoreInterface.state},
     * so it needs no subscription and no injection context, and it recomputes only when read after a change.
     * Pass `equal` when the selector builds a new object or array, so that equal results do not notify readers.
     *
     * @example
     * ```ts
     * const count = store.select(state => state.counter);
     *
     * count(); // 0
     * ```
     *
     * @see SelectorType
     *
     * @since 6.0.0
     */

    select<Selected>(selector: SelectorType<State, Selected>, options?: CreateComputedOptions<Selected>): Signal<Selected>;

    /**
     * Selects one value of the state as an observable.
     *
     * @typeParam Selected - The value that the selector returns
     * @param selector - The function that picks the value
     * @param options - The `equal` function that decides whether a new value is emitted
     * @returns An observable that emits the current value on subscribe and every distinct change after it
     *
     * @remarks
     * The observable emits synchronously after each dispatch that changes the selected value.
     * Unlike `toObservable(store.select(...))`, it never skips an intermediate value,
     * so choose it for RxJS pipelines that react to each change in order.
     *
     * @example
     * ```ts
     * store.select$(state => state.counter).subscribe(console.log); // logs 0
     * store.dispatch({ type: 'INCREMENT' });                         // logs 1
     * ```
     *
     * @see SelectorType
     *
     * @since 6.0.0
     */

    select$<Selected>(
        selector: SelectorType<State, Selected>, options?: Pick<CreateComputedOptions<Selected>, 'equal'>
    ): Observable<Selected>;

    /**
     * Dispatches an action to the store.
     *
     * @typeParam DispatchedAction - The type of the action
     * @param action - The action to dispatch
     * @returns The same action
     *
     * @remarks
     * On a substore, the action goes to the substore reducer and only changes the branch at the base path.
     *
     * @example
     * ```ts
     * store.dispatch({ type: 'ADD', payload: 5 }); // { type: 'ADD', payload: 5 }
     * ```
     *
     * @since 6.0.0
     */

    dispatch<DispatchedAction extends Action>(action: DispatchedAction): DispatchedAction;

    /**
     * Creates a store that works on one branch of this store.
     *
     * @typeParam SubState - The state of the branch
     * @param basePath - The path of the branch, relative to this store
     * @param reducer - The reducer that handles the actions dispatched through the substore
     * @returns A store for the branch at the base path
     *
     * @remarks
     * The path of a nested substore continues from the path of the store that created it.
     * Actions dispatched through the substore reach only its reducer,
     * while actions dispatched anywhere else never reach it.
     *
     * @example
     * ```ts
     * const bob = store.substore([ 'users', 'bob' ], userReducer);
     *
     * bob.dispatch({ type: 'ADD_LOC', payload: 100 });
     * bob.getState(); // { name: 'Bob Smith', loc: 1123 }
     * ```
     *
     * @see BasePathType
     * @see SubStoreInterface.destroy
     *
     * @since 6.0.0
     */

    substore<SubState>(basePath: BasePathType, reducer: Reducer<SubState>): SubStoreInterface<SubState>;

    /**
     * Returns the whole state as an observable, the interop method that RxJS `from(store)` and Redux tools look for.
     *
     * @returns The same observable as `select$(state => state)`
     *
     * @example
     * ```ts
     * from(store).subscribe(state => console.log(state)); // logs { counter: 0 }
     * ```
     *
     * @since 6.0.0
     */

    '@@observable'(): Observable<State>;
}

/**
 * A store that works on one branch of its parent store.
 *
 * @typeParam State - The state of the branch
 *
 * @since 6.0.0
 */

export interface SubStoreInterface<State> extends StoreInterface<State> {
    /**
     * Releases the substore, so the root store can forget its reducer once no other substore uses it.
     *
     * @remarks
     * `injectSubstore` calls it when its injector is destroyed.
     * A substore made with `store.substore` should call it when it is no longer needed,
     * above all one made with an inline reducer, since each inline reducer is a new function the store would keep.
     * Calling it twice does nothing.
     * Do not dispatch through a destroyed substore.
     *
     * @example
     * ```ts
     * const bob = ngRedux.substore([ 'users', 'bob' ], userReducer);
     * bob.destroy();
     * ```
     *
     * @since 6.0.0
     */

    destroy(): void;
}
