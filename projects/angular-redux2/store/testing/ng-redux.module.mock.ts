/**
 * Import from angular
 */

import { NgModule } from '@angular/core';

/**
 * Import angular-redux2
 */

import { DevToolsExtension, NgRedux } from '@angular-redux2/store';

/**
 * Mocks
 */

import { MockNgRedux } from './services/ng-redux.service.mock';
import { MockDevToolsExtension } from './services/dev-tools.service.mock';

/**
 * Mock factory
 */

const mockNgRedux = MockNgRedux.store;

export function _mockNgReduxFactory() {
    return mockNgRedux;
}

/**
 * NgRedux module
 */

@NgModule({
    imports: [],
    providers: [
        { provide: NgRedux, useFactory: _mockNgReduxFactory  },
        { provide: DevToolsExtension, useClass: MockDevToolsExtension },
    ],
})
export class MockNgReduxModule {
}
