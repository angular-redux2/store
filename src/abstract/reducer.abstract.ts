/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { UnknownAction, Reducer } from 'redux';

/**
 * The base class for a reducer written as a class with one method per action.
 *
 * @remarks
 * Each method decorated with `Action` handles the action that its generated creator builds,
 * and {@link AbstractReducer.createReducer} turns an instance into a plain Redux reducer.
 * A method receives the current state and the action payload, not the whole action.
 * A method returns the next state, and under {@link NgRedux} it may mutate the state that it receives instead,
 * since the store runs every reducer against a draft of the state.
 * Reach for it over a hand-written switch when each action maps to one piece of logic.
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
 * const authReducer = AuthReducer.createReducer<Auth>({ username: '' });
 * ngRedux.dispatch(AuthReducer.actions.login('ada')); // state becomes { username: 'ada' }
 * ```
 *
 * @see Action
 * @see ReducerActionsType
 *
 * @since 5.0.0
 */

export abstract class AbstractReducer {

    /**
     * The action creators that the `Action` decorator generated for this class.
     *
     * @remarks
     * The decorator adds one creator per decorated method, keyed by the method name.
     * Redeclare the field with {@link ReducerActionsType} in a subclass to type the creators and their payloads.
     *
     * @example
     * ```ts
     * class AuthReducer extends AbstractReducer {
     *     static override actions: ReducerActionsType<AuthReducer>;
     * }
     *
     * AuthReducer.actions.login('ada'); // { type: 'AuthReducer/login', payload: 'ada' }
     * ```
     *
     * @see ReducerActionsType
     *
     * @since 5.0.0
     */

    static actions: {
        [key: string]: (...args: Array<never>) => UnknownAction
    } = {};

    /**
     * The prefix of the action types that this class handles.
     *
     * @remarks
     * When it is not set, the class name is used, which a minifier that renames classes changes,
     * and which two classes of the same name share.
     * Set it in a production build so the action types stay stable.
     *
     * @example
     * ```ts
     * class AuthReducer extends AbstractReducer {
     *     static override namespace = 'auth';
     * }
     *
     * AuthReducer.actions.login('ada'); // { type: 'auth/login', payload: 'ada' }
     * ```
     *
     * @since 6.0.0
     */

    static namespace?: string;

    /**
     * Creates a Redux reducer that dispatches each action to the method of the same name.
     *
     * @typeParam State - The type of the state that the reducer manages
     * @param this - The reducer class, which must have a constructor without arguments
     * @param initialState - The state to use when the store passes `undefined`
     * @returns A Redux reducer backed by a new instance of the class
     *
     * @remarks
     * The reducer handles an action whose type is `namespace/method`, where the namespace is
     * the static `namespace` of the class or its name, and the method is one decorated with `Action`.
     * The method is called with the current state and the action payload.
     * A method that returns `undefined` keeps the current state.
     * Any other action, such as one with a bare `login` type or a method that is not decorated,
     * returns the state unchanged.
     *
     * @example
     * ```ts
     * const authReducer = AuthReducer.createReducer<Auth>({ username: '' });
     *
     * authReducer(undefined, { type: 'AuthReducer/login', payload: 'ada' }); // { username: 'ada' }
     * authReducer(undefined, { type: 'UNKNOWN' });                           // { username: '' }
     * ```
     *
     * @since 5.0.0
     */

    static createReducer<State = unknown>(
        this: Pick<typeof AbstractReducer, 'actions' | 'namespace'> & { name: string } & (new () => object),
        initialState: State
    ): Reducer<State> {
        const instance = new this();
        const prefix = `${ this.namespace ?? this.name }/`;
        const actions = Object.hasOwn(this, 'actions') ? this.actions ?? {} : {};

        return (lastState: State = initialState, action: UnknownAction): State => {
            const actionName = action.type.startsWith(prefix) ? action.type.slice(prefix.length) : '';
            const fn = (<Record<string, unknown>> instance)[actionName];

            if (!Object.hasOwn(actions, actionName) || typeof fn !== 'function') {
                return lastState;
            }

            const newState = (<(...args: Array<unknown>) => State | undefined> fn).apply(instance, [ lastState, action['payload'] ]);

            return newState !== undefined ? newState : lastState;
        };
    }
}
