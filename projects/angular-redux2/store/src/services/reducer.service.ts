/**
 * Import third-party types
 */

import type {AnyAction, Reducer} from 'redux';

/**
 * angular-redux2
 */

import {ACTION_KEY} from '../interfaces/fractal.interface';
import {get, set, shallowCopy} from '../components/object.component';

/**
 * angular-redux2 types
 */

import type {Middleware, NextMiddleware} from '../interfaces/reducer.interface';

/**
 * Service class for composing reducers and applying middleware to them.
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
     * The single instance of the `ReducerService` class.
     * @hidden
     */

    private static instance: ReducerService;

    /**
     * Holding current root reducer
     * @private
     */

    private rootReducer: Reducer;

    /**
     * A mapSubReducers is a map of Reducers indexed by their hash signatures.
     *
     * @private
     * @type {Object.<string, Reducer>}
     */

    private readonly mapSubReducers: {
        [id: string]: Reducer
    } = {};

    /**
     * Returns the single instance of the `Singleton` class.
     * If the instance has not yet been created, a new instance is created and returned.
     *
     * @returns {ReducerService} The single instance of the `Singleton` class
     */

    static getInstance(): ReducerService {
        if (!ReducerService.instance) {
            ReducerService.instance = new ReducerService();
        }

        return ReducerService.instance;
    }

    /**
     * Composes multiple reducers into a single reducer function and applies middleware to it.
     *
     * @param {Reducer} rootReducer - The root reducer function to compose.
     * @param {Middleware[]} [middlewares=[]] - An array of middleware functions to apply.
     * @returns {Reducer} - A new reducer function that applies the middleware chain to the root reducer.
     */

    composeReducers(rootReducer: Reducer, middlewares: Middleware[] = []): Reducer {
        this.rootReducer = rootReducer;

        const middlewareList = middlewares.concat([
            this.subStoreRootReducer.bind(this),
            (state: any, action: AnyAction) => {
                return this.produce(state, action, this.rootReducer);
            }
        ]);

        return (state: any, action: AnyAction): any => {
            return this.executeMiddlewareChain(state, action, middlewareList);
        };
    }

    /**
     * Replaces the root reducer function with a new reducer function.
     *
     * @param {Reducer} nextReducer - The new root reducer function to use.
     * @returns {void}
     */

    replaceReducer(nextReducer: Reducer): void {
        this.rootReducer = nextReducer;
    }

    /**
     * Calculates the hash signature of the given string using the djb2 algorithm.
     *
     * @param {string} string - The string to calculate the hash signature of.
     * @returns {number} - The calculated hash signature.
     */

    hashSignature(string: string): number {
        let hash = 0;
        let index = string.length;

        while (index > 0) {
            hash = (hash << 5) - hash + string.charCodeAt(--index) | 0;
        }

        return hash;
    }

    /**
     * Registers a local sub reducer with the Fractal Reducer Registry under the specified hash signature.
     * If a reducer is already registered under the same hash signature, the new reducer is not added.
     *
     * @param {number} hashReducer - The hash signature of the reducer to be registered.
     * @param {Reducer} localReducer - The local reducer to be registered.
     * @returns {void}
     */

    registerSubReducer(
        hashReducer: number,
        localReducer: Reducer
    ): void {
        const existingFractalReducer = this.mapSubReducers[hashReducer];

        if (!existingFractalReducer) {
            this.mapSubReducers[hashReducer] = localReducer;
        }
    }

    /**
     * Replaces a registered sub-reducer with a new one based on the hash signature.
     *
     * @param {number} hashReducer - The hash signature of the registered sub-reducer.
     * @param {Reducer} nextLocalReducer - The new sub-reducer to replace the existing one.
     * @returns {void}
     */

    replaceSubReducer(
        hashReducer: number,
        nextLocalReducer: Reducer
    ): void {
        if (this.mapSubReducers[hashReducer]) {
            this.mapSubReducers[hashReducer] = nextLocalReducer;
        }
    }

    private static shouldCreateProxyForProperty(property: any): boolean {
        return property != null
            && !(property instanceof Date)
            && typeof property === 'object'
            && !property._isProxy;
    }

    /**
     * The root reducer function for sub-stores.
     *
     * @private
     * @param {any} state - The current state of the sub-store.
     * @param {AnyAction} action - The current action dispatched to the sub-store.
     * @param {NextMiddleware} next - The next middleware to call.
     * @returns {void} If the sub-store state is not changed. If the sub-store state is changed, return the new state.
     */

    private subStoreRootReducer(state: any, action: AnyAction, next: NextMiddleware): AnyAction {
        const fractalKey = action[ACTION_KEY];

        if (fractalKey) {
            const fractalPath = fractalKey.path;
            const localReducer = this.mapSubReducers[fractalKey.hash];

            if (fractalPath && localReducer) {
                const fractalState = get(state, fractalPath);
                const newState = this.produce(fractalState, action, localReducer);

                if (newState !== fractalState) {
                    return set(state, fractalPath, newState);
                }
            }
        }

        return next(state, action);
    }

    /**
     * Executes the middleware chain for the current action and returns the new state.
     *
     * @private
     * @param {any} state - The current state of the store.
     * @param {AnyAction} action - The current action being dispatched.
     * @param {Middleware[]} middlewareList - An array of middlewares registered with the store.
     * @returns {any} - The new state of the store after executing the middleware chain.
     */

    private executeMiddlewareChain(state: any, action: AnyAction, middlewareList: Middleware[]): any {
        const middlewares = middlewareList.slice();

        function next(newState: any, newAction?: AnyAction): any {
            if (!newAction) {
                newAction = action;
            }

            // Get the next middleware function to execute
            const fn = middlewares.shift();

            if (!fn) {
                // No more middleware functions to execute
                return newState;
            }

            // Call the middleware function and pass it the next function to execute
            return fn(newState, newAction, next);
        }

        return next(state, action);
    }

    /**
     * Recursively removes all proxy-related properties from an object.
     *
     * @private
     * @param {any} object - The object to be cleaned up.
     * @returns {any} - The cleaned-up object.
     */

    private cleanup(object: any): any {
        for (const prop in object) {
            if (object[prop] && object[prop]._isProxy) {
                object[prop] = object[prop]._target;
            }

            if (typeof object[prop] === 'object') {
                this.cleanup(object[prop]);
            }
        }

        return object;
    }

    /**
     * Produces a new state object based on the given base state object and an action object.
     * Uses a Proxy object to allow for "draft" modifications to the state object, and return
     * the cleaned-up state object without any Proxy objects after the modifications have been made.
     *
     * @private
     * @template State The type of the state object.
     * @param {any} state The base state object to be modified.
     * @param {any} action The action object to be applied to the state.
     * @param {Reducer} reducer The reducer function that applies the action to the draft state.
     * @throws {Error} If the state is not object
     * @returns {any} The cleaned-up state object after the modifications have been made.
     */

    private produce<State extends object>(state: State, action: any, reducer: Reducer): any {
        const newState = shallowCopy(state);
        let hasChanged = false;

        if (typeof state !== 'object') {
            return reducer(state, action);
        }

        const proxy = new Proxy(newState, {
            get(target: any, prop: string | symbol, receiver: any): any {
                if (prop === '_target') return target;
                if (prop === '_isProxy') return true;

                if (ReducerService.shouldCreateProxyForProperty(target[prop])) {
                    const currentStack = receiver._stack || [];
                    (this as any)._stack = [...currentStack, prop];

                    target[prop] = new Proxy(target[prop], this);
                }

                return Reflect.get(target, prop, receiver);
            },
            set(target: any, prop: string | symbol, value: any, receiver: any): any {
                if (prop === 'length') {
                    return true;
                }

                hasChanged = true;

                const stack = shallowCopy((this as any)._stack || []);
                const lastObject = stack.pop();
                const parent = get(state, stack);
                parent[lastObject] = shallowCopy(parent[lastObject]);

                return Reflect.set(parent[lastObject], prop, value, receiver);
            },
        });

        const proxyState = reducer(proxy, action);

        if (proxyState && !proxyState._isProxy) {
            return this.cleanup(proxyState);
        }

        if (hasChanged) {
            return this.cleanup(newState);
        }

        return state;
    }
}
