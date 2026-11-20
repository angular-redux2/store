/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Observable } from 'rxjs';
import type { NgRedux } from './ng-redux.service';
import type { UnknownAction, Reducer } from 'redux';
import type { Signal, WritableSignal } from '@angular/core';
import type { SubstoreRouteType } from '../interfaces/fractal.interface';
import type { ComparatorType, PathSelectorType, SelectorType } from '../interfaces/store.interface';

/**
 * Imports
 */

import { computed, signal } from '@angular/core';
import { ReducerService } from './reducer.service';
import { get } from '../components/object.component';
import { AbstractStore } from '../abstract/store.abstract';
import { resolver } from '../components/selectors.component';
import { ACTION_KEY } from '../interfaces/fractal.interface';
import { BehaviorSubject, distinctUntilChanged, map, switchMap } from 'rxjs';

/**
 * A store scoped to one branch of the root state, with its own local reducer.
 *
 * @typeParam State - The type of the state at the base path
 *
 * @remarks
 * A substore reads and writes the root state at its base path.
 * Its actions carry the hash of its local reducer and its path under {@link ACTION_KEY},
 * so the root reducer runs only that local reducer against that branch.
 * Use it to keep the state of a component or module apart from the rest of the store,
 * while keeping one Redux store for DevTools and time travel.
 *
 * The local reducer is registered by a hash of its source text.
 * Two reducers with identical source share one registration, and the first one registered wins.
 *
 * Selections follow the root store at the base path, and subscribe to it only while they have subscribers.
 *
 * @example
 * ```ts
 * const subStore = ngRedux.configureSubStore<User>([ 'users', 'u1' ], userReducer);
 *
 * subStore.setBasePath([ 'users', 'u1' ]); // starts the selection feed
 * subStore.getState();                     // { name: 'Ada' }
 * subStore.select('name');                 // emits 'Ada'
 * subStore.dispatch({ type: 'RENAME', name: 'Grace' });
 * ```
 *
 * @see NgRedux.configureSubStore
 * @see Substore
 *
 * @since 5.0.0
 */

export class SubStoreService<State> extends AbstractStore<State> {

    /**
     * The current base path, which selections follow when {@link SubStoreService.setBasePath} moves the substore.
     *
     * @since 6.0.0
     */

    private readonly basePath$: BehaviorSubject<PathSelectorType>;

    /**
     * The current base path, which signal selections follow when {@link SubStoreService.setBasePath} moves the
     * substore.
     *
     * @since 6.0.0
     */

    private readonly basePathSignal: WritableSignal<PathSelectorType>;

    /**
     * The hash of the source text of the local reducer.
     *
     * @remarks
     * Every dispatched action carries it, so the root reducer can find the local reducer in the registry.
     *
     * @since 5.0.0
     */

    private readonly hashReducer: number;

    /**
     * The shared reducer registry.
     *
     * @remarks
     * The substore registers its local reducer here and replaces it through the registry later.
     *
     * @since 5.0.0
     */

    private readonly reducerService: ReducerService;

    /**
     * Creates a substore and registers its local reducer.
     *
     * @param rootStore - The root store that holds the state
     * @param basePath - The path of the substore in the root state
     * @param localReducer - The reducer that handles the actions of this substore
     *
     * @remarks
     * Prefer {@link NgRedux.configureSubStore}, which passes the root store for you.
     * The constructor does not subscribe to the root store; each selection subscribes while it is in use.
     *
     * @example
     * ```ts
     * const subStore = new SubStoreService<User>(ngRedux, [ 'users', 'u1' ], userReducer);
     * ```
     *
     * @since 5.0.0
     */

    constructor(
        private rootStore: NgRedux<unknown>,
        private basePath: PathSelectorType,
        private localReducer: Reducer<State>
    ) {
        super();
        this.basePath$ = new BehaviorSubject(basePath);
        this.basePathSignal = signal(basePath);
        this.reducerService = ReducerService.getInstance();

        this.hashReducer = this.reducerService.hashSignature(localReducer.toString());
        this.reducerService.registerSubReducer(this.hashReducer, localReducer);
    }

    /**
     * Creates a substore nested below this one.
     *
     * @typeParam SubState - The type of the state at the nested path
     * @param basePath - The path of the nested substore, relative to this substore
     * @param localReducer - The reducer that handles the actions of the nested substore
     * @returns A substore whose path is this base path followed by `basePath`
     *
     * @remarks
     * The nested substore talks to the root store directly, so it does not depend on this substore afterward.
     *
     * @example
     * ```ts
     * const user = ngRedux.configureSubStore([ 'users', 'u1' ], userReducer);
     * const address = user.configureSubStore([ 'address' ], addressReducer);
     *
     * address.getState(); // the state at users, u1, address
     * ```
     *
     * @since 5.0.0
     */

    configureSubStore<SubState>(basePath: PathSelectorType, localReducer: Reducer<SubState>): SubStoreService<SubState> {
        const path = [ ...this.basePath, ...basePath ];

        return new SubStoreService<SubState>(this.rootStore, path, localReducer);
    }

    /**
     * Returns the current state at the base path.
     *
     * @returns The branch of the root state at the base path, or `undefined` when the path does not exist
     *
     * @remarks
     * It reads the root state on every call.
     *
     * @example
     * ```ts
     * subStore.getState(); // { name: 'Ada' }
     * ```
     *
     * @since 5.0.0
     */

    getState(): State {
        return <State> get(this.rootStore.getState(), this.basePath);
    }

    /**
     * Selects a slice of the state at the base path.
     *
     * @typeParam SelectedType - The type of the selected value
     * @param selector - The property, path, or function that picks the value, relative to the base path
     * @param comparator - The equality check that decides whether a new value is emitted
     * @returns An observable of the selected value that follows the base path when it moves
     *
     * @remarks
     * The selection subscribes to the root store only while it has subscribers, so a substore holds no
     * subscription of its own.
     *
     * @since 6.0.0
     */

    override select<SelectedType>(
        selector?: SelectorType<State, SelectedType>,
        comparator?: ComparatorType<SelectedType>
    ): Observable<SelectedType> {
        return this.basePath$.pipe(
            switchMap(path => this.rootStore.select<State>(path)),
            map(resolver(selector)),
            distinctUntilChanged(comparator)
        );
    }

    /**
     * Selects a slice of the state at the base path as a signal.
     *
     * @typeParam SelectedType - The type of the selected value
     * @param selector - The property, path, or function that picks the value, relative to the base path
     * @param comparator - The equality check that decides whether a new value is a change
     * @returns A read-only signal of the selected value that follows the base path when it moves
     *
     * @remarks
     * The signal is computed from the root state and the base path, so it holds no subscription.
     * It reads `undefined` until the root store is configured.
     *
     * @example
     * ```ts
     * const name = subStore.selectSignal<string>('name');
     * name(); // 'Ada'
     * ```
     *
     * @since 6.0.0
     */

    override selectSignal<SelectedType>(
        selector?: SelectorType<State, SelectedType>,
        comparator?: ComparatorType<SelectedType>
    ): Signal<SelectedType> {
        const resolve = resolver(selector);
        const rootState = this.rootStore.selectSignal();

        return computed(() => {
            const state = rootState();

            return state === undefined ? <SelectedType> undefined : resolve(<State> get(state, this.basePathSignal()));
        }, { equal: comparator });
    }

    /**
     * Moves the substore to another path.
     *
     * @param path - The new path of the substore in the root state
     *
     * @remarks
     * Selections already made switch to the new branch, and later actions carry the new path, so the local reducer
     * writes there. Calling it with the array instance already in use does nothing.
     *
     * @example
     * ```ts
     * ngOnChanges() {
     *     this.subStore.setBasePath([ 'users', this.userId ]);
     * }
     * ```
     *
     * @since 5.0.0
     */

    setBasePath(path: PathSelectorType): void {
        if (this.basePath === path) {
            return;
        }

        this.basePath = path;
        this.basePath$.next(path);
        this.basePathSignal.set(path);
    }

    /**
     * Dispatches an action to the local reducer of this substore.
     *
     * @typeParam Action - The type of the dispatched action
     * @param action - The action to dispatch, which stays unchanged
     * @returns The action that the root store dispatched, which includes the routing key
     *
     * @remarks
     * The action is copied with the reducer hash and the base path added under {@link ACTION_KEY},
     * and the copy goes to the root store.
     * When the local reducer changes its branch, the root reducer does not run for that action.
     *
     * @example
     * ```ts
     * subStore.dispatch({ type: 'RENAME' }); // { type: 'RENAME', '&_ACTION': { hash, path: [ 'users', 'u1' ] } }
     * ```
     *
     * @since 5.0.0
     */

    dispatch<Action extends UnknownAction>(action: Action): Action {
        return this.rootStore.dispatch(
            Object.assign({}, action, {
                [ACTION_KEY]: <SubstoreRouteType> {
                    hash: this.hashReducer,
                    path: this.basePath
                }
            })
        );
    }

    /**
     * Adds a listener that runs whenever the state at the base path changes.
     *
     * @param listener - The callback to run
     * @returns A function that removes the listener
     *
     * @remarks
     * The listener follows the selection feed of the substore,
     * so it runs right away with the current branch and then on every change of that branch.
     *
     * @example
     * ```ts
     * const unsubscribe = subStore.subscribe(() => console.log(subStore.getState()));
     * unsubscribe(); // the listener no longer runs
     * ```
     *
     * @since 5.0.0
     */

    subscribe(listener: () => void): (() => void) {
        const subscription = this.select().subscribe(listener);

        return () => subscription.unsubscribe();
    }

    /**
     * Replaces the local reducer of this substore.
     *
     * @param nextLocalReducer - The reducer to use from the next action on
     *
     * @remarks
     * The registry entry is keyed by the hash of the original reducer,
     * so every substore that registered a reducer with the same source text picks up the replacement.
     * The hash on later actions stays the same.
     *
     * @example
     * ```ts
     * subStore.replaceReducer(nextUserReducer);
     * subStore.dispatch({ type: 'RENAME' }); // handled by nextUserReducer
     * ```
     *
     * @since 5.0.0
     */

    replaceReducer(nextLocalReducer: Reducer<State>): void {
        return this.reducerService.replaceSubReducer(this.hashReducer, nextLocalReducer);
    }
}
