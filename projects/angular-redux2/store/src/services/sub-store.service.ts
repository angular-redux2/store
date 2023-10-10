/**
 * Import third-party types
 */

import { Subscription } from 'rxjs';
import { AnyAction, Reducer } from 'redux';

/**
 * angular-redux2
 */

import { ReducerService } from './reducer.service';
import { get } from '../components/object.component';
import { AbstractStore } from '../abstract/store.abstract';
import { ACTION_KEY } from '../interfaces/fractal.interface';

/**
 * angular-redux2 types
 */

import { NgRedux } from './ng-redux.service';
import { PathSelector } from '../interfaces/store.interface';

/**
 * A class representing a substore in the NgRedux store.
 *
 * @template State - The state shape of the substore.
 * @class
 */

export class SubStoreService<State> extends AbstractStore<State> {

    /**
     * An RxJS Subscription object representing the subscription to the store state changes.
     * @private
     * @type {Subscription}
     */

    private subscription: Subscription;

    /**
     * The hash value for this reducer.
     *
     * @private
     * @readonly
     * @type {number}
     */

    private readonly hashReducer: number;

    /**
     * An instance of the `ReducerService` used to register and replace reducers for the store.
     * @type {ReducerService}
     * @private
     */

    private readonly reducerService: ReducerService;

    /**
     * Constructs a new SubStoreService instance.
     *
     * @param {NgRedux<any>} rootStore - The NgRedux store.
     * @param {PathSelector} basePath - The base path of the substore.
     * @param {Reducer<State>} localReducer - The reducer of the substore.
     */

    constructor(
        private rootStore: NgRedux<any>,
        private basePath: PathSelector,
        private localReducer: Reducer<State>
    ) {
        super();
        this.reducerService = ReducerService.getInstance();

        this.hashReducer = this.reducerService.hashSignature(localReducer.toString());
        this.reducerService.registerSubReducer(this.hashReducer, localReducer);
    }

    /**
     * Configures a sub-store with a specified base path and local reducer.
     * Carves off a 'subStore' or 'fractal' store from this one.
     *
     * The returned object is itself an observable store, however, any
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
     * @template SubState The type of the sub-store state.
     * @param {PathSelector} basePath The base path of the sub-store.
     * @param {Reducer<SubState>} localReducer The local reducer of the sub-store.
     * @returns {SubStoreService<SubState>} The sub-store service instance.
     */

    configureSubStore<SubState>(basePath: PathSelector, localReducer: Reducer<SubState>): SubStoreService<SubState> {
        const path = [ ...this.basePath, ...basePath ];

        return new SubStoreService<SubState>(this.rootStore, path, localReducer);
    }

    /**
     * Returns the current state of the substore.
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
     * @returns {State} The current state of the substore.
     */

    getState(): State {
        return get(this.rootStore.getState(), this.basePath);
    }

    /**
     * Sets the base path for the store, and subscribes to updates.
     *
     * @example
     * ```typescript
     *    ngOnChanges() {
     *         if(this.subStore)
     *             this.subStore.setBasePath([ 'users', this.userId ]);
     *     }
     * ```
     *
     * @param path - The path selector.
     * @returns void.
     */

    setBasePath(path: PathSelector): void {
        if (this.basePath === path && this.subscription) {
            return;
        }

        this.basePath = path;

        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        this.subscription = this.rootStore.select<State>(this.basePath).subscribe((value: any) => {
            this._store$.next(value);
        });
    }

    /**
     * Dispatches an action object with an additional metadata object containing the hash and path of the sub-reducer.
     *
     * @template Action - The type of action to dispatch.
     * @param {Action} action - The action object to dispatch.
     * @returns {Action} The dispatched action object.
     */

    dispatch<Action extends AnyAction>(action: Action): Action {
        return this.rootStore.dispatch(
            Object.assign({}, action, {
                [ACTION_KEY]: {
                    hash: this.hashReducer,
                    path: this.basePath
                },
            })
        );
    }

    /**
     * Subscribe to changes in the substore's state.
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
     * @param {() => void} listener - The callback function to be executed on state changes.
     * @returns {() => void} - The unsubscribe function to remove the subscription.
     */

    subscribe(listener: () => void): (() => void) {
        const subscription = this.select().subscribe(listener);

        return () => subscription.unsubscribe();
    }

    /**
     * Replaces the current local reducer with a new one.
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
     * @param {Reducer<State>} nextLocalReducer - The new local reducer to replace the current one.
     * @returns {void}
     */

    replaceReducer(nextLocalReducer: Reducer<State>) {
        return this.reducerService.replaceSubReducer(this.hashReducer, nextLocalReducer);
    }
}
