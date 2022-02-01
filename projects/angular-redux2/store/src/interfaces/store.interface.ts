/**
 * Imports third-party libraries
 */

import { Observable } from 'rxjs';
import { AnyAction, Reducer, Store } from 'redux';

/**
 * select from store by array of path.
 *
 * ```typescript
 *  @Select(['foo', 'name']) readonly name$: Observable<string>;
 * ```
 */

export type PathSelector = Array<string | number>;

/**
 * select from store by `string` | `number` | `symbol`.
 *
 * ```typescript
 *  @Select('name') readonly name$: Observable<string>;
 * ```
 */

export type PropertySelector = string | number | symbol;

/**
 * select from store by functional conditions.
 *
 * ```typescript
 *  @Select(store => store.name || 'new name') readonly name$: Observable<string>;
 * ```
 */

export type FunctionSelector<RootState, S> = ((s: RootState) => S);

/**
 * combine all oder type `PropertySelector` | `PathSelector` | `FunctionSelector<RootState, S>`
 */

export type Selector<RootState, S> = PropertySelector | PathSelector | FunctionSelector<RootState, S>;

/**
 * Type of function used to determine if this selector has changed.
 * Custom equality checker that can be used with `.select` and `@Select`.
 *
 * ```typescript
 * const customCompare: Comparator = (x: any, y: any) => {
 *     return x.id === y.id
 * }
 *
 * @Select(selector, customCompare)
 * ```
 */

export type Comparator = (state: any, newState: any) => boolean;

/**
 *  Type of transformer - function takes the store observable as an input and returns a derived observable from it.
 */

export type Transformer<RootState, FragmentStore> = (store$: Observable<RootState>, scope: any) => Observable<FragmentStore>;

/**
 * This interface represents the glue that connects the
 * subscription-oriented "Redux Store" with the rxjs Observable-oriented
 * Angular component world.
 *
 * `Augments the basic Redux store interface with methods to enable selection and factorization.`
 */

export interface StoreInterface<StateType> extends Store<StateType> {

    /**
     * Select a slice of state to expose as an observable.
     *
     * @param selector - key or function to select a part of the state
     * @param comparator - comparison function called to test if an item is distinct from the previous item in the source.
     *
     * @return An Observable that emits items from the source Observable with distinct values.
     */

    select<SelectedType>(selector: Selector<StateType, SelectedType>, comparator?: Comparator): Observable<SelectedType>;

    /**
     * Carves off a `subStore` or `fractal` store from this one.
     *
     * The returned object is itself an observable store, however any
     * selections, dispatches, or invocations of localReducer will be
     * specific to that sub-store and will not know about the parent
     * ObservableStore from which it was created.
     *
     * This is handy for encapsulating component or module state while
     * still benefiting from time-travel, etc.
     *
     * @param basePath - select part of store
     * @param localReducer - reducer of the same store
     *
     * @return StoreInterface<SubState>
     */

    configureSubStore<SubState>(basePath: PathSelector, localReducer: Reducer<SubState, AnyAction>): StoreInterface<SubState>;
}
