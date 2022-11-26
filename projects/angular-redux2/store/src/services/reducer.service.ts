/**
 * Import third-party libraries
 */

import { AnyAction, Reducer } from 'redux';

/**
 * Components
 */

import { get, set } from '../components/object.component';

/**
 * Interfaces
 */

import { FractalKey } from '../interfaces/store.interface';
import { ACTION_KEY } from '../interfaces/fractal.interface';
import { RECEIVE_INIT_STATE } from '../interfaces/sync.interface';

/**
 * Holding the root reducer that use to activate the correct reducer.
 * and wrap state with proxy that take care in the immutable state.
 *
 * @example
 * ```typescript
 *
 * @Action
 * isLogin(state: Auth, action: AnyAction) {
 *     state.isLoggedIn = true;
 * }
 *
 * // or
 *
 * @Action
 * isLogin(state: Auth, action: AnyAction) {
 *     state.isLoggedIn = true;
 *
 *     return state;
 * }
 *
 * //old-way
 * export function authReducer(state: Auth, action: AnyAction): Auth {
 *     const newState = { ...state };
 *     switch (action.type) {
 *         case IS_LOGIN:
 *              return { isLoggedIn: !state.isLoggedIn };
 *     }
 *
 *     return state;
 * }
 * ```
 */

export class ReducerService {

    /**
     * singleton instance
     */

    private static instance: ReducerService;

    /**
     * Map of register sub-store reducer
     * A subStore expose the same interface as the main Redux store (dispatch, select, etc.),
     * but is rooted at a particular path in your global state.
     */

    private readonly map: {
        [id: string]: Reducer
    } = {};

    /**
     * The Singleton's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */

    private constructor() {}

    /**
     * The static method that controls the access to the singleton instance.
     *
     * This implementation let you subclass the Singleton class while keeping
     * just one instance of each subclass around.
     *
     * @return ReducerService
     */

    public static getInstance(): ReducerService {
        if (!ReducerService.instance) {
            ReducerService.instance = new ReducerService();
        }

        return ReducerService.instance;
    }

    /**
     * Compose root reducer with sub-store reducer.
     */

    composeRoot(rootReducer: Reducer): Reducer {
        return this.composeReducers(this.rootReducer.bind(this), rootReducer);
    }

    /**
     * Root Reducer that route between sub-reducer (local reducer for part of the store) and reducer.
     *
     * @param state - current state.
     * @param action - the current action.
     *
     * @return Object
     */

    rootReducer(
        state: any,
        action: AnyAction & { ACTION_KEY?: FractalKey }
    ): Object {
        const fractalKey = action[ACTION_KEY];

        if (fractalKey) {
            const fractalPath = fractalKey.path;
            const localReducer = this.map[fractalKey.hash];

            if (fractalPath && localReducer) {
                return set(state, fractalPath, localReducer(get(state, fractalPath), action));
            }
        }

        if (action.type === RECEIVE_INIT_STATE) {
            return action['payload'];
        }

        return state;
    }

    /**
     * Register local reducer for part of the store.
     *
     * @param hashReducer - hash of reducer function for detection.
     * @param localReducer - the reducer function
     *
     * @return void
     */

    registerReducer(
        hashReducer: number,
        localReducer: Reducer
    ): void {
        const existingFractalReducer = this.map[hashReducer];

        if (!existingFractalReducer) {
            this.map[hashReducer] = localReducer;
        }
    }

    /**
     * replaceReducer function, which replaces the current active root reducer function with a new root reducer function.
     * Calling it will swap the internal reducer function reference, and dispatch an action.
     * You might need this if your app implements code splitting, and you want to load some reducers dynamically.
     * You might also need this if you implement a hot reloading mechanism for Redux.
     *
     * @param hashReducer - hash of reducer function for detection.
     * @param nextLocalReducer - reducer of the same store.
     *
     * @return void
     */

    replaceReducer(
        hashReducer: number,
        nextLocalReducer: Reducer
    ): void {
        if (this.map[hashReducer]) {
            this.map[hashReducer] = nextLocalReducer;
        }
    }

    /**
     * Hash signature of string.
     * @param string - string to hash sign
     *
     * @return number
     */

    hashSignature(string: string): number {
        let hash: number = 0;
        let index = string.length;

        while (index > 0) {
            hash = (hash << 5) - hash + string.charCodeAt(--index) | 0;
        }

        return hash;
    }

    /**
     * reduces an action by applying a sequence of delegate reducers.
     *
     * The `reduce()` method executes a user-supplied “reducer” callback function on each element of the array,
     * in order, passing in the return value from the calculation on the preceding element.
     * The final result of running the reducer across all elements of the array is a single value.
     *
     * @param reducers - array of reducers.
     *
     * @return Reducer
     */

    private composeReducers(...reducers: Array<Reducer>): Reducer {
        return (state: any, action: AnyAction) => {
            return reducers.reduce(
                (previousState, reducer) => {
                    let result = previousState;
                    const proxyState = this.proxyState(previousState);
                    const newState = reducer(proxyState.proxy, action);

                    if (proxyState.proxy._isChanged) {
                        result = this.clean(proxyState.proxy._target);
                    } else if (newState && !newState._isProxy) {
                        result = this.clean(newState);
                    }

                    proxyState.revoke();

                    return result;
                }, state
            );
        };
    }

    private proxyHandler(): Object {
        const handler = {
            is_change: false,
            get: function (target: any, key: string): any {
                switch (key) {
                    case '_target':
                        return target;

                    case '_isProxy':
                        return true;

                    case '_isChanged':
                        return this.is_change;

                    default:
                        if (typeof target[key] === 'object' && !target[key]._isProxy) {
                            target[key] = new Proxy({ ...target[key] }, handler);
                        }

                        return target[key];
                }
            },

            /**
             * Set value into object
             */

            set: function (target: any, key: string, value: any): boolean {
                this.is_change = true;
                target[key] = value;

                return true;
            }
        };

        return handler;
    }

    /**
     * Create proxy state
     */

    private proxyState(state: any): { proxy: any; revoke: () => void; } {
        return Proxy.revocable({ ...state }, this.proxyHandler());
    }

    /**
     * Remove proxy from an object
     */

    private clean(object: any): object {
        if (typeof object !== 'object' || object === null) {
            return object; // Return the value if is not an object.
        }

        for (let key in object) {
            if (object[key]['_isProxy']) {
                object[key] = object[key]['_target'];
            }

            // Recursively (deep) clean for nested objects, including arrays
            this.clean(object[key]);
        }

        return object;
    }
}
