/**
 * Imports third-party libraries
 */

import { AnyAction, Reducer } from 'redux';
import { distinctUntilChanged, Observable } from 'rxjs';

/**
 * Import services
 */

import { NgRedux } from '../services/ng-redux.service';

/**
 * Import interfaces
 */

import { LOCAL_REDUCER_KEY, SELECTION_KEY, SUBSTORE_KEY } from '../interfaces/fractal.interface';
import { Comparator, PathSelector, Selector, StoreInterface } from '../interfaces/store.interface';

/**
 * Mange logic of cache substore in decorator instance.
 */

class SubstoreCacheMange {

    /**
     * Get substore instance.
     *
     * @param decoratedInstance - component class instance.
     * @param basePath - substore base path.
     * @param reducer - substore reducer.
     */

    static getSubstoreInstance(decoratedInstance: any, basePath: PathSelector, reducer: Reducer<any, AnyAction>): StoreInterface<any> {
        decoratedInstance[SUBSTORE_KEY] ??= {};

        if (decoratedInstance[SUBSTORE_KEY].basePath !== (basePath || []).toString()) {
            this.setBasePath(decoratedInstance, basePath);
            this.setSubstoreInstance(decoratedInstance, basePath, reducer);

            decoratedInstance[SELECTION_KEY] = {};
        }

        return decoratedInstance[SUBSTORE_KEY].instance;
    }

    /**
     * Get selection from caching.
     *
     * @param decoratedInstance - component class instance.
     */

    static getSelectionMap(decoratedInstance: any): { [key: string | symbol]: any } {
        decoratedInstance[SELECTION_KEY] ??= {};

        return decoratedInstance[SELECTION_KEY];
    }

    /**
     * save base path in the class instance to detect changes in the future.
     *
     * @param decoratedInstance - component class instance.
     * @param basePath - base path to save.
     */

    private static setBasePath(decoratedInstance: any, basePath: PathSelector): void {
        decoratedInstance[SUBSTORE_KEY].basePath = (basePath || []).toString();
    }

    /**
     * Save substore instance in component instance.
     *
     * @param decoratedInstance - component class instance.
     * @param basePath - substore base path.
     * @param reducer - substore reducer.
     * @private
     */

    private static setSubstoreInstance(decoratedInstance: any, basePath: PathSelector, reducer: Reducer<any, AnyAction>): void {
        decoratedInstance[SUBSTORE_KEY].instance = NgRedux.store.configureSubStore(basePath, reducer);
    }
}

/**
 * Get base store or substore (that save in pre-class instance).
 *
 * @param decoratedInstance - decorator instance.
 */

export function getBaseStore(decoratedInstance: any): StoreInterface<any> {
    const reducer = decoratedInstance.constructor[LOCAL_REDUCER_KEY];

    // This is not decorated with `@WithSubStore`. Return the root store.
    if (reducer) {
        // Dynamic base path support:
        const basePath = decoratedInstance.getBasePath();

        if (basePath) {
            return SubstoreCacheMange.getSubstoreInstance(decoratedInstance, basePath, reducer);
        }
    }

    return NgRedux.store;
}

/**
 * @hidden
 * Call store (root or substore) select with path.
 *
 * @param decoratedInstance - decorator instance
 * @param key - key | symbol are use in select decorator (foo$) @Select(['foo','bar']) `foo$`: Observable<string>.
 * @param selector - select path in decorator.
 * @param comparator - Function used to determine if this selector has changed.
 * @param transformer - transformer that operates on observables instead of values.
 */

export function getInstanceSelection<T>(
    decoratedInstance: any,
    key: string | symbol,
    selector: Selector<any, T>,
    transformer?: Transformer<any, T>,
    comparator?: Comparator
): Observable<any> | undefined {
    const store = getBaseStore(decoratedInstance);
    const selections = SubstoreCacheMange.getSelectionMap(decoratedInstance);

    if (selections[key]) {
        return selections[key];
    }

    if (store) {
        if (transformer) {
            selections[key] = store.select(selector).pipe(
                (obs$) => (transformer as any)(obs$, decoratedInstance),
                distinctUntilChanged(comparator)
            );
        } else {
            selections[key] = store.select(selector, comparator);
        }

        return selections[key];
    }

    return undefined;
}
