/**
 * Import third-party types
 */

import type { AnyAction, Reducer } from 'redux';

/**
 * Angular-redux
 */

import { shallowCopy } from '../components/object.component';

/**
 * Import types
 */

import type { Middleware } from '../interfaces/reducer.interface';

/**
 * Service class for composing reducers and applying middleware to them.
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
     * @returns {any} - The cleaned up object.
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
     * Uses a Proxy object to allow for "draft" modifications to the state object, and returns
     * the cleaned up state object without any Proxy objects after the modifications have been made.
     *
     * @private
     * @template State The type of the state object.
     * @param {State} state The base state object to be modified.
     * @param {any} action The action object to be applied to the state.
     * @param {Reducer} producer The reducer function that applies the action to the draft state.
     * @returns {State} The cleaned up state object after the modifications have been made.
     */

    private produce<State extends object>(state: State, action: any, producer: Reducer): any {
        let result = state;
        let hasChanged = false;

        const proxy = new Proxy(shallowCopy(state), {
            get(target: any, prop: string | symbol): any {
                if (prop === '_target') return target;
                if (prop === '_isProxy') return true;

                if (typeof target[prop] === 'object' && !target[prop]._isProxy) {
                    target[prop] = new Proxy(shallowCopy(target[prop]), this);
                }

                return target[prop];
            },
            set(target: any, prop: string | symbol, value: any): boolean {
                hasChanged = true;
                target[prop] = value;

                return true;
            },
        });

        const newState = producer(proxy, action);

        if (newState && !newState._isProxy){
            result = this.cleanup(newState);
        } else if (hasChanged) {
            result = this.cleanup(proxy._target);
        }

        return result;
    }
}
