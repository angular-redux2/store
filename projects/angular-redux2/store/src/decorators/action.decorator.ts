/**
 * Import third-party libraries
 */

import { AnyAction } from 'redux';

/**
 * This decorator generate dispatch action method for a reducer-class method.
 * If you set an actions static var with type this will generate with autocomplete.
 *
 * ```typescript
 * // Old style
 * this.ngRedux.dispatch({
 *     type: 'isLogin',
 *     payload: {
 *         name: 'test'
 *     }
 * });
 *
 * this.ngRedux.dispatch(
 *     RoutesReducer.actions.isLogin({
 *         name: 'test'
 *     });
 * );
 * ```
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
 * @param target - target reducer class instance.
 * @param functionName - function name as action name.
 */

export const Action = (target: any, functionName: string): void =>  {
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
