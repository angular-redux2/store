/**
 * Imports
 */

import { NgModule } from '@angular/core';
import { MockNgRedux } from '../services/ng-redux.service.mock';
import { NgRedux, DevToolsExtension } from '@angular-redux2/store';
import { MockDevToolsExtension } from '../services/dev-tool.service.mock';

/**
 * Returns the shared {@link MockNgRedux} for the `NgRedux` provider of {@link MockNgReduxModule}.
 *
 * @returns The shared mock store
 *
 * @remarks
 * Every injection of `NgRedux` therefore receives the same mock that the static `MockNgRedux` methods configure.
 *
 * @hidden
 * @since 5.0.0
 */

export function mockNgReduxFactory(): MockNgRedux<unknown> {
    return MockNgRedux.store;
}

/**
 * The test module that replaces `NgRedux` and `DevToolsExtension` with their mocks.
 *
 * @remarks
 * Import it in place of {@link NgReduxModule} in a test bed.
 * Injecting `NgRedux` then yields the shared {@link MockNgRedux},
 * so the stubs set up through its static methods reach the code that selects through the injected store.
 * The decorators read `NgRedux.store` instead, which the remarks on {@link MockNgRedux} cover.
 *
 * @example
 * ```ts
 * TestBed.configureTestingModule({ imports: [ MockNgReduxModule ], declarations: [ CounterComponent ] });
 *
 * MockNgRedux.getSelectorStub('count').next(3); // CounterComponent sees 3
 * ```
 *
 * @see MockNgRedux
 *
 * @since 5.0.0
 */

@NgModule({
    imports: [],
    providers: [
        { provide: NgRedux, useFactory: mockNgReduxFactory  },
        { provide: DevToolsExtension, useClass: MockDevToolsExtension }
    ]
})
export class MockNgReduxModule {
}
