/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Reducer } from 'redux';
import type { EnvironmentProviders } from '@angular/core';
import type { NgReduxConfigInterface } from '@interfaces/provider.interface';

/**
 * Imports
 */

import { NgRedux } from '@services/ng-redux.service';
import { STATE_KEY } from '@ng-redux/constants/ng-redux.constant';
import { inject, makeEnvironmentProviders, provideEnvironmentInitializer, TransferState } from '@angular/core';

/**
 * Provides the root store to the application.
 *
 * @typeParam State - The type of the root state
 * @param config - The options that create the store
 * @returns The providers to add to the application config
 *
 * @remarks
 * Angular creates the store the first time something injects it, and the store is ready at that moment,
 * so no initializer has to run before the first component.
 * With `transferState`, the server writes the final state into the page,
 * and the browser starts from that state instead of `initialState`.
 *
 * @example
 * ```ts
 * bootstrapApplication(App, {
 *     providers: [
 *         provideNgRedux({ reducer: rootReducer, initialState: INITIAL_STATE, devTools: isDevMode() })
 *     ]
 * });
 * ```
 *
 * @see NgReduxConfigInterface
 *
 * @since 6.0.0
 */

export function provideNgRedux<State>(config: NgReduxConfigInterface<State>): EnvironmentProviders {
    return makeEnvironmentProviders([
        {
            provide: NgRedux,
            useFactory: (): NgRedux<State> => {
                if (!config.transferState) return new NgRedux(config);

                const transfer = inject(TransferState);
                const ngRedux = new NgRedux({ ...config, initialState: <State> transfer.get(STATE_KEY, config.initialState) });
                transfer.onSerialize(STATE_KEY, () => ngRedux.getState());

                return ngRedux;
            }
        }
    ]);
}

/**
 * Adds a reducer for one key of the root state when its injector starts, such as the injector of a lazy route.
 *
 * @typeParam State - The type of the feature state
 * @param slice - The key and the reducer, such as a slice from `createSlice`
 * @returns The providers to add to the route
 *
 * @remarks
 * The feature state appears under `slice.name` as soon as the route loads,
 * and the feature reducer keeps running after the route closes, so the state survives a later visit.
 * Providing the same slice again does nothing.
 *
 * @example
 * ```ts
 * const routes: Routes = [
 *     { path: 'todos', loadComponent: () => import('./todos'), providers: [ provideNgReduxFeature(todos) ] }
 * ];
 * ```
 *
 * @see NgRedux.addReducer
 *
 * @since 6.0.0
 */

export function provideNgReduxFeature<State>(slice: { name: string; reducer: Reducer<State> }): EnvironmentProviders {
    return makeEnvironmentProviders([ provideEnvironmentInitializer(() => inject(NgRedux).addReducer(slice.name, slice.reducer)) ]);
}
