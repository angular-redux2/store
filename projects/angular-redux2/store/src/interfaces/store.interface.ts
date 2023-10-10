/**
 * Import third-party types
 */

import { Action } from 'redux';
import { Observable } from 'rxjs';

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

/**
 * An action with a payload property.
 * @template Payload The type of the payload property.
 */

export interface PayloadAction<Payload = any> extends Action {
    payload?: Payload;
    [extraProps: string]: any;
}

/**
 * Extracts the argument types of a function type `T`.
 * If `T` is not a function type, returns never.
 *
 * @example
 * ```typescript
 *  type Fn = (a: string, b: number) => boolean;
 *  type ArgsOfFn = Args<Fn>; // [string, number]
 * ```
 *
 * @typeparam T - The function type from which to extract argument types.
 * @returns A tuple of the argument types of `T`.
 */

type Args<T> = T extends (...args: infer arg) => any ? arg : never;

/**
 * Defines a type for an action creator function that may accept a payload of a given type, which is optional.
 *
 * @typeparam Payload - The type of the action's payload, which defaults to `undefined`.
 * @param payload - The optional payload for the action.
 * @returns An object of type `AnyAction` that represents the dispatched action.
 */

export type ActionCreator<Payload = undefined> = (payload?: Payload) => PayloadAction;

/**
 * The ReducerActions type defines a type that helps to generate auto-complete for reducer action functions.
 * It is used as a property of a reducer class that extends AbstractReducer.
 *
 * The type is a mapped type that iterates through each key of the generic type T
 * and creates a property with that same key. The value of each property is a function type called ActionPayload,
 * which takes an optional payload and returns an AnyAction.
 * The payload type is inferred from the second argument of the function type at that key in T.
 *
 * @example
 * ```typescript
 * export class MyReducer extends AbstractReducer {
 *   static actions: ReducerActions<MyReducer> = {
 *     someReducerFunction: (payload) => ({
 *       type: 'SOME_ACTION',
 *       payload,
 *     }),
 *   };
 *
 *   someReducerFunction(param1: string, param2: number): void {
 *     // Some reducer logic here
 *   }
 * }
 * ```
 */

export type ReducerActions<T> = {
    [K in keyof T]: ActionCreator<Args<T[K]>[1]>;
};
