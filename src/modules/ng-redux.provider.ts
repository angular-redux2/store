/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { EnvironmentProviders } from '@angular/core';
import type { NgReduxConfigInterface } from '../interfaces/provider.interface';

/**
 * Imports
 */

import { NgRedux } from '../services/ng-redux.service';
import { DevToolsExtension } from '../services/dev-tool.service';
import { inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';

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
            const { reducer, initialState, middleware = [], enhancers = [], devTools } = config;
            const devToolsEnhancer = devTools
                ? inject(DevToolsExtension).enhancer(devTools === true ? undefined : devTools)
                : null;

            inject(NgRedux<State>).configureStore(
                reducer,
                initialState,
                middleware,
                devToolsEnhancer ? [ ...enhancers, devToolsEnhancer ] : enhancers
            );
        })
    ]);
}
