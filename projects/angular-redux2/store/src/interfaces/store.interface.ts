/**
 * Import third-party types
 */

import type { Observable } from 'rxjs';

/**
 * An array of strings or numbers used to select a path in a state object.
 *
 * @example
 * ```typescript
 * // Select the 'name' property from an object in the store using a PathSelector array.
 *  @Select(['foo', 'name']) readonly name$: Observable<string>;
 * ```
 *
 * @typedef {Array<string | number>} PathSelector
 */

export type PathSelector = Array<string | number>;

/**
 * A string, number or symbol used to select a property in a state object.
 *
 * @example
 * ```typescript
 *  @Select('name') readonly name$: Observable<string>;
 * ```
 *
 * @typedef {string|number|symbol} PropertySelector
 */

export type PropertySelector = string | number | symbol;

/**
 * A function that selects a subset of a RootState object and returns it as an S object.
 *
 * @example
 * ```typescript
 *  @Select(store => store.name || 'new name') readonly name$: Observable<string>;
 * ```
 *
 * @template RootState - The type of the root state object.
 * @template S - The type of the selected subset of the RootState object.
 * @typedef {(s: RootState) => State} FunctionSelector
 * @param {RootState} state - The root state object to select from.
 * @returns {State} The selected subset of the root state object.
 */

export type FunctionSelector<RootState, State> = ((state: RootState) => State);

/**
 * A selector used to select a property or a subset of a RootState object.
 *
 * @template RootState - The type of the root state object.
 * @template State - The type of the selected subset of the RootState object.
 * @typedef {PropertySelector|PathSelector|FunctionSelector<RootState, State>} Selector
 */

export type Selector<RootState, State> = PropertySelector | PathSelector | FunctionSelector<RootState, State>;

/**
 * A function used to compare two state objects for equality.
 *
 * @example
 * ```typescript
 * const customCompare: Comparator = (x: any, y: any) => {
 *     return x.id === y.id
 * }
 *
 * @Select(selector, customCompare)
 * ```
 *
 * @typedef {(state: any, newState: any) => boolean} Comparator
 * @param {*} state - The original state object.
 * @param {*} newState - The new state object.
 * @returns {boolean} Whether the two state objects are equal.
 */

export type Comparator = (state: any, newState: any) => boolean;

/**
 * A function used to transform a store of type Observable<RootState> to type Observable<FragmentStore>.
 *
 * @template RootState - The type of the root state object.
 * @template FragmentStore - The type of the transformed state object.
 * @typedef {(store$: Observable<RootState>, scope: any) => Observable<FragmentStore>} Transformer
 * @param {Observable<RootState>} store$ - The root state store to transform.
 * @param {any} scope - The scope of the transformation.
 * @returns {Observable<FragmentStore>} The transformed store.
 */

export type Transformer<RootState, FragmentStore> = (store$: Observable<RootState>, scope: any) => Observable<FragmentStore>;
