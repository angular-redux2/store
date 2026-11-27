/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Provider } from '@angular/core';

/**
 * Imports
 */

import { NgRedux } from '@angular-redux2/store';
import { MockNgRedux } from '../services/ng-redux.service.mock';

/**
 * Provides a {@link MockNgRedux} in place of the real store.
 *
 * @typeParam State - The type of the root state
 * @param initialState - The state that the mock starts from
 * @returns The providers to add to the test module
 *
 * @remarks
 * Code that injects `NgRedux` receives the mock, and the test injects the same instance as `MockNgRedux`
 * to set the state and check the dispatched actions.
 * It replaces `provideNgRedux`, so the application reducers never run in the test.
 *
 * @example
 * ```ts
 * TestBed.configureTestingModule({
 *     imports: [ Counter ],
 *     providers: [ provideMockNgRedux<AppState>({ counter: 0 }) ]
 * });
 *
 * TestBed.inject(MockNgRedux) === TestBed.inject(NgRedux); // true
 * ```
 *
 * @see MockNgRedux
 *
 * @since 6.0.0
 */

export function provideMockNgRedux<State>(initialState?: State): Array<Provider> {
    return [
        { provide: NgRedux, useFactory: (): MockNgRedux<State> => new MockNgRedux<State>(initialState) },
        { provide: MockNgRedux, useExisting: NgRedux }
    ];
}
