/**
 * angular-redux2
 */

import { NgRedux } from '../services/ng-redux.service';
import { LOCAL_REDUCER_KEY, SELECTION_KEY, SUBSTORE_KEY } from '../interfaces/fractal.interface';

/**
 * angular-redux2 types
 */

import { AnyAction, Reducer } from 'redux';
import { PathSelector } from '../interfaces/store.interface';
import { SubstoreFlag } from '../interfaces/fractal.interface';
import { AbstractStore } from '../abstract/store.abstract';

/**
 * Class for managing the flag of a decorator instance.
 * This class provides methods to get instance properties and state,
 * and to instantiate a substore if the decorated component is a subcomponent.
 */
export class DecoratorFlagComponent {
    /**
     * The decorated instance provided to this DecoratorFlagComponent instance.
     * @readonly
     * @type {any}
     */

    private readonly decoratedInstance: any;

    /**
     * A cache for Substore flags.
     *
     * @private
     * @readonly
     * @type {SubstoreFlag}
     */

    private readonly substoreCache: SubstoreFlag;

    /**
     * Constructs a new instance of the DecoratorFlagComponent class.
     * @param {any} decoratedInstance - The decorated instance.
     */

    constructor(decoratedInstance: any) {
        this.decoratedInstance = decoratedInstance;
        this.substoreCache = this.decoratedInstance[SUBSTORE_KEY] ??= {};
        this.decoratedInstance[SELECTION_KEY] ??= {};
    }

    /**
     * Gets the reducer associated with the decorated instance.
     * @readonly
     * @type {Reducer<any, AnyAction> | undefined}
     */

    get reducer(): Reducer<any, AnyAction> | undefined {
        return this.decoratedInstance.constructor[LOCAL_REDUCER_KEY];
    }

    /**
     * Gets the base path selector associated with the decorated instance.
     * @readonly
     * @type {PathSelector | undefined}
     */

    get basePath(): PathSelector | undefined {
        const basePathFn = this.decoratedInstance.basePath;

        return typeof basePathFn === 'function' ? basePathFn() : undefined;
    }

    /**
     * Gets the selection object associated with the decorated instance.
     * @readonly
     * @type {{ [key: string | symbol]: any }}
     */

    get selections(): { [key: string | symbol]: any } {
        return this.getInstanceFlag(SELECTION_KEY);
    }

    /**
     * Gets the NgRedux store instance associated with the decorated instance.
     * @readonly
     * @type {AbstractStore<any>}
     */

    get store(): AbstractStore<any> {
        const { reducer, basePath } = this;

        if (!!reducer && !!basePath) {
            return this.factorySubstoreInstance(basePath, reducer);
        }

        return NgRedux.store;
    }

    /**
     * Gets the instance flag associated with the decorated instance.
     * @private
     * @param {string} flagName - The name of the instance flag.
     * @returns {any} - The instance flag object.
     */

    private getInstanceFlag(flagName: string): any {
        return this.decoratedInstance[flagName];
    }

    /**
     * Factory function to create and return a substore instance associated with the decorated instance.
     * @private
     * @param {PathSelector} basePath - The base path selector.
     * @param {Reducer<any, AnyAction>} reducer - The reducer function.
     * @returns {NgRedux<any>} - The substore instance.
     */

    private factorySubstoreInstance(basePath: PathSelector, reducer: Reducer<any, AnyAction>): AbstractStore<any> {
        const cachePath = (basePath || []).toString();

        if (!this.substoreCache.instance || this.substoreCache.cachePath !== cachePath) {
            this.substoreCache.cachePath = cachePath;
            this.substoreCache.instance = NgRedux.store.configureSubStore(basePath, reducer);
        }

        return this.substoreCache.instance;
    }
}
