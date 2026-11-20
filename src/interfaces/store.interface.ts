/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Action } from 'redux';
import type { Observable } from 'rxjs';

/**
 * A list of keys and indexes that walks down the state tree.
 *
 * @remarks
 * Each entry selects one level, so `[ 'users', 0, 'name' ]` reads `state.users[0].name`.
 * The walk stops with `undefined` as soon as an intermediate value is not an object,
 * so a path through a missing branch yields `undefined` instead of throwing.
 * Reach for a path when the value sits more than one level deep and no computation is needed.
 *
 * @example
 * ```ts
 * class UserComponent {
 *     @Select([ 'users', 0, 'name' ]) readonly name$: Observable<string>;
 * }
 *
 * ngRedux.select([ 'users', 0, 'name' ]); // emits 'Ada' for { users: [ { name: 'Ada' } ] }
 * ```
 *
 * @see SelectorType
 * @see PropertySelectorType
 *
 * @since 6.0.0
 */

export type PathSelectorType = Array<string | number>;

/**
 * A single key that selects one top-level property of the state.
 *
 * @remarks
 * The property is read with a plain index, so a symbol key works as well as a string or number.
 * A falsy key such as `0` or `''` does not select a property.
 * The selector treats it as missing and emits the whole state instead.
 *
 * @example
 * ```ts
 * class CounterComponent {
 *     @Select('count') readonly count$: Observable<number>;
 * }
 *
 * ngRedux.select('count'); // emits 3 for { count: 3 }
 * ```
 *
 * @see SelectorType
 * @see PathSelectorType
 *
 * @since 6.0.0
 */

export type PropertySelectorType = string | number | symbol;

/**
 * A function that derives a value from the state.
 *
 * @typeParam RootState - The type of the state that the function receives
 * @typeParam State - The type of the value that the function returns
 *
 * @remarks
 * The store calls the function on every state change and passes its result through `distinctUntilChanged`,
 * so the observable emits only when the derived value changes.
 * Reach for a function when the value has to be computed or defaulted rather than read from a fixed path.
 *
 * @example
 * ```ts
 * class UserComponent {
 *     @Select((state: AppState) => state.name || 'guest') readonly name$: Observable<string>;
 * }
 * ```
 *
 * @see SelectorType
 *
 * @since 6.0.0
 */

export type FunctionSelectorType<RootState, State> = ((state: RootState) => State);

/**
 * Any of the three ways to select a value from the state.
 *
 * @typeParam RootState - The type of the state being selected from
 * @typeParam State - The type of the selected value
 *
 * @remarks
 * The store tells the forms apart at runtime: an array is a {@link PathSelectorType},
 * a function is a {@link FunctionSelectorType}, and anything else is a {@link PropertySelectorType}.
 * A missing or falsy selector selects the whole state.
 *
 * @example
 * ```ts
 * ngRedux.select('count');               // property
 * ngRedux.select([ 'user', 'name' ]);    // path
 * ngRedux.select(state => state.count);  // function
 * ngRedux.select();                      // the whole state
 * ```
 *
 * @see PathSelectorType
 * @see FunctionSelectorType
 * @see PropertySelectorType
 *
 * @since 6.0.0
 */

export type SelectorType<RootState, State> = PropertySelectorType | PathSelectorType | FunctionSelectorType<RootState, State>;

/**
 * A function that decides whether two selected values are equal.
 *
 * @typeParam T - The type of the selected values being compared
 *
 * @remarks
 * The store passes it to `distinctUntilChanged`, so returning `true` suppresses the emission.
 * Without a comparator, values are compared by reference.
 * Supply one when a selector builds a new object on every change but only some fields matter.
 *
 * @example
 * ```ts
 * const sameId: ComparatorType<User> = (previous, next) => previous.id === next.id;
 *
 * class UserComponent {
 *     @Select('user', sameId) readonly user$: Observable<User>;
 * }
 * ```
 *
 * @see SelectorType
 *
 * @since 6.0.0
 */

export type ComparatorType<T = unknown> = (previous: T, next: T) => boolean;

/**
 * A function that turns the observable of a selection into a derived observable.
 *
 * @typeParam RootState - The type of the value that the selection emits
 * @typeParam FragmentStore - The type of the value that the derived observable emits
 *
 * @remarks
 * A transformer is a {@link FunctionSelectorType} that works on observables instead of values,
 * so it can debounce, combine, or switch over the selection.
 * The `Select$` decorator passes the decorated instance as `scope`,
 * and the derived observable still goes through `distinctUntilChanged` with the optional comparator.
 *
 * @example
 * ```ts
 * const debounceAndTriple: TransformerType<number, number> = (store$) => store$.pipe(
 *     debounceTime(300),
 *     map(value => value * 3)
 * );
 *
 * class CounterComponent {
 *     @Select$('count', debounceAndTriple) readonly tripled$: Observable<number>;
 * }
 * ```
 *
 * @see Select$
 *
 * @since 6.0.0
 */

export type TransformerType<RootState, FragmentStore> = (store$: Observable<RootState>, scope: unknown) => Observable<FragmentStore>;

/**
 * A Redux action that may carry a `payload`.
 *
 * @typeParam Payload - The type of the payload
 *
 * @remarks
 * The action creators that the `Action` decorator generates return this shape.
 * The index signature keeps the type open, so an action may carry other properties alongside the payload.
 *
 * @example
 * ```ts
 * const action: PayloadActionInterface<string> = { type: 'AuthReducer/login', payload: 'ada' };
 * ```
 *
 * @see ActionCreatorType
 *
 * @since 6.0.0
 */

export interface PayloadActionInterface<Payload = unknown> extends Action {
    /**
     * The data that the action carries to the reducer method.
     *
     * @remarks
     * The `Action` decorator sets it whenever the creator receives an argument other than `undefined`,
     * so falsy values such as `0`, `false`, and `''` are kept.
     *
     * @example
     * ```ts
     * AuthReducer.actions.login('ada').payload; // 'ada'
     * ```
     *
     * @since 5.0.0
     */

    payload?: Payload;

    /**
     * Any other property that the action carries.
     *
     * @example
     * ```ts
     * const action: PayloadActionInterface = { type: 'SAVE', meta: { optimistic: true } };
     * ```
     *
     * @since 5.0.0
     */

    [extraProps: string]: unknown;
}

/**
 * The tuple of parameter types of the function type `T`, or `never` for a non-function.
 *
 * @typeParam T - The function type to read the parameters from
 *
 * @remarks
 * {@link ReducerActionsType} uses it to read the payload type from the second parameter of a reducer method.
 *
 * @example
 * ```ts
 * type Params = ArgsType<(state: Auth, payload: string) => Auth>; // [ Auth, string ]
 * ```
 *
 * @since 5.0.0
 */

type ArgsType<T> = T extends (...args: infer arg) => unknown ? arg : never;

/**
 * A function that builds an action from its payload.
 *
 * @typeParam Payload - The type of the payload that the creator accepts
 *
 * @remarks
 * The `Action` decorator generates one creator per decorated reducer method.
 * The creator sets the `type` to `namespace/methodName` and attaches the payload unless it is `undefined`.
 * The payload argument is required when `Payload` excludes `undefined`, and optional otherwise,
 * so a method that takes no payload gets a creator that is called without arguments.
 *
 * @example
 * ```ts
 * const login: ActionCreatorType<string> = AuthReducer.actions.login;
 * const logout: ActionCreatorType = AuthReducer.actions.logout;
 *
 * login('ada'); // { type: 'AuthReducer/login', payload: 'ada' }
 * login();      // compile error: the payload is required
 * logout();     // { type: 'AuthReducer/logout' }
 * ```
 *
 * @see PayloadActionInterface
 * @see ReducerActionsType
 *
 * @since 6.0.0
 */

export type ActionCreatorType<Payload = undefined> = undefined extends Payload
    ? (payload?: Payload) => PayloadActionInterface<Payload>
    : (payload: Payload) => PayloadActionInterface<Payload>;

/**
 * The typed map of action creators for a reducer class.
 *
 * @typeParam T - The reducer class whose methods become action creators
 *
 * @remarks
 * Each method of `T` maps to an {@link ActionCreatorType} whose payload type is the second parameter of that method,
 * so redeclaring the static `actions` field with this type gives auto-completion and payload checks.
 * Properties that are not methods are left out.
 * The type only describes the creators, while the `Action` decorator creates them at runtime.
 *
 * @example
 * ```ts
 * class AuthReducer extends AbstractReducer {
 *     static override actions: ReducerActionsType<AuthReducer>;
 *
 *     @Action
 *     login(state: Auth, username: string): Auth {
 *         return { ...state, username };
 *     }
 * }
 *
 * AuthReducer.actions.login('ada'); // { type: 'AuthReducer/login', payload: 'ada' }
 * ```
 *
 * @see Action
 * @see ActionCreatorType
 * @see AbstractReducer
 *
 * @since 6.0.0
 */

export type ReducerActionsType<T> = {
    [K in keyof T as T[K] extends (...args: Array<never>) => unknown ? K : never]: ActionCreatorType<ArgsType<T[K]>[1]>;
};
