/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { UnknownAction } from 'redux';

/**
 * The static side of a class that {@link Action} registers action creators on.
 *
 * @since 6.0.0
 */

interface ActionTargetInterface {
    /**
     * The class name, which prefixes every action type the class handles unless `namespace` is set.
     *
     * @since 6.0.0
     */

    name: string;

    /**
     * The explicit prefix of the action types, which survives a minifier that renames classes.
     *
     * @since 6.0.0
     */

    namespace?: string;

    /**
     * The action creators registered so far, keyed by method name.
     *
     * @since 6.0.0
     */

    actions?: Record<string, (payload?: unknown) => UnknownAction>;
}

/**
 * Generates an action creator for a reducer method.
 *
 * @param target - The prototype of the reducer class
 * @param functionName - The name of the decorated method
 *
 * @remarks
 * The decorator adds a creator under `functionName` to the static `actions` map of the class,
 * creating a map of its own when the class has none, so two reducer classes never share their creators.
 * The creator builds an action of type `namespace/functionName`, where the namespace is the static `namespace`
 * of the class, or its name when that is not set.
 * That is the type that {@link AbstractReducer.createReducer} routes back to the method.
 * The namespace is read when the creator runs, so a static `namespace` field set after the decorators still applies.
 * The payload is attached whenever the creator receives one, including falsy values such as `0`, `false`, and `''`.
 * The decorated method itself is left unchanged.
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
 * AuthReducer.actions.login();      // { type: 'AuthReducer/login' }
 * ```
 *
 * @see ReducerActionsType
 * @see AbstractReducer
 *
 * @since 5.0.0
 */

export const Action = (target: object, functionName: string): void => {
    const TargetClass = <ActionTargetInterface> <unknown> target.constructor;

    if (!Object.hasOwn(TargetClass, 'actions') || !TargetClass.actions) {
        TargetClass.actions = {};
    }

    TargetClass.actions[functionName] = (payload?: unknown): UnknownAction => {
        const action: UnknownAction = {
            type: `${ TargetClass.namespace ?? TargetClass.name }/${ functionName }`
        };

        if (payload !== undefined) {
            action['payload'] = payload;
        }

        return action;
    };
};
