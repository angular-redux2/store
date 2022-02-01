/**
 * Imports third-party libraries
 */

import { AnyAction } from 'redux';

/**
 * This descriptor allows converting a method in a class to a function in a reducer
 * Use it above a mouthed you would like to convert to a reducer function like so:
 *
 * ```typescript
 * @Action(IS_LOGIN)
 * isLogin(state: Auth, action: AnyAction) {
 *     return { isLoggedIn: !state.isLoggedIn };
 * }
 * ```
 *
 * @param type - action type.
 */

export const Action = (type: string) => (target: any, propertyKey: string): void => {
    if (!target.map) {
        target.map = new Map();
    }

    target.map.set(type, propertyKey);
};

/**
 * This utility method takes a class and converts it to a reducer
 * It allows writing a class to allow easy usability
 *
 * ```typescript
 * class Reducer {
 *     @Action(IS_LOGIN)
 *     isLogin(state: Auth, action: AnyAction) {
 *         return { isLoggedIn: !state.isLoggedIn };
 *     }
 * }
 *
 * export const authReducer = createReducerFromClass(Reducer, AUTH_INITIAL_STATE);
 * ```
 *
 * @param reducer - reducer pre-class.
 * @param initialState - the initial state.
 */

export function createReducerFromClass<State>(reducer: new () => any, initialState: State) {
    const instance = Object.create(reducer.prototype);

    return (lastState: State = initialState, action: AnyAction): State => {
        const fn = instance.map.get(action.type);

        if (fn) {
            return instance[fn].apply(instance, [ lastState, action ]);
        }

        return lastState;
    };
}
