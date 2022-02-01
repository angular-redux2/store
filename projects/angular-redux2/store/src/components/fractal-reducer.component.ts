/**
 * Imports third-party libraries
 */

import { AnyAction, Reducer } from 'redux';

/**
 * Import components
 */

import { get, set } from './object.component';

/**
 * Import interfaces
 */

import { PathSelector } from '../interfaces/store.interface';

/**
 * FractalReducerComponent
 */

export class FractalReducerComponent {

    /**
     * Map of fractal-reducer
     */

    private static map: {
        [id: string]: Reducer<any, AnyAction>
    };

    /**
     * Enable sub store reducer
     */

    static enable(rootReducer: Reducer<any, AnyAction>): Reducer<any, AnyAction> {
        this.map = {};

        return this.composeReducers(this.rootReducer, rootReducer);
    }

    /**
     * Root Reducer that route between sub-reducer and reducer.
     *
     * @param state - current state.
     * @param action - the current action.
     */

    static rootReducer(
        state: any,
        action: AnyAction & { '@angular-redux2::fractalKey'?: string }
    ): Object {
        const fractalKey = action['@angular-redux2::fractalKey'];
        const fractalPath = fractalKey ? JSON.parse(fractalKey) : [];
        const localReducer = FractalReducerComponent.map[fractalKey || ''];

        if (fractalKey && localReducer) {
            return set(state, fractalPath, localReducer(get(state, fractalPath), action));
        }

        if (action.type === '&_RECEIVE_INIT_STATE') {
            return action['payload'];
        }

        return state;
    }

    /**
     * Register local reducer for part of the store.
     *
     * @param basePath - select part of the root store for local reducer.
     * @param localReducer - the reducer function
     */

    static registerReducer(
        basePath: PathSelector,
        localReducer: Reducer<any, AnyAction>
    ): void {
        const existingFractalReducer = this.map[JSON.stringify(basePath)];
        if (existingFractalReducer && existingFractalReducer !== localReducer) {
            throw new Error(
                `attempt to overwrite fractal reducer for basePath ${ basePath }`
            );
        }

        this.map[JSON.stringify(basePath)] = localReducer;
    }

    /**
     * Replaces the reducer currently used by the store to calculate the state.
     * You might need this if your app implements code splitting, and you want to load some reducers dynamically.
     * You might also need this if you implement a hot reloading mechanism for Redux.
     *
     * @param basePath - base part of sub store.
     * @param nextLocalReducer - reducer of the same store.
     */

    static replaceReducer(
        basePath: PathSelector,
        nextLocalReducer: Reducer<any, AnyAction>
    ): void {
        this.map[JSON.stringify(basePath)] = nextLocalReducer;
    }

    /**
     * reduces an action by applying a sequence of delegate reducers.
     *
     * The `reduce()` method executes a user-supplied “reducer” callback function on each element of the array,
     * in order, passing in the return value from the calculation on the preceding element.
     * The final result of running the reducer across all elements of the array is a single value.
     *
     * @param reducers - array of reducers.
     */

    private static composeReducers(...reducers: Array<Reducer<any, AnyAction>>): Reducer<any, AnyAction> {
        return (state: any, action: AnyAction) => {
            return reducers.reduce((subState, reducer) => reducer(subState, action), state);
        };
    }
}
