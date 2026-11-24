/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Signal } from '@angular/core';
import type { NgRedux } from '@services/ng-redux.service';
import type { Action, Reducer, Unsubscribe } from 'redux';
import type { BasePathType, PathType, SubStoreInterface } from '@interfaces/store.interface';
import type { SubstoreRouteInterface } from '@services/interfaces/sub-store-service.interface';

/**
 * Imports
 */

import { get } from '@components/object.component';
import { computed, untracked } from '@angular/core';
import { AbstractStore } from '@abstract/store.abstract';
import { SUBSTORE_ROUTE } from '@constants/sub-store.constant';

/**
 * Turns a base path into a function, so a fixed path and a computed path read the same way.
 *
 * @param basePath - The fixed or computed path
 * @returns A function that returns the path
 *
 * @remarks
 * A computed path stays as it is, so the signals it reads keep driving the substore.
 *
 * @example
 * ```ts
 * pathOf([ 'users' ])();         // [ 'users' ]
 * pathOf(() => [ 'users' ])();   // [ 'users' ]
 * ```
 *
 * @since 6.0.0
 */

export function pathOf(basePath: BasePathType): () => PathType {
    return typeof basePath === 'function' ? basePath : (): PathType => basePath;
}

/**
 * A store that works on one branch of the root state with its own reducer.
 *
 * @typeParam State - The type of the branch
 *
 * @remarks
 * Its state is a `computed` over the root state at the base path, so it needs no subscription and nothing to clean up.
 * Each action that it dispatches carries a route with its reducer id and the current path,
 * so the root reducer runs only the substore reducer on that branch.
 * Create it through {@link NgRedux.substore} or `injectSubstore`, never directly.
 *
 * @example
 * ```ts
 * const bob = ngRedux.substore([ 'users', 'bob' ], userReducer);
 *
 * bob.dispatch({ type: 'ADD_LOC', payload: 100 });
 * bob.getState(); // { name: 'Bob Smith', loc: 1123 }
 * ```
 *
 * @since 6.0.0
 */

export class SubStore<State> extends AbstractStore<State> implements SubStoreInterface<State> {
    /**
     * The branch at the base path as a read-only signal.
     *
     * @remarks
     * It follows a computed base path, so a new path moves the signal to the new branch.
     *
     * @example
     * ```ts
     * bob.state(); // { name: 'Bob Smith', loc: 1023 }
     * ```
     *
     * @since 6.0.0
     */

    readonly state: Signal<State>;

    /**
     * Returns the current base path.
     *
     * @since 6.0.0
     */

    private readonly path: () => PathType;

    /**
     * Whether {@link SubStore.destroy} already ran.
     *
     * @since 6.0.0
     */

    private destroyed = false;

    /**
     * Creates a substore on the root store.
     *
     * @param root - The root store
     * @param basePath - The path of the branch in the root state
     * @param id - The id of the substore reducer in the root store
     * @param release - Releases the substore reducer in the root store
     *
     * @remarks
     * {@link NgRedux.substore} registers the reducer and passes its id, so equal reducers share one id.
     *
     * @since 6.0.0
     */

    constructor(
        private readonly root: Pick<NgRedux<unknown>, 'state' | 'redux' | 'dispatch' | 'substore'>,
        basePath: BasePathType,
        private readonly id: number,
        private readonly release: () => void
    ) {
        super();
        this.path = pathOf(basePath);
        this.state = computed(() => <State> get(root.state(), this.path()));
    }

    /**
     * Dispatches an action to the substore reducer.
     *
     * @typeParam DispatchedAction - The type of the action
     * @param action - The action to dispatch
     * @returns The same action, or for a thunk, what the root store returns
     *
     * @remarks
     * The root store receives a copy of the action with the route added, so the original action stays unchanged.
     * The route holds the base path at the moment of the dispatch.
     * A thunk or any other non-object action goes to the root store unchanged, for its middleware to handle,
     * because a route can only travel on a plain action.
     *
     * @example
     * ```ts
     * bob.dispatch({ type: 'ADD_LOC', payload: 100 }); // { type: 'ADD_LOC', payload: 100 }
     * ```
     *
     * @since 6.0.0
     */

    dispatch<DispatchedAction extends Action>(action: DispatchedAction): DispatchedAction {
        if (typeof action !== 'object' || action === null) return this.root.dispatch(action);

        const route: SubstoreRouteInterface = { id: this.id, path: untracked(this.path) };
        this.root.dispatch({ ...action, [SUBSTORE_ROUTE]: route });

        return action;
    }

    /**
     * Creates a substore below this one.
     *
     * @typeParam SubState - The state of the nested branch
     * @param basePath - The path of the nested branch, relative to this substore
     * @param reducer - The reducer that handles the actions dispatched through the nested substore
     * @returns A store for the nested branch
     *
     * @remarks
     * The nested path continues from the current path of this substore, so it follows a move of either one.
     *
     * @example
     * ```ts
     * bob.substore([ 'address' ], addressReducer).getState(); // { city: 'Paris' }
     * ```
     *
     * @since 6.0.0
     */

    substore<SubState>(basePath: BasePathType, reducer: Reducer<SubState>): SubStoreInterface<SubState> {
        const below = pathOf(basePath);

        return this.root.substore(() => [ ...this.path(), ...below() ], reducer);
    }

    /**
     * Releases the substore, so the root store forgets its reducer once no other substore uses it.
     *
     * @remarks
     * Calling it twice does nothing.
     * A nested substore has its own `destroy`.
     *
     * @example
     * ```ts
     * bob.destroy();
     * ```
     *
     * @since 6.0.0
     */

    destroy(): void {
        if (this.destroyed) return;

        this.destroyed = true;
        this.release();
    }

    /**
     * Registers a listener that runs after every dispatch to the root store.
     *
     * @param listener - The function to run
     * @returns A function that removes the listener
     *
     * @remarks
     * It listens on the root Redux store, and `select$` drops the values that did not change.
     *
     * @since 6.0.0
     */

    protected listen(listener: () => void): Unsubscribe {
        return this.root.redux.subscribe(listener);
    }
}
