/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Observable } from 'rxjs';
import type { Signal } from '@angular/core';
import type { UnknownAction, Reducer } from 'redux';
import type { AbstractStore } from '../abstract/store.abstract';
import type { PathSelectorType } from '../interfaces/store.interface';
import type { SubstoreFlagType } from '../interfaces/fractal.interface';

/**
 * Imports
 */

import { NgRedux } from '../services/ng-redux.service';
import { LOCAL_REDUCER_KEY, SELECTION_KEY, SUBSTORE_KEY } from '../interfaces/fractal.interface';

/**
 * Resolves the store and the caches that the decorators keep on a decorated instance.
 *
 * @remarks
 * `Select`, `Select$`, and `Dispatch` create one of these around the instance on every access.
 * The constructor makes sure that the substore cache and the selection cache exist on the instance,
 * so the state of the decorators lives on the instance and survives between wrappers.
 * {@link DecoratorFlagComponent.store} returns a substore when the class carries `Substore`
 * and the instance has a truthy `basePath()`, and the root {@link NgRedux} store otherwise.
 *
 * @example
 * ```ts
 * @Substore(userReducer)
 * class UserComponent {
 *     basePath = () => [ 'users', 'u1' ];
 * }
 *
 * const { store } = new DecoratorFlagComponent(new UserComponent());
 * store.getState(); // the state under users, u1
 * ```
 *
 * @see Substore
 * @see SUBSTORE_KEY
 * @see SELECTION_KEY
 *
 * @since 5.0.0
 */

export class DecoratorFlagComponent {
    /**
     * The instance that the decorators were applied to.
     *
     * @remarks
     * Every getter reads from it, and both caches are stored on it.
     *
     * @since 5.0.0
     */

    private readonly decoratedInstance: Record<PropertyKey, unknown>;

    /**
     * The substore cache stored on the instance under {@link SUBSTORE_KEY}.
     *
     * @remarks
     * It holds the last substore and the base path that created it, so an unchanged path reuses the substore.
     *
     * @since 5.0.0
     */

    private readonly substoreCache: SubstoreFlagType;

    /**
     * Wraps a decorated instance and creates its caches when they are missing.
     *
     * @param decoratedInstance - The instance that the decorators were applied to
     *
     * @remarks
     * The caches are created with `??=`, so wrapping the same instance again keeps the existing ones.
     *
     * @example
     * ```ts
     * const flags = new DecoratorFlagComponent(component);
     * component[SELECTION_KEY]; // {}
     * ```
     *
     * @since 5.0.0
     */

    constructor(decoratedInstance: object) {
        this.decoratedInstance = <Record<PropertyKey, unknown>> decoratedInstance;
        this.substoreCache = <SubstoreFlagType> (this.decoratedInstance[SUBSTORE_KEY] ??= {});
        this.decoratedInstance[SELECTION_KEY] ??= {};
    }

    /**
     * The local reducer that `Substore` stored on the class of the instance.
     *
     * @remarks
     * It is `undefined` for a class without the `Substore` decorator.
     *
     * @example
     * ```ts
     * new DecoratorFlagComponent(new UserComponent()).reducer; // userReducer
     * ```
     *
     * @since 5.0.0
     */

    get reducer(): Reducer<unknown, UnknownAction> | undefined {
        return <Reducer<unknown, UnknownAction> | undefined> (<Record<PropertyKey, unknown>> <unknown> this.decoratedInstance.constructor)[LOCAL_REDUCER_KEY];
    }

    /**
     * The path that the `basePath` function of the instance returns.
     *
     * @remarks
     * The function is called on every read, so the path can follow an input of a component.
     * It is called without `this`, so only an arrow function field can read other members of the instance.
     * The getter returns `undefined` when the instance has no `basePath` function.
     *
     * @example
     * ```ts
     * new DecoratorFlagComponent(new UserComponent()).basePath; // [ 'users', 'u1' ]
     * ```
     *
     * @since 5.0.0
     */

    get basePath(): PathSelectorType | undefined {
        const basePathFn = this.decoratedInstance['basePath'];

        return typeof basePathFn === 'function' ? (<() => PathSelectorType | undefined> basePathFn)() : undefined;
    }

    /**
     * The selection cache that maps each decorated property name to its observable or signal.
     *
     * @remarks
     * `Select` and `Select$` store an observable here on the first read of a property, and `SelectSignal` a signal,
     * and each returns the stored one afterward.
     *
     * @example
     * ```ts
     * component.name$;
     * new DecoratorFlagComponent(component).selections; // { name$: Observable }
     * ```
     *
     * @since 5.0.0
     */

    get selections(): { [key: string | symbol]: Observable<unknown> | Signal<unknown> } {
        return <{ [key: string | symbol]: Observable<unknown> | Signal<unknown> }> this.decoratedInstance[SELECTION_KEY];
    }

    /**
     * The store that the decorators of the instance operate on.
     *
     * @remarks
     * With both a `Substore` reducer and a truthy `basePath`, it returns the cached substore for that path,
     * creating a new one when the path changed.
     * Otherwise it returns the root store from {@link NgRedux.store}, which throws when no {@link NgRedux} exists yet.
     *
     * @example
     * ```ts
     * new DecoratorFlagComponent(plainInstance).store === NgRedux.store; // true
     * ```
     *
     * @since 5.0.0
     */

    get store(): AbstractStore<unknown> {
        const { reducer, basePath } = this;

        if (reducer && basePath) {
            return this.factorySubstoreInstance(basePath, reducer);
        }

        return NgRedux.store;
    }

    /**
     * Returns the substore for a base path, creating and caching it when the path changed.
     *
     * @param basePath - The path of the substore in the root state
     * @param reducer - The local reducer of the substore
     * @returns The cached or new substore
     *
     * @remarks
     * Paths are compared by their string form, so `[ 'users', 'u1' ]` and `[ 'users,u1' ]` count as the same path.
     * A new substore comes from `configureSubStore` on the root store.
     *
     * @since 5.0.0
     */

    private factorySubstoreInstance(basePath: PathSelectorType, reducer: Reducer<unknown, UnknownAction>): AbstractStore<unknown> {
        const cachePath = String(basePath);

        if (!this.substoreCache.instance || this.substoreCache.cachePath !== cachePath) {
            this.substoreCache.cachePath = cachePath;
            this.substoreCache.instance = NgRedux.store.configureSubStore(basePath, reducer);
        }

        return this.substoreCache.instance;
    }
}
