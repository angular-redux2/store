/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { PathSelectorType } from './store.interface';
import type { AbstractStore } from '../abstract/store.abstract';

/**
 * The action property that routes a substore dispatch to its local reducer.
 *
 * @remarks
 * {@link SubStoreService} copies every action it dispatches and stores the hash of its local reducer
 * and its base path under this key.
 * The root reducer that {@link ReducerService} composes reads the key back,
 * runs the matching local reducer against the state at that path, and writes the result into the root state.
 * An action without this key goes straight to the root reducer.
 *
 * @example
 * ```ts
 * subStore.dispatch({ type: 'RENAME' });
 * // the root store receives { type: 'RENAME', '&_ACTION': { hash: 1043, path: [ 'users', 'u1' ] } }
 * ```
 *
 * @see SubStoreService
 * @see ReducerService
 *
 * @since 5.0.0
 */

export const ACTION_KEY = '&_ACTION';

/**
 * The constructor property that holds the local reducer set by the `Substore` decorator.
 *
 * @remarks
 * {@link Substore} writes the reducer onto the decorated class constructor under this key.
 * {@link DecoratorFlagComponent} reads it back, and when the instance also provides a `basePath()` result,
 * the `Select`, `Select$`, and `Dispatch` decorators on that instance operate on a substore instead of the root store.
 *
 * @example
 * ```ts
 * @Substore(userReducer)
 * class UserComponent {}
 *
 * (UserComponent as any)[LOCAL_REDUCER_KEY]; // userReducer
 * ```
 *
 * @see Substore
 * @see DecoratorFlagComponent
 *
 * @since 5.0.0
 */

export const LOCAL_REDUCER_KEY = '&_SUBSTORE_LOCAL_REDUCER';

/**
 * The instance property that caches the substore created for a decorated instance.
 *
 * @remarks
 * {@link DecoratorFlagComponent} keeps a {@link SubstoreFlagType} on the decorated instance under this key,
 * so the instance reuses one substore for as long as its base path stays the same.
 * A different base path replaces the cached substore with a new one.
 *
 * @example
 * ```ts
 * new DecoratorFlagComponent(instance);
 * instance[SUBSTORE_KEY]; // {} until the first substore is created
 * ```
 *
 * @see SubstoreFlagType
 * @see DecoratorFlagComponent
 *
 * @since 5.0.0
 */

export const SUBSTORE_KEY = '&_SUBSTORE';

/**
 * The instance property that caches the observables created by the `Select` and `Select$` decorators.
 *
 * @remarks
 * The selection cache maps each decorated property name to the observable that the first read created,
 * so every later read of that property returns the same observable.
 * The key only has to stay unique on the instance, and its value carries no other meaning.
 *
 * @example
 * ```ts
 * instance.name$;          // creates and caches the observable
 * instance[SELECTION_KEY]; // { name$: Observable }
 * ```
 *
 * @see Select
 * @see DecoratorFlagComponent
 *
 * @since 5.0.0
 */

export const SELECTION_KEY = '&_SELECTION';

/**
 * The cached substore of a decorated instance and the base path that created it.
 *
 * @remarks
 * {@link DecoratorFlagComponent} compares `cachePath` with the current base path on every store lookup
 * and creates a new substore when they differ.
 * The object starts empty, so both fields are unset until the first substore is created.
 *
 * @example
 * ```ts
 * const flag: SubstoreFlagType = { instance: subStore, cachePath: 'users,u1' };
 * ```
 *
 * @see SUBSTORE_KEY
 *
 * @since 5.0.0
 */

export type SubstoreFlagType = {
    /**
     * The substore that the decorated instance currently uses.
     *
     * @example
     * ```ts
     * flag.instance.getState(); // the state under the cached base path
     * ```
     *
     * @since 5.0.0
     */

    instance: AbstractStore<unknown>;

    /**
     * The base path that created `instance`, joined into a string with commas.
     *
     * @example
     * ```ts
     * flag.cachePath; // 'users,u1' for the base path [ 'users', 'u1' ]
     * ```
     *
     * @since 5.0.0
     */

    cachePath: string;
}

/**
 * The value that a substore dispatch carries under {@link ACTION_KEY}.
 *
 * @remarks
 * {@link SubStoreService} writes it on every action it dispatches,
 * and the root reducer reads it back to find the local reducer and the branch it owns.
 *
 * @example
 * ```ts
 * const route: SubstoreRouteType = { hash: 1234, path: [ 'users', 'u1' ] };
 * ```
 *
 * @see ACTION_KEY
 *
 * @since 6.0.0
 */

export type SubstoreRouteType = {
    /**
     * The hash of the local reducer, which keys it in the reducer registry.
     *
     * @since 6.0.0
     */

    hash: number;

    /**
     * The base path of the substore in the root state.
     *
     * @since 6.0.0
     */

    path: PathSelectorType;
};
