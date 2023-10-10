/**
 * Import third-party types
 */

import { AnyAction } from 'redux';

/**
 * A decorator function that generates an action creator for a specific function.
 *
 * @example
 * ```typescript
 * export class RoutesReducer extends AbstractReducer {
 *
 *     // optional static var to allow to add type's for auto-complete
 *     // ActionPayload< payload interface / state >
 *     static override actions: ActionPayload<RoutesReducer>;
 *
 *      @Action
 *      isLogin(state: Auth, action: AnyAction): Auth {
 *          return { isLoggedIn: !state.isLoggedIn };
 *      }
 * }
 *
 * public isLogin() {
 *     this.ngRedux.dispatch(
 *         RoutesReducer.actions.isLogin()
 *     );
 * }
 * ```
 *
 * @param {*} target - The target object on which to apply the decorator.
 * @param {string} functionName - The name of the function to create the action for.
 * @constructor
 */

export const Action = (target: any, functionName: string): void => {
    const TargetClass = target.constructor;
    const actionName = `${TargetClass.name }/${functionName}`;

    if (!TargetClass.actions) {
        TargetClass.actions = {};
    }

    TargetClass.actions[functionName] = (payload: any) => {
        const action: AnyAction = {
            type: actionName
        };

        if (payload) {
            action['payload'] = payload;
        }

        return action;
    };
};
