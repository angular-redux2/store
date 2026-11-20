/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Reducer } from 'redux';
import type { EnvironmentProviders } from '@angular/core';
import type { NgReduxConfigInterface } from '../interfaces/provider.interface';

/**
 * Imports
 */

import { NgRedux } from '../services/ng-redux.service';
import { freezeState } from '../components/freeze.component';
import { DevToolsExtension } from '../services/dev-tool.service';
import {
    inject, makeEnvironmentProviders, makeStateKey, provideAppInitializer, provideEnvironmentInitializer, TransferState
} from '@angular/core';

/**
 * The key under which the `transferState` option carries the state from the server to the browser.
 *
 * @since 6.0.0
 */

const STATE_KEY = makeStateKey<unknown>('@angular-redux2/store');

/**
 * Configures the store when the application starts.
 *
 * @typeParam State - The type of the root state
 * @param config - The reducer, initial state, middleware, enhancers, and DevTools setting of the store
 * @returns The providers to add to the application config
 *
 * @remarks
 * It replaces importing {@link NgReduxModule} and calling {@link NgRedux.configureStore} from an app initializer.
 * The store is configured before the first component renders, so decorated members can read it at once.
 * The DevTools enhancer is added last, after the configured `enhancers`, and only when the extension is installed.
 * The {@link freezeState} enhancer, when `freeze` is set, comes first.
 * With `transferState`, the browser starts from the state that server-side rendering left in the page.
 *
 * @example
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *     providers: [
 *         provideNgRedux({ reducer: rootReducer, initialState: INITIAL_STATE, devTools: isDevMode() })
 *     ]
 * };
 * ```
 *
 * @see NgReduxConfigInterface
 * @see NgRedux.configureStore
 *
 * @since 6.0.0
 */

export function provideNgRedux<State>(config: NgReduxConfigInterface<State>): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideAppInitializer(() => {
            const { reducer, initialState, middleware = [], enhancers = [], devTools, freeze, transferState } = config;
            const ngRedux = inject(NgRedux<State>);
            const transfer = transferState ? inject(TransferState) : undefined;
            const devToolsEnhancer = devTools
                ? inject(DevToolsExtension).enhancer(devTools === true ? undefined : devTools)
                : null;

            // The server never holds the key, and onSerialize runs only when it renders the page.
            transfer?.onSerialize(STATE_KEY, () => ngRedux.getState());
            ngRedux.configureStore(reducer, <State> (transfer?.get(STATE_KEY, initialState) ?? initialState), middleware, [
                ...freeze ? [ freezeState() ] : [],
                ...enhancers,
                ...devToolsEnhancer ? [ devToolsEnhancer ] : []
            ]);
        })
    ]);
}

/**
 * Adds a feature reducer to the store when the injector of a lazy route or component is created.
 *
 * @param key - The top-level key of the state that the reducer owns
 * @param reducer - The reducer of that key
 * @returns The providers to add to the route or component
 *
 * @remarks
 * It calls {@link NgRedux.addReducer} from an environment initializer,
 * so the reducer is loaded with the code of the route and the root reducer does not have to know about it.
 * Its state stays in the store after the route is left, and visiting the route again leaves it as it is.
 *
 * @example
 * ```ts
 * export const routes: Routes = [{
 *     path: 'todos',
 *     loadComponent: () => import('./todos.component'),
 *     providers: [ provideNgReduxFeature('todos', todosReducer) ]
 * }];
 * ```
 *
 * @see NgRedux.addReducer
 *
 * @since 6.0.0
 */

export function provideNgReduxFeature(key: string, reducer: Reducer): EnvironmentProviders {
    return makeEnvironmentProviders([ provideEnvironmentInitializer(() => inject(NgRedux).addReducer(key, reducer)) ]);
}
