/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { UnknownAction, Reducer } from 'redux';

/**
 * Imports
 */

import { LOCAL_REDUCER_KEY } from '../interfaces/fractal.interface';

/**
 * Scopes the `Select`, `Select$`, and `Dispatch` decorators of a class to a substore.
 *
 * @param reducer - The local reducer of the substore
 * @returns A class decorator that stores the reducer on the class constructor
 *
 * @remarks
 * The decorator only stores the reducer under {@link LOCAL_REDUCER_KEY}.
 * The substore itself is created lazily, the first time a decorated member reads the store,
 * from the path that the `basePath` function of the instance returns.
 * The function is called without `this`, so declare it as an arrow function field rather than a method.
 * While `basePath` is missing or returns a falsy value, the members use the root store.
 * A new path creates a new substore, while an unchanged path reuses the cached one.
 * `Select` members select from that substore and `Dispatch` members dispatch through it.
 *
 * @example
 * ```ts
 * @Substore(userReducer)
 * class UserComponent {
 *     @Input() userId: string;
 *     @Select('name') readonly name$: Observable<string>;
 *
 *     basePath = (): PathSelectorType | null => this.userId ? [ 'users', this.userId ] : null;
 * }
 * ```
 *
 * @see Select
 * @see Dispatch
 * @see DecoratorFlagComponent
 *
 * @since 5.0.0
 */

export function Substore<State>(reducer: Reducer<State, UnknownAction>): ClassDecorator {
    return function decorate(constructor: object): void {
        (<Record<PropertyKey, unknown>> constructor)[LOCAL_REDUCER_KEY] = reducer;
    };
}
